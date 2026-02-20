import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

import { ProjectInfoType, UIConfigType } from '../types/config.type';
import { detectAlias } from './alias.util';

/**
 * @description Get existing configuration.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<UIConfigType | null>} A promise that resolves to the configuration or null if it fails.
 */
export async function getConfig(cwd: string): Promise<UIConfigType | null> {
	try {
		const configPath = path.resolve(cwd, 'ui.config.json');
		const configExists = await fs.pathExists(configPath);

		/** If config exists, return it. */
		if (configExists) return await fs.readJson(configPath);
		/** If config does not exist, return null. */
		return null;
	} catch {
		return null;
	}
}

/**
 * @description Create configuration.
 * @param {object} props - The parameters for creating configuration.
 * @param {string} props.cwd - The current working directory.
 * @param {ProjectInfoType} props.projectInfo - The project information.
 * @returns {Promise<UIConfigType | null>} A promise that resolves to the configuration or null if it fails.
 */
export async function createConfig({
	cwd,
	projectInfo,
}: {
	cwd: string;
	projectInfo: ProjectInfoType;
}): Promise<UIConfigType | null> {
	try {
		/** Auto-detect the best UI directory. */
		const detectedDir = await detectUIDirectory(cwd);

		const { uiDir, environment, typescript } = await inquirer.prompt([
			{
				type: 'input',
				name: 'uiDir',
				message: 'Where would you like to add UI components?',
				default: detectedDir,
				validate: (input: string): boolean | string => {
					if (!input.trim()) return 'Please enter a valid directory path.';
					return true;
				},
			},
			{
				type: 'list',
				name: 'environment',
				message: 'Which environment are you using?',
				choices: [
					{ name: 'React', value: 'react' },
					{ name: 'Next.js', value: 'next' },
				],
				default: projectInfo.project,
			},
			{
				type: 'confirm',
				name: 'typescript',
				message: 'Do you want to use TypeScript?',
				default: projectInfo.hasTypeScript,
			},
		]);

		const finalUiPath = uiDir.startsWith('/') ? uiDir : `./${uiDir}`;
		/** Get path alias information. */
		const aliasInfo = await detectAlias(cwd);

		const aliases = aliasInfo
			? {
					[aliasInfo.prefix]: aliasInfo.baseDir,
					[`${aliasInfo.prefix}/ui`]: finalUiPath,
					[`${aliasInfo.prefix}/elements`]: `${finalUiPath}/elements`,
					[`${aliasInfo.prefix}/modules`]: `${finalUiPath}/modules`,
					[`${aliasInfo.prefix}/helpers`]: `${finalUiPath}/helpers`,
					[`${aliasInfo.prefix}/hooks`]: `${finalUiPath}/hooks`,
					[`${aliasInfo.prefix}/utils`]: `${finalUiPath}/utils`,
				}
			: {
					ui: finalUiPath,
					elements: `${finalUiPath}/elements`,
					modules: `${finalUiPath}/modules`,
					helpers: `${finalUiPath}/helpers`,
					hooks: `${finalUiPath}/hooks`,
					utils: `${finalUiPath}/utils`,
				};

		const config: UIConfigType = {
			uiDir: finalUiPath,
			environment,
			typescript,
			aliases,
			registry: 'https://registry.npmjs.org',
		};

		/** Write config file. */
		const configPath = path.join(cwd, 'ui.config.json');
		await fs.writeJson(configPath, config, { spaces: 4 });
		return config;
	} catch {
		return null;
	}
}

/**
 * @description Detect the appropriate UI directory.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<string>} A promise that resolves to the UI directory.
 */
export async function detectUIDirectory(cwd: string): Promise<string> {
	/** Check if src/ui or src exists. */
	const srcUiPath = path.join(cwd, 'src');
	if (await fs.pathExists(srcUiPath)) return 'src/ui';

	/** Default to ui in root. */
	return 'ui';
}
