import { Command } from 'commander';

import { addComponent } from './commands/add';
import { manageConfig } from './commands/config';
import { showHelp } from './commands/help';
import { showComponentInfo } from './commands/info';
import { initConfig } from './commands/init';
import { listComponents } from './commands/list';

const program = new Command();

/** CLI Configuration. */
program.name('sgx4u-ui').description('CLI tool for installing SGX4U UI components').version('1.0.0');

/** Core commands. */
program.command('init').description('Initialize SGX4U UI in your project').action(initConfig);

program
	.command('add')
	.description('Add a component to your project')
	.argument('<component>', 'Component name to add (e.g., button, input)')
	.action(addComponent);

program.command('list').description('List all available components').action(listComponents);

/** Information commands. */
program
	.command('info')
	.description('Show detailed information about a specific component')
	.argument('<component>', 'Component name to get info about')
	.action(showComponentInfo);

/** Management commands. */
program.command('config').description('Manage configuration settings').action(manageConfig);

/** Help command. */
program.command('help').description('Show comprehensive help information').action(showHelp);

/** Default help. */
program.on('--help', () => {
	console.log('\n💡 For detailed help, run: sgx4u-ui help');
});

program.parse();
