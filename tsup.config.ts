import { defineConfig } from 'tsup';

/** Main build configuration. */
export default defineConfig([
	{
		entryPoints: ['./src/index.ts', './src/bin.ts'],
		format: ['cjs', 'esm'],
		clean: true,
		dts: true,
		shims: true,
		skipNodeModulesBundle: true,
	},
]);
