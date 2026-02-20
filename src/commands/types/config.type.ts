/** Package manager. */
export type PackageManagerType = 'pnpm' | 'npm' | 'yarn' | 'bun';

/** Tailwind version. */
export type TailwindVersionType = 'v4' | 'none';

/** Project. */
export type ProjectType = 'next' | 'react' | 'none';

/** Path alias information. */
export type AliasInfoType = { enabled: true; prefix: string; baseDir: string };

/** Project information. */
export type ProjectInfoType = {
	project: ProjectType;
	hasTypeScript: boolean;
	tailwindVersion: TailwindVersionType;
	lucideVersion: number | null;
	packageManager: PackageManagerType;
};

/** UI configuration. */
export type UIConfigType = {
	uiDir: string;
	environment: ProjectType;
	typescript: boolean;
	aliases: Record<string, string>;
	registry: string;
};

/** Component metadata. */
export type ComponentMetadataType = {
	name: string;
	description: string;
	dependencies: Array<string>;
	files: Array<{ name: string; path: string; outputPath: string }>;
};

/** Registry of components. */
export type RegistryType = {
	name: string;
	components: Record<string, ComponentMetadataType>;
};
