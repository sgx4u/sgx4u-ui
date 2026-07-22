import path from 'path';
import fs from 'fs-extra';

/**
 * @description Get all file dependencies recursively.
 * @param {object} props - The parameters for getting all file dependencies.
 * @param {string} props.filePath - The path to the file to get dependencies for.
 * @param {string} props.uiPath - The path to the UI directory.
 * @param {Set<string>} props.visited - The set of visited files.
 * @returns {Promise<Array<string>>} A promise that resolves to the dependencies.
 */
export async function getAllFileDependencies({
	filePath,
	uiPath,
	visited = new Set(),
}: {
	filePath: string;
	uiPath: string;
	visited?: Set<string>;
}): Promise<Array<string>> {
	const dependencies: Array<string> = [];

	if (visited.has(filePath)) return dependencies;
	visited.add(filePath);

	const fileDependencies = await extractFileDependencies({ filePath, uiPath });

	for (const dependency of fileDependencies) {
		/** Try different file extensions if the original path doesn't exist. */
		const possiblePaths = [
			dependency /** Original path. */,
			dependency + '.ts' /** Add .ts extension. */,
			dependency + '.tsx' /** Add .tsx extension. */,
			dependency + '.js' /** Add .js extension. */,
			dependency + '.jsx' /** Add .jsx extension. */,
		];

		let foundPath: string | null = null;

		for (const possibleDependency of possiblePaths) {
			const dependencyPath = path.join(uiPath, possibleDependency);

			if (await fs.pathExists(dependencyPath)) {
				foundPath = possibleDependency;
				break;
			}
		}

		if (foundPath) {
			dependencies.push(foundPath);

			/** Recursively get dependencies of this dependency. */
			const depPath = path.join(uiPath, foundPath);
			const subDeps = await getAllFileDependencies({ filePath: depPath, uiPath, visited });
			dependencies.push(...subDeps);
		}
	}

	return dependencies;
}

/**
 * @description Extract file dependencies from a file's content.
 * @param {object} props - The parameters for extracting file dependencies.
 * @param {string} props.filePath - The path to the file to extract dependencies from.
 * @param {string} props.uiPath - The path to the UI directory.
 * @returns {Promise<Array<string>>} A promise that resolves to the dependencies.
 */
async function extractFileDependencies({
	filePath,
	uiPath,
}: {
	filePath: string;
	uiPath: string;
}): Promise<Array<string>> {
	try {
		const content = await fs.readFile(filePath, 'utf8');
		const dependencies: Array<string> = [];

		/** Match relative imports like '../utils/theme.util' or './other-file' and alias imports like '@/ui/utils/theme.util'. */
		const importRegex = /import\s+.*?\s+from\s+['"](\.\.?\/[^'"]+|@\/[^'"]+)['"]/g;
		let match;

		while ((match = importRegex.exec(content)) !== null) {
			const importPath = match[1];
			let relativePath: string;

			if (importPath.startsWith('@/')) {
				/** Handle alias imports like '@/ui/utils/theme.util'. Remove the @/ prefix and check if it starts with 'ui/'. */
				const pathWithoutAlias = importPath.substring(2);
				if (pathWithoutAlias.startsWith('ui/')) {
					/** Remove 'ui/' prefix to get the relative path within the UI directory. */
					relativePath = pathWithoutAlias.substring(3);
				} else {
					/** Skip if it's not a UI-related import. */
					continue;
				}
			} else {
				/** Handle relative imports like '../utils/theme.util'. Convert relative path to absolute path. */
				const absolutePath = path.resolve(path.dirname(filePath), importPath);
				/** Convert to relative path from UI directory. */
				relativePath = path.relative(uiPath, absolutePath);
			}

			/** Only include if it's within the UI directory. */
			if (!relativePath.startsWith('..')) dependencies.push(relativePath);
		}

		return dependencies;
	} catch (error) {
		console.log(`⚠️ Failed to extract dependencies from ${filePath}: ${error}`);
		return [];
	}
}
