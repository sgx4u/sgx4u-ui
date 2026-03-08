import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsdoc from 'eslint-plugin-jsdoc';
import noSecrets from 'eslint-plugin-no-secrets';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	jsdoc.configs['flat/recommended'],
	...nextTs,
	...nextVitals,
	pluginReact.configs.flat.recommended,
	tseslint.configs.recommended,
	reactHooks.configs.flat.recommended,

	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: {
			js,
			'no-secrets': noSecrets,
		},
		extends: ['js/recommended'],
		languageOptions: { globals: { ...globals.browser, ...globals.jest } },
		rules: {
			'@next/next/no-img-element': 'off',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'jsdoc/require-param': [
				'error',
				{
					contexts: [
						'FunctionDeclaration:not([id.name=/^[A-Z]/])',
						'FunctionExpression:not([id.name=/^[A-Z]/])',
						'ArrowFunctionExpression:not([id.name=/^[A-Z]/])',
					],
				},
			],
			'no-secrets/no-secrets': 'warn',
			'no-unused-vars': 'off',
			'react/react-in-jsx-scope': 'off',
		},
	},

	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
