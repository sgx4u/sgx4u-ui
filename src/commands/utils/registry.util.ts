import { ComponentMetadataType, ProjectType, RegistryType } from '../types/config.type';

/** GitHub repository configuration. */
const GITHUB_REPO = 'sgx4u/sgx4u-ui';
const GITHUB_BRANCH = 'production';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`;

/**
 * @description Fetch the registry from GitHub based on project type.
 * @param {ProjectType} projectType - The project type to fetch the registry for.
 * @returns {Promise<RegistryType | null>} A promise that resolves to the registry or null if it fails.
 */
export async function fetchRegistry(projectType: ProjectType): Promise<RegistryType | null> {
	try {
		let registryEnvironment: ProjectType;
		/** Determine registry environment based on project type. */
		if (projectType === 'next' || projectType === 'react') registryEnvironment = 'react';
		else return null;

		/** Determine registry file based on project type. */
		const registryFile = `registry.${registryEnvironment}.json`;

		/** Try to fetch from GitHub first. */
		const registryUrl = `${GITHUB_RAW_BASE}/src/content/${registryFile}`;
		const response = await fetch(registryUrl);

		if (!response.ok) return null;

		const registry: RegistryType = await response.json();
		return registry;
	} catch {
		return null;
	}
}

/**
 * @description Fetch a component from the registry.
 * @param {object} props - The parameters for fetching a component.
 * @param {string} props.componentName - The name of the component to fetch.
 * @param {ProjectType} props.projectType - The project type to fetch the component for.
 * @returns {Promise<ComponentMetadataType | null>} A promise that resolves to the component or null if it fails.
 */
export async function fetchComponent({
	componentName,
	projectType,
}: {
	componentName: string;
	projectType: ProjectType;
}): Promise<ComponentMetadataType | null> {
	try {
		if (projectType === 'none') return null;

		const registry = await fetchRegistry(projectType);
		if (!registry) return null;

		/** Search for component by name in the registry using the key as the component name. */
		for (const [registryKey, component] of Object.entries(registry.components)) {
			if (registryKey === componentName) {
				return {
					...component,
					name: registryKey,
				};
			}
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * @description Fetch a component file from GitHub.
 * @param {string} filePath - The path to the file to fetch.
 * @returns {Promise<string | null>} A promise that resolves to the file content or null if it fails.
 */
export async function fetchComponentFile(filePath: string): Promise<string | null> {
	try {
		const fileUrl = `${GITHUB_RAW_BASE}/${filePath}`;
		const response = await fetch(fileUrl);

		if (!response.ok) return null;

		return await response.text();
	} catch {
		console.log(`⚠️ Failed to fetch file from GitHub: ${filePath}`);
		return null;
	}
}
