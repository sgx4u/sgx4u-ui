import path from 'path';
import fs from 'fs-extra';

import { TailwindVersionType } from '../types/config.type';

import { themeVariablesV4 } from '../data/theme-tailwind-v4.data';

/**
 * @description Create or update theme in globals.css file.
 * @param {object} props - The parameters for creating the theme file.
 * @param {string} props.cwd - The current working directory.
 * @param {TailwindVersionType} props.version - The version of the Tailwind CSS to use.
 * @returns {Promise<string | null>} A promise that resolves to the path to the theme file or null if it fails.
 */
export async function createThemeFile({
	cwd,
	version,
}: {
	cwd: string;
	version: TailwindVersionType;
}): Promise<string | null> {
	if (version === 'none') return null;

	/** First try to locate existing globals.css. */
	const existingGlobalCssPath = await locateGlobalsCSS(cwd);

	if (existingGlobalCssPath) {
		/** Update existing globals.css with theme variables. */
		const updated = await updateGlobalsCSS({
			filePath: existingGlobalCssPath,
			content: themeVariablesV4,
		});

		if (!updated) return null;
		return existingGlobalCssPath;
	}

	/** Check which directory structure exists. */
	const srcAppDir = path.join(cwd, 'src', 'app');
	const appDir = path.join(cwd, 'app');

	let newGlobalCssPath: string;

	if (await fs.pathExists(srcAppDir)) {
		/** If src/app exists, create globals.css there. */
		newGlobalCssPath = path.join(srcAppDir, 'globals.css');
	} else if (await fs.pathExists(appDir)) {
		/** If app exists (but not src/app), create globals.css there. */
		newGlobalCssPath = path.join(appDir, 'globals.css');
	} else {
		/** If neither exists, create src/app structure. */
		newGlobalCssPath = path.join(cwd, 'src', 'app', 'globals.css');
	}

	/** Ensure directory exists. */
	await fs.ensureDir(path.dirname(newGlobalCssPath));

	/** Write theme file to the globalCssPath. */
	const fileUpdated = await writeCSSFile({
		filePath: newGlobalCssPath,
		content: themeVariablesV4,
	});
	if (!fileUpdated) return null;

	return newGlobalCssPath;
}

/**
 * @description Locate globals.css file in common locations.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<string | null>} A promise that resolves to the path to the globals.css file or null if it fails.
 */
async function locateGlobalsCSS(cwd: string): Promise<string | null> {
	const commonPaths = [path.join(cwd, 'src', 'app', 'globals.css'), path.join(cwd, 'app', 'globals.css')];

	for (const cssPath of commonPaths) {
		if (await fs.pathExists(cssPath)) return cssPath;
	}
	return null;
}

/**
 * @description Append theme variables to existing globals.css file.
 * @param {object} props - The parameters for appending theme variables to an existing globals.css file.
 * @param {string} props.filePath - The path to the globals.css file to append theme variables to.
 * @param {string} props.content - The content to append to the globals.css file.
 * @returns {Promise<boolean>} A promise that resolves to true if the theme variables are appended successfully, false otherwise.
 */
async function updateGlobalsCSS({ filePath, content }: { filePath: string; content: string }): Promise<boolean> {
	try {
		/** Write updated content. */
		await fs.writeFile(filePath, content, 'utf8');
		return true;
	} catch {
		return false;
	}
}

/**
 * @description Write to a CSS file.
 * @param {object} props - The parameters for writing to a CSS file.
 * @param {string} props.filePath - The path to the CSS file to write to.
 * @param {string} props.content - The content to write to the CSS file.
 * @returns {Promise<boolean>} A promise that resolves to true if the CSS file is written successfully, false otherwise.
 */
async function writeCSSFile({ filePath, content }: { filePath: string; content: string }): Promise<boolean> {
	try {
		await fs.writeFile(filePath, content, 'utf8');
		return true;
	} catch {
		return false;
	}
}
