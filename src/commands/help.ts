/**
 * @description Display comprehensive help information.
 * @returns {Promise<void>} A promise that resolves when the help information is shown.
 */
export async function showHelp(): Promise<void> {
	console.log('✔  Help information!');

	console.log('🚀 SGX4U UI - Component Library CLI');
	console.log('\n' + '='.repeat(50) + '\n');

	console.log('📖 OVERVIEW');
	console.log('   SGX4U UI is a modern component library for modular UI development');

	console.log('\n🔧 AVAILABLE COMMANDS');

	console.log('   1. pnpm dlx @sgx4u/ui@latest init - Initialize SGX4U UI in your project');
	console.log('   2. pnpm dlx @sgx4u/ui@latest add <component-name> - Install a component');
	console.log('   3. pnpm dlx @sgx4u/ui@latest list - Show available components');
	console.log('   4. pnpm dlx @sgx4u/ui@latest info <component-name> - Show information about a component');
	console.log('   5. pnpm dlx @sgx4u/ui@latest config - Show configuration');
	console.log('   6. pnpm dlx @sgx4u/ui@latest help - Show help information');

	console.log('\n✨ KEY FEATURES');
	console.log('   ☄️ Access raw code - Flexibility and freedom from external dependencies');
	console.log('   🎯 Individual Component Installation - Install only what you need');
	console.log('   🎨 Tailwind CSS Integration - Seamless theme and styling setup');
	console.log('   📝 TypeScript Support - Full TypeScript compatibility');
	console.log('   ⚡ Fast & Reliable - Optimized for developer experience');

	console.log('\n🔗 USEFUL LINKS');
	console.log('   • Documentation: https://ui.sgx4u.com');
	console.log('   • GitHub Repository: https://github.com/sgx4u/sgx4u-ui');
	console.log('   • Support: https://ui.sgx4u.com/support');

	console.log('\n💡 TIPS');
	console.log(
		'   • Run "pnpm dlx @sgx4u/ui@latest init" first to set up your project properly and avoid overwriting existing configuration',
	);
	console.log('   • Use "pnpm dlx @sgx4u/ui@latest list" to explore available components');

	console.log('\n❓ NEED MORE HELP?');
	console.log('   For more details please visit the documentation or reach out to me at sgx2050@gmail.com');
}
