import fs from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';

import { PackageManagerType, ProjectInfoType, TailwindVersionType } from '../types/config.type';

/**
 * @description Validate project dependencies.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<ProjectInfoType>} A promise that resolves to the project information.
 */
export async function getProjectInfo(cwd: string): Promise<ProjectInfoType> {
	/** Check for React. */
	const hasReact = await isPackageInstalled({ packageName: 'react', cwd });
	/** Check for Next.js. */
	const hasNextJS = await isPackageInstalled({ packageName: 'next', cwd });
	/** Check for TypeScript. */
	const hasTypeScript = await isPackageInstalled({ packageName: 'typescript', cwd });
	/** Detect Tailwind version. */
	const tailwindVersion = await getTailwindVersion(cwd);
	/** Check for Lucide Icons Version. */
	const lucideVersion = await getPackageVersion({ packageName: 'lucide-react', cwd });
	/** Detect package manager. */
	const packageManager = await detectPackageManager(cwd);

	const project: ProjectInfoType['project'] = hasNextJS ? 'next' : hasReact ? 'react' : 'none';

	return { project, hasTypeScript, tailwindVersion, lucideVersion, packageManager };
}

/**
 * @description Check if a package is installed in the current project.
 * @param {object} props - The parameters for checking if a package is installed.
 * @param {string} props.packageName - The name of the package to check if it is installed.
 * @param {string} props.cwd - The current working directory.
 * @returns {Promise<boolean>} A promise that resolves to true if the package is installed, false otherwise.
 */
export async function isPackageInstalled({ packageName, cwd }: { packageName: string; cwd: string }): Promise<boolean> {
	try {
		const packageJsonPath = path.join(cwd, 'package.json');
		if (!(await fs.pathExists(packageJsonPath))) return false;

		const packageJson = await fs.readJson(packageJsonPath);
		const allDeps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
			...packageJson.peerDependencies,
		};

		/** Check if the package is installed. */
		return Object.keys(allDeps).some((dependency) => dependency === packageName);
	} catch {
		return false;
	}
}

/**
 * @description Install missing dependencies (general purpose).
 * @param {object} props - The parameters for installing dependencies.
 * @param {string} props.cwd - The current working directory.
 * @param {PackageManagerType} props.packageManager - The package manager to use for installation.
 * @param {Array<string>} props.dependencies - The dependencies to install.
 * @returns {Promise<boolean>} A promise that resolves to true if the dependencies are installed successfully, false otherwise.
 */
export async function installDependencies({
	cwd,
	packageManager,
	dependencies,
}: {
	cwd: string;
	packageManager: PackageManagerType;
	dependencies: Array<string>;
}): Promise<boolean> {
	try {
		const installCommand = getInstallCommand({ packageManager, packages: dependencies, isDev: false });

		/** Installing dependencies. */
		execSync(installCommand, { cwd, stdio: 'pipe', encoding: 'utf8' });
		return true;
	} catch {
		return false;
	}
}

/**
 * @description Check the version of a package.
 * @param {object} props - The parameters for checking the version of a package.
 * @param {string} props.packageName - The name of the package to check the version of.
 * @param {string} props.cwd - The current working directory.
 * @returns {Promise<number | null>} A promise that resolves to the version of the package or null if it fails.
 */
async function getPackageVersion({ packageName, cwd }: { packageName: string; cwd: string }): Promise<number | null> {
	const packageJsonPath = path.join(cwd, 'package.json');
	if (!(await fs.pathExists(packageJsonPath))) return null;

	const packageJson = await fs.readJson(packageJsonPath);
	const allDeps = {
		...packageJson.dependencies,
		...packageJson.devDependencies,
		...packageJson.peerDependencies,
	};

	const rawVersion = allDeps[packageName];
	if (rawVersion == null || typeof rawVersion !== 'string') return null;

	const packageVersion = rawVersion.replace(/^[\^~>=]+/, '').split('.');
	if (packageVersion.length === 0 || packageVersion[0] === '') return null;

	const version = packageVersion[1] != null ? `${packageVersion[0]}.${packageVersion[1]}` : packageVersion[0];
	const parsed = Number.parseFloat(version);
	return Number.isNaN(parsed) ? null : parsed;
}

/**
 * @description Detect the active package manager in the project.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<PackageManagerType>} A promise that resolves to the package manager or null if it fails.
 */
async function detectPackageManager(cwd: string): Promise<PackageManagerType> {
	try {
		/** Check for lock files to determine package manager. */
		const pnpmLockPath = path.join(cwd, 'pnpm-lock.yaml');
		if (await fs.pathExists(pnpmLockPath)) return 'pnpm';

		const yarnLockPath = path.join(cwd, 'yarn.lock');
		if (await fs.pathExists(yarnLockPath)) return 'yarn';

		const bunLockPath = path.join(cwd, 'bun.lockb');
		if (await fs.pathExists(bunLockPath)) return 'bun';

		const npmLockPath = path.join(cwd, 'package-lock.json');
		if (await fs.pathExists(npmLockPath)) return 'npm';

		/** Check package.json for packageManager field (modern approach). */
		const packageJsonPath = path.join(cwd, 'package.json');
		if (await fs.pathExists(packageJsonPath)) {
			try {
				const packageJson = await fs.readJson(packageJsonPath);

				if (packageJson.packageManager) {
					const packageManager = packageJson.packageManager;
					if (packageManager.includes('pnpm')) return 'pnpm';
					if (packageManager.includes('yarn')) return 'yarn';
					if (packageManager.includes('bun')) return 'bun';
					if (packageManager.includes('npm')) return 'npm';
				}
			} catch {
				/** Ignore JSON parsing errors. */
			}
		}

		/** Check which package manager is available globally. */
		try {
			execSync('pnpm --version', { stdio: 'pipe', cwd });
			return 'pnpm';
		} catch {
			try {
				execSync('yarn --version', { stdio: 'pipe', cwd });
				return 'yarn';
			} catch {
				try {
					execSync('bun --version', { stdio: 'pipe', cwd });
					return 'bun';
				} catch {
					/** npm is usually available by default. */
					return 'npm';
				}
			}
		}
	} catch {
		/** Fallback to npm if detection fails. */
		return 'npm';
	}
}

/**
 * @description Get the install command for a specific package manager.
 * @param {object} props - The parameters for getting the install command.
 * @param {PackageManagerType} props.packageManager - The package manager to get the install command for.
 * @param {Array<string>} props.packages - The packages to install.
 * @param {boolean} props.isDev - Whether to install the packages as dev dependencies.
 * @returns {string} The install command.
 */
function getInstallCommand({
	packageManager,
	packages,
	isDev,
}: {
	packageManager: PackageManagerType;
	packages: Array<string>;
	isDev: boolean;
}): string {
	const packagesStr = packages.join(' ');

	switch (packageManager) {
		case 'pnpm':
			return isDev ? `pnpm add -D ${packagesStr}` : `pnpm add ${packagesStr}`;
		case 'yarn':
			return isDev ? `yarn add -D ${packagesStr}` : `yarn add ${packagesStr}`;
		case 'bun':
			return isDev ? `bun add -d ${packagesStr}` : `bun add ${packagesStr}`;
		default:
			return isDev ? `npm install --save-dev ${packagesStr}` : `npm install ${packagesStr}`;
	}
}

/**
 * @description Detect Tailwind version from package.json.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<TailwindVersionType>} A promise that resolves to the Tailwind version or null if it fails.
 */
async function getTailwindVersion(cwd: string): Promise<TailwindVersionType> {
	const packageJsonPath = path.join(cwd, 'package.json');
	if (!(await fs.pathExists(packageJsonPath))) return 'none';

	const packageJson = await fs.readJson(packageJsonPath);
	const allDeps = {
		...packageJson.dependencies,
		...packageJson.devDependencies,
		...packageJson.peerDependencies,
	};

	/** Check for Tailwind v4. */
	if (allDeps['tailwindcss'] && (allDeps['tailwindcss'].startsWith('4') || allDeps['tailwindcss'].startsWith('^4'))) {
		return 'v4';
	}

	return 'none';
}
