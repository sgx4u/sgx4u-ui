import path from 'path';
import fs from 'fs-extra';

import { AliasInfoType } from '../types/config.type';

/**
 * @description Detect path alias information.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<AliasInfoType | null>} A promise that resolves to the alias information or null if it fails.
 */
export async function detectAlias(cwd: string): Promise<AliasInfoType | null> {
	const configFiles = ['tsconfig.json', 'jsconfig.json'];

	for (const file of configFiles) {
		/** Check if config file exists. */
		const configPath = path.join(cwd, file);
		if (!fs.existsSync(configPath)) continue;

		/** Read config file. */
		const config = await fs.readJson(configPath);
		const paths = config?.compilerOptions?.paths;

		if (!paths || typeof paths !== 'object') continue;

		/** Look for path alias like "@/*": ["./src/*"] */
		for (const [alias, targets] of Object.entries(paths)) {
			if (!alias.endsWith('/*')) continue;
			if (!Array.isArray(targets) || !targets[0]) continue;

			const prefix = alias.replace('/*', '');
			const baseDir = targets[0].replace('/*', '');

			return { enabled: true, prefix, baseDir };
		}
	}

	return null;
}
