import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';

import { getConfig } from './utils/config.util';
import { getProjectInfo, installDependencies, isPackageInstalled } from './utils/package.util';
import { fetchComponent, fetchComponentFile } from './utils/registry.util';

import { validateComponentName, validateDirectory } from './validation/data.validate';

/**
 * @description Add a component to the project.
 * @param {string} componentName - The name of the component to add.
 * @returns {Promise<void>} A promise that resolves when the component is added.
 */
export async function addComponent(componentName: string): Promise<void> {
	try {
		const cwd = process.cwd();

		/** Validate component name. */
		const validationSpinner = ora(' Validating...').start();

		if (!validateComponentName(componentName)) {
			validationSpinner.fail();
			console.log('❌ Component name is invalid');
			process.exit(1);
		}

		/** Get configuration. */
		const config = await getConfig(cwd);
		if (!config) {
			validationSpinner.fail();
			console.log('❌ Failed to get configuration! Please initialize SGX4U UI first');
			process.exit(1);
		}

		/** Get project information. */
		const projectInfo = await getProjectInfo(cwd);
		if (projectInfo.project === 'none') {
			console.log('❌ No supported project detected');
			process.exit(1);
		}

		validationSpinner.succeed();

		/** Start installing component. */
		const installingSpinner = ora(` Installing ${componentName}`).start();

		/** Search the component using the component name. */
		const component = await fetchComponent({ componentName, projectType: config.environment });

		if (!component) {
			installingSpinner.fail();
			console.log('❌ Failed to fetch component');
			process.exit(1);
		}

		/** Determine and normalize target UI directory. */
		const uiDirectory = config.uiDir;
		const normalizedUiDirectory = uiDirectory.replace(/^[./\\]+/, '');

		if (!normalizedUiDirectory || !validateDirectory(normalizedUiDirectory)) {
			installingSpinner.fail();
			console.log('❌ Invalid directory');
			process.exit(1);
		}

		/** Resolve base directory for UI components relative to project root. */
		const baseDirectory = path.join(cwd, normalizedUiDirectory);

		/** Collect all files to install (all files are pre-computed in registry). */
		const allFilesToInstall = new Map<string, { filePath: string; targetPath: string }>();
		const existingFiles: Array<string> = [];

		/** All files now have a direct path + outputPath in registry */
		const filesToProcess = component.files;

		/** Proceed with the installation. */
		for (const file of filesToProcess) {
			/** Compute target path from outputPath, avoiding duplicated "ui" segments. */
			const normalizedOutputPath = file.outputPath.replace(/^ui[\\/]/, '');
			const targetPath = path.join(baseDirectory, normalizedOutputPath);

			/** Check if file already exists */
			if (await fs.pathExists(targetPath)) {
				existingFiles.push(file.outputPath);
			} else {
				allFilesToInstall.set(file.outputPath, {
					filePath: file.path,
					targetPath,
				});
			}
		}

		/** Handle existing files. */
		if (existingFiles.length > 0) {
			installingSpinner.stop();
			console.log(`⚠️ Skipping existing files:`);
			existingFiles.forEach((file) => console.log(`  • ${file}`));
		}

		/** Install all files. */
		const installedFiles: Array<string> = [];

		for (const [relativePath, { filePath, targetPath }] of allFilesToInstall) {
			try {
				/** Download file from GitHub. */
				const content = await fetchComponentFile(filePath);
				if (!content) {
					installingSpinner.fail();
					console.log(`⚠️ Failed to fetch ${relativePath}`);
					process.exit(1);
				}

				await fs.ensureDir(path.dirname(targetPath));
				await fs.writeFile(targetPath, content, 'utf8');
				installedFiles.push(relativePath);
			} catch (error) {
				installingSpinner.fail();
				console.log(`⚠️ Failed to install ${relativePath}: ${error}`);
				process.exit(1);
			}
		}

		if (installedFiles.length === 0) {
			installingSpinner.succeed();
			console.log(`✔  ${componentName} is already up to date!`);
			return;
		}

		installingSpinner.succeed();

		/** Show installation summary. */
		console.log('📁 Added files:');
		installedFiles.forEach((file) => console.log(`  • ${file}`));

		/** Use pre-computed package dependencies from registry. */
		const allPackageDependencies = new Set(component.dependencies);

		/** Install missing dependencies if any. */
		if (allPackageDependencies.size > 0) {
			console.log('📦 Dependencies detected:');

			/** Check which dependencies are already installed. */
			const installedDependencies: Array<string> = [];
			const missingDependencies: Array<string> = [];

			for (const dependency of Array.from(allPackageDependencies)) {
				if (await isPackageInstalled({ packageName: dependency, cwd })) installedDependencies.push(dependency);
				else missingDependencies.push(dependency);
			}

			/** Show already installed dependencies. */
			if (installedDependencies.length > 0) {
				console.log('✔  Already installed dependencies:');
				installedDependencies.forEach((dep) => console.log(`    • ${dep}`));
			}

			/** Show missing dependencies. */
			if (missingDependencies.length > 0) {
				console.log('❌ Missing dependencies:');
				missingDependencies.forEach((dep) => console.log(`    • ${dep}`));

				const { installDeps } = await inquirer.prompt([
					{
						type: 'confirm',
						name: 'installDeps',
						message: `Auto install missing dependencies using ${projectInfo.packageManager}?`,
						default: true,
					},
				]);

				if (installDeps) {
					console.log(`📦 Installing missing dependencies using ${projectInfo.packageManager}...`);

					const dependencyInstalled = await installDependencies({
						cwd,
						packageManager: projectInfo.packageManager,
						dependencies: missingDependencies,
					});

					if (dependencyInstalled) {
						console.log('✔  Missing dependencies installed successfully');
					} else {
						console.log('❌ Failed to install missing dependencies');
						process.exit(1);
					}
				} else {
					console.log('⚠️ Please install missing dependencies manually:');
					missingDependencies.forEach((dep) => console.log(`  • ${dep}`));
				}
			} else {
				console.log('✔  All dependencies are already installed');
			}
		}

		return;
	} catch (error) {
		console.error(`❌ Error: ${error}`);
		process.exit(1);
	}
}
