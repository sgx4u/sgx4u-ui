import inquirer from 'inquirer';
import ora from 'ora';

import { createConfig, getConfig } from './utils/config.util';
import { createThemeFile } from './utils/css.util';
import { getProjectInfo, installDependencies } from './utils/package.util';

/**
 * @description Initialize the UI components configuration.
 * @returns {Promise<void>} A promise that resolves when the configuration is initialized.
 */
export async function initConfig(): Promise<void> {
	try {
		console.log('⚙️ Initializing configuration...');
		const cwd = process.cwd();

		/** Check if config already exists. */
		const existingConfig = await getConfig(cwd);
		if (existingConfig) {
			console.log('✔  ui.config.json already exists in this project.');

			const { overwrite } = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'overwrite',
					message: 'Do you want to overwrite the existing configuration?',
					default: false,
				},
			]);

			if (!overwrite) {
				console.log('❌ Configuration initialization cancelled!');
				process.exit(1);
			}
		}

		/** Get project information. */
		const projectInfo = await getProjectInfo(cwd);
		if (projectInfo.project === 'none') {
			console.log('❌ No supported project detected!');
			process.exit(1);
		}

		if (projectInfo.tailwindVersion === 'none') {
			console.log('📦 No supported Tailwind version detected!');

			const { installTailwind } = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'installTailwind',
					message: 'Would you like to install Tailwind CSS?',
					default: true,
				},
			]);

			if (!installTailwind) {
				console.log('❌ Tailwind CSS is required for the UI components to work properly!');
				process.exit(1);
			}

			const installTailwindSpinner = ora(' Installing Tailwind CSS...').start();

			const tailwindInstalled = await installDependencies({
				cwd,
				packageManager: projectInfo.packageManager,
				dependencies: ['tailwindcss'],
			});
			if (tailwindInstalled) installTailwindSpinner.succeed();
			else {
				installTailwindSpinner.fail();
				console.log('❌ Failed to install Tailwind CSS. Please install it manually!');
				process.exit(1);
			}
		}

		/** Create the config. */
		const config = await createConfig({ cwd, projectInfo });
		if (!config) {
			console.log('❌ Failed to create configuration file!');
			process.exit(1);
		} else console.log('✔  Configuration file created successfully!');

		/** Install Lucide Icons. */
		const isCorrectLucideVersion = projectInfo.lucideVersion && projectInfo.lucideVersion >= 0.563 ? true : false;
		if (!isCorrectLucideVersion) {
			const lucideInstalled = await installDependencies({
				cwd,
				packageManager: projectInfo.packageManager,
				dependencies: ['clsx', 'lucide-react', 'tailwind-merge'],
			});
			if (!lucideInstalled) {
				console.log('❌ Failed to install Lucide Icons. Please install it manually!');
				process.exit(1);
			}
		}

		/** Create or update globals.css file with theme variables. */
		const themeSpinner = ora(' Setting up theme variables...').start();

		const createdThemeFile = await createThemeFile({ cwd, version: projectInfo.tailwindVersion });
		if (!createdThemeFile) {
			themeSpinner.fail();
			console.log('❌ Failed to setup theme variables!');
			process.exit(1);
		}

		themeSpinner.succeed();

		console.log('🎉 Project initialization completed successfully!');
		console.log('💡 Feel free to update the values in the configuration file to your needs!');
		process.exit(1);
	} catch (error) {
		console.error(`❌ Error: ${error}`);
		process.exit(1);
	}
}
