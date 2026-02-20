import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';

import { createConfig, getConfig } from './utils/config.util';
import { getProjectInfo } from './utils/package.util';

/**
 * @description Manage configuration settings.
 * @returns {Promise<void>} A promise that resolves when the configuration is managed.
 */
export async function manageConfig(): Promise<void> {
	try {
		const cwd = process.cwd();

		const configSpinner = ora(' Loading configuration...').start();

		const config = await getConfig(cwd);
		if (!config) {
			configSpinner.fail();
			console.log('❌ No configuration found. Please run "pnpm dlx @sgx4u/ui@latest init" first!');
			process.exit(1);
		}

		configSpinner.succeed();
		console.log(`⚙️ Configuration Management`);

		const actionChoices = [
			{ name: 'View full configuration', value: 'view' },
			{ name: 'Reset configuration', value: 'reset' },
			{ name: 'Exit', value: 'exit' },
		];

		/** Show choices so they are visible in all terminals (e.g. Windows, pnpm dlx). */
		actionChoices.forEach((choice, index) => {
			console.log(`  ${index + 1}) ${choice.name}`);
		});
		console.log('');

		const { action } = await inquirer.prompt([
			{
				type: 'rawlist',
				name: 'action',
				message: 'What would you like to do?',
				choices: actionChoices,
			},
		]);

		switch (action) {
			case 'view':
				await viewFullConfig(config);
				process.exit(1);
				break;
			case 'reset':
				await resetConfig(cwd);
				process.exit(1);
				break;
			case 'exit':
				console.log('👋 Goodbye!');
				process.exit(1);
				break;
		}
	} catch (error) {
		console.error(`❌ Error: ${error}`);
		process.exit(1);
	}
}

/**
 * @description View full configuration.
 * @param {unknown} config - The configuration to view.
 * @returns {Promise<void>} A promise that resolves when the configuration is viewed.
 */
async function viewFullConfig(config: unknown): Promise<void> {
	console.log(`📄 Full Configuration:`);
	console.log(JSON.stringify(config, null, 2));
}

/**
 * @description Reset configuration.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<void>} A promise that resolves when the configuration is reset.
 */
async function resetConfig(cwd: string): Promise<void> {
	const { confirm } = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: 'Are you sure you want to reset the configuration to default values?',
			default: false,
		},
	]);

	if (confirm) {
		/** Get project information. */
		const projectInfo = await getProjectInfo(cwd);
		if (projectInfo.project === 'none') {
			console.log('❌ No supported project detected!');
			process.exit(1);
		}

		const config = await createConfig({ cwd, projectInfo });
		if (!config) {
			console.log('❌ Failed to reset configuration file!');
			process.exit(1);
		} else console.log('✔  Configuration reset to default values');

		const configPath = path.join(cwd, 'ui.config.json');
		await fs.writeJson(configPath, config, { spaces: 4 });
		console.log('✔  Configuration reset to default values');
	} else {
		console.log('❌ Configuration reset cancelled');
	}
}
