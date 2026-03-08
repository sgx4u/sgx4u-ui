import ora from 'ora';

import { getConfig } from './utils/config.util';
import { fetchRegistry } from './utils/registry.util';

/**
 * @description List available components.
 * @returns {Promise<void>} A promise that resolves when the list of available components is shown.
 */
export async function listComponents(): Promise<void> {
	const configSpinner = ora(' Checking...').start();

	try {
		const cwd = process.cwd();

		const config = await getConfig(cwd);
		if (!config) {
			configSpinner.fail();
			console.log('❌ No configuration found! Please run "pnpm dlx @sgx4u/ui@latest init" first.');
			process.exit(1);
		}

		configSpinner.succeed();

		const fetchSpinner = ora(' Fetching available components...').start();
		const registry = await fetchRegistry(config.environment);
		if (!registry) {
			fetchSpinner.fail();
			console.log('⚠️ Failed to fetch registry from GitHub');
			process.exit(1);
		}

		fetchSpinner.succeed();

		console.log('📋 Available Components:');

		/** Use registry keys as canonical component names since the registry entries do not contain a name field. */
		Object.entries(registry.components).forEach(([registryKey, component]) => {
			const componentName = component.name ?? registryKey;

			console.log(`${componentName}: ${component.description}`);
			console.log(`    Install: pnpm dlx @sgx4u/ui@latest add ${componentName}`);
			console.log();
		});

		process.exit(1);
	} catch (error) {
		configSpinner.fail();
		console.error(`❌ Error: ${error}`);
		process.exit(1);
	}
}
