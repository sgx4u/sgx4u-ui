import path from 'path';
import fs from 'fs-extra';

/**
 * Script to build component registries for each environment (React, Svelte).
 * Automatically scans the "src/content" folder and generates structured registry JSON files.
 */

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, 'src', 'content');

/**
 * @description Build the SGX4U component registries.
 * @returns {Promise<void>} A promise that resolves when the registries are built.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function buildRegistry() {
	console.log('🔨 Building SGX4U component registries...');

	try {
		/** Get all entries in the content directory. */
		const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });

		for (const entry of entries) {
			/** Only process environment folders (react, svelte). Skip temp directory. */
			if (!entry.isDirectory() || entry.name === 'temp') continue;

			/** Get the environment name and path. */
			const envName = entry.name;
			const envPath = path.join(CONTENT_DIR, envName);

			console.log(`📦 Scanning environment: ${envName}`);

			/** Check for optional javascript/typescript folders. */
			const hasJavaScript = await fs.pathExists(path.join(envPath, 'javascript'));
			const hasTypeScript = await fs.pathExists(path.join(envPath, 'typescript'));

			/** Create registry object. */
			const registry = {
				name: `SGX4U UI - ${capitalize(envName)}`,
				components: {},
			};

			/** Process javascript/typescript folders. */
			await processLanguageFolder(
				envPath,
				hasJavaScript ? 'javascript' : hasTypeScript ? 'typescript' : '',
				registry,
				envName,
			);

			/** Write registry file. */
			const registryPath = path.join(CONTENT_DIR, `registry.${envName.toLowerCase()}.json`);
			await fs.writeJson(registryPath, registry, { spaces: 4 });

			console.log(`✅ Registry created: ${registryPath}`);
		}

		console.log('🎉 All registries built successfully');
	} catch (err) {
		console.error('❌ Failed to build registry:', err);
		process.exit(1);
	}
}

/**
 * @description Processes javascript/typescript folders under each environment.
 * @param {string} envPath - The path to the environment.
 * @param {string} language - The language to process.
 * @param {object} registry - The registry to build.
 * @param {string} envName - The name of the environment.
 * @returns {Promise<void>} A promise that resolves when the language folder is processed.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function processLanguageFolder(envPath, language, registry, envName) {
	/** Get the language path. */
	const langPath = language !== '' ? path.join(envPath, language) : envPath;
	/** Get the ui path. */
	const uiPath = path.join(langPath, 'ui');

	/** Check if the ui path exists. */
	if (!(await fs.pathExists(uiPath))) {
		console.warn(`⚠️ No ui folder found for ${envName} (${language || 'default'})`);
		return;
	}

	/** Get all directories under ui path to scan. */
	const uiEntries = await fs.readdir(uiPath, { withFileTypes: true });
	const dirsToScan = uiEntries.filter((entry) => entry.isDirectory()).map((entry) => path.join(uiPath, entry.name));

	/** Scan the directories. */
	for (const dir of dirsToScan) {
		/** Get the components in the directory. */
		const componentDirectories = await getDirectoriesRecursively(dir);

		for (const componentDir of componentDirectories) {
			/** Get the component name. */
			const componentName = kebabCase(path.basename(componentDir));
			/** Get the index file. */
			const indexFile = path.join(componentDir, 'index.ts');
			/** Get the name. */
			const name = (await extractDataFromIndexFile(indexFile, 'name')) || '';
			/** Get the description. */
			const description = (await extractDataFromIndexFile(indexFile, 'description')) || '';

			/** Collect all files in the component directory and recursively resolve transitive dependencies. */
			const componentFiles = [];
			const componentFilePaths = new Set();
			const dependencies = new Set();

			/** Queue-based traversal to include transitive internal dependencies exactly once. */
			const initialFiles = await getAllFilesRecursively(componentDir);
			const filesToProcess = [...initialFiles];
			const processedFiles = new Set();

			while (filesToProcess.length > 0) {
				const file = filesToProcess.pop();
				if (!file || processedFiles.has(file)) continue;
				processedFiles.add(file);

				const content = await fs.readFile(file, 'utf8');
				const fullRelativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
				const relativeToUI = path.relative(uiPath, file).replace(/\\/g, '/');
				const fileName = path.basename(file);

				/** Add this file once with both source and output path. */
				if (!componentFilePaths.has(fullRelativePath)) {
					componentFiles.push({
						name: fileName,
						path: fullRelativePath,
						outputPath: `ui/${relativeToUI}`,
					});
					componentFilePaths.add(fullRelativePath);
				}

				/** Get the package dependencies (non-relative imports). */
				const packageImports = extractPackageImports(content);
				packageImports.forEach((pkg) => dependencies.add(pkg));

				/** Resolve internal relative dependencies (including nested ones). */
				const relativeImports = extractRelativeImports(content);

				/** Process the relative imports. */
				for (const imports of relativeImports) {
					const dependencyPath = await resolveRelativeImport(imports, file);

					/** If the dependency path is not found, continue. */
					if (!dependencyPath) continue;
					/** If the dependency path does not exist, continue. */
					if (!(await fs.pathExists(dependencyPath))) continue;

					/** Get the relative dependency path. */
					const relativeDependency = path.relative(ROOT_DIR, dependencyPath).replace(/\\/g, '/');
					/** Get the relative dependency path to the ui path. */
					const relativeDependencyToUI = path.relative(uiPath, dependencyPath).replace(/\\/g, '/');
					/** Get the dependency file name. */
					const dependencyFile = path.basename(dependencyPath);

					/** If the dependency file is not already in the component files, add it. */
					if (!componentFilePaths.has(relativeDependency)) {
						componentFiles.push({
							name: dependencyFile,
							path: relativeDependency,
							outputPath: `ui/${relativeDependencyToUI}`,
						});
						componentFilePaths.add(relativeDependency);
					}

					/** Ensure transitive dependencies are also processed. */
					if (!processedFiles.has(dependencyPath)) filesToProcess.push(dependencyPath);
				}
			}

			/** Add the component to the registry. */
			registry.components[componentName] = {
				name,
				description,
				dependencies: Array.from(dependencies),
				files: componentFiles,
			};
		}
	}
}

/**
 * @description Utility Functions
 * @param {string} basePath - The path to the base directory.
 * @returns {Promise<Array<string>>} A promise that resolves to the directories.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function getDirectoriesRecursively(basePath) {
	const result = [];
	const entries = await fs.readdir(basePath, { withFileTypes: true });

	/** Get the entries in the base path. */
	for (const entry of entries) {
		/** Get the entry path. */
		const entryPath = path.join(basePath, entry.name);

		/** Check if the entry is a directory. */
		if (entry.isDirectory()) {
			result.push(entryPath);
			const sub = await getDirectoriesRecursively(entryPath);
			result.push(...sub);
		}
	}

	return result;
}

/**
 * @description Get all the files recursively in the folder.
 * @param {string} folder - The path to the folder.
 * @returns {Promise<Array<string>>} A promise that resolves to the files.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function getAllFilesRecursively(folder) {
	const files = [];
	/** Get the items in the folder. */
	const items = await fs.readdir(folder, { withFileTypes: true });

	/** Process the items. */
	for (const item of items) {
		/** Get the full path. */
		const full = path.join(folder, item.name);

		/** Check if the item is a directory. */
		if (item.isDirectory()) {
			files.push(...(await getAllFilesRecursively(full)));
		} else if (item.isFile()) {
			files.push(full);
		}
	}
	return files;
}

/**
 * @description Extracts name or description from index file (JSDoc)
 * @param {string} indexFilePath - The path to the index file.
 * @param {string} data - The data to extract.
 * @returns {Promise<string>} A promise that resolves to the data.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function extractDataFromIndexFile(indexFilePath, data) {
	/** Check if the index file path exists. */
	if (!(await fs.pathExists(indexFilePath))) return '';
	/** Get the content of the index file. */
	const content = await fs.readFile(indexFilePath, 'utf8');

	let match = '';

	/** Get the match. */
	if (data === 'name') match = content.match(/\*\s*@name\s+(.+?)(?:\r?\n|\*\/)/);
	else if (data === 'description') match = content.match(/\*\s*@description\s+(.+?)(?:\r?\n|\*\/)/);

	return match ? match[1].trim() : '';
}

/**
 * @description Extract imports that are not relative (i.e., package imports)
 * @param {string} content - The content of the file.
 * @returns {Array<string>} The packages.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function extractPackageImports(content) {
	/** Get the regex. */
	const regex = /import\s+.*?\s+from\s+['"]([^.'"][^"']*)['"]/g;
	const packages = [];

	/** Get the matches. */
	let match;
	while ((match = regex.exec(content))) {
		packages.push(match[1]);
	}

	return packages;
}

/**
 * @description Extract relative imports and re-exports ('./' or '../')
 * @param {string} content - The content of the file.
 * @returns {Array<string>} The relative imports.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function extractRelativeImports(content) {
	/**
	 * Match both import and export forms, for example:
	 *  - import X from './file';
	 *  - import { X } from '../file';
	 *  - export * from './file';
	 *  - export { X } from '../file';
	 */
	const regex = /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"](\.\.?\/[^'"]+)['"]/g;
	const relativeImports = [];

	/** Get the matches. */
	let match;
	while ((match = regex.exec(content))) {
		relativeImports.push(match[1]);
	}
	return relativeImports;
}

/**
 * @description Resolve relative import path to an actual .ts or .tsx file
 * @param {string} importPath - The path to the import.
 * @param {string} fromFile - The path to the file.
 * @returns {Promise<string | null>} A promise that resolves to the path to the import or null if it fails.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function resolveRelativeImport(importPath, fromFile) {
	/** Get the directory of the from file. */
	const dir = path.dirname(fromFile);
	/** Get the possible extensions. */
	const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx'];

	/** First try resolving as a direct file import (./file, ../file). */
	for (const extension of possibleExtensions) {
		const full = path.resolve(dir, `${importPath}${extension}`);
		if (await fs.pathExists(full)) return full;
	}

	/**
	 * If not found, treat the import as a directory import (e.g., "../container")
	 * and try common index.* entry points inside that directory.
	 */
	const asDirectory = path.resolve(dir, importPath);
	if (await fs.pathExists(asDirectory)) {
		for (const extension of possibleExtensions) {
			const indexFile = path.join(asDirectory, `index${extension}`);
			if (await fs.pathExists(indexFile)) return indexFile;
		}
	}

	return null;
}

/**
 * @description Converts any string to kebab-case
 * @param {string} str - The string to convert.
 * @returns {string} The kebab-case string.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function kebabCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}

/**
 * @description Capitalize a string
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * @description Run the script
 * @returns {Promise<void>} A promise that resolves when the script is run.
 */
buildRegistry();
