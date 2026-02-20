import ora from 'ora';

import { getConfig } from './utils/config.util';
import { fetchComponent } from './utils/registry.util';

/**
 * @description Show detailed information about a specific component.
 * @param {string} componentName - The name of the component to show information about.
 * @returns {Promise<void>} A promise that resolves when the component information is shown.
 */
export async function showComponentInfo(componentName: string): Promise<void> {
	try {
		const cwd = process.cwd();

		const configSpinner = ora(' Checking...').start();

		/** Basic validation. */
		if (!componentName || !componentName.trim()) {
			configSpinner.fail();
			console.log('❌ Component name is required!');
			process.exit(1);
		}

		const config = await getConfig(cwd);
		if (!config) {
			configSpinner.fail();
			console.log('❌ No configuration found! Please run "sgx4u-ui init" first.');
			process.exit(1);
		}

		const component = await fetchComponent({ componentName, projectType: config.environment });

		if (!component) {
			configSpinner.fail();
			console.log(`❌ Component "${componentName}" not found!`);
			console.log('💡 Use "sgx4u-ui list" to see available components.');
			process.exit(1);
		}

		configSpinner.succeed();

		/** Display component information. */
		console.log(`📋 Component Information: ${component.name}`);
		console.log('\n' + '='.repeat(50) + '\n');

		console.log(`🚀 Installation Command:`);
		console.log(`   sgx4u-ui add ${component.name}`);

		console.log(`📝 Description:`);
		console.log(`   ${component.description}`);

		console.log(`📁 Files:`);
		if (Array.isArray(component.files) && component.files.length > 0) {
			component.files.forEach((file, index) => {
				console.log(
					`   ${index + 1}. ${file.name}\n      Source: ${file.path}\n      Output: ${file.outputPath}`,
				);
			});
		} else {
			console.log('   No files found for this component.');
		}

		console.log('📦 Package Dependencies:');
		if (Array.isArray(component.dependencies) && component.dependencies.length > 0) {
			component.dependencies.forEach((dep, index) => console.log(`   ${index + 1}. ${dep}`));
		} else {
			console.log('   No external dependencies required.');
		}

		process.exit(1);
	} catch (error) {
		console.error(`❌ Error: ${error}`);
		process.exit(1);
	}
}
