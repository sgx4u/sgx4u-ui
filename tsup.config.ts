import { defineConfig } from 'tsup';

export default defineConfig([
	/** Main build configuration. */
	{
		entryPoints: ['./src/index.ts', './src/bin.ts'],
		format: ['cjs', 'esm'],
		clean: true,
		dts: true,
		shims: true,
		skipNodeModulesBundle: true,
	},
]);
