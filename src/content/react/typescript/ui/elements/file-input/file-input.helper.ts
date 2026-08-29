/** Options for validating files. */
export type ValidateFilesOptions = {
	accept?: Array<string>;
	maxSize?: number;
	minSize?: number;
	maxFiles?: number;
	validator?: (files: Array<File>) => boolean;
};

/** Result of validating files. */
export type ValidateFilesResult = {
	accepted: Array<File>;
	rejected: Array<File>;
};

/**
 * @description Check if a file passes the accept filter (MIME or extension).
 * @param {object} props - The parameters object.
 * @param {File} props.file - The file to check.
 * @param {Array<string>} props.accept - The accept array to check against.
 * @returns {boolean} True if the file passes the accept filter, false otherwise.
 */
function fileMatchesAccept({ file, accept }: { file: File; accept: Array<string> }): boolean {
	/* If the accept array is empty, return true. */
	if (accept.length === 0) return true;
	const acceptLower = accept.map((item) => item.toLowerCase());

	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();

	/** Check if the file matches the accept array. */
	return acceptLower.some((pattern) => {
		if (pattern.startsWith('.')) return name.endsWith(pattern);
		if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
		return type === pattern || name.endsWith(pattern);
	});
}

/**
 * @description Validate files and split into accepted and rejected.
 * @param {object} props - The parameters object.
 * @param {Array<File>} props.files - The files to validate.
 * @param {ValidateFilesOptions} props.options - The options for validating the files.
 * @returns {ValidateFilesResult} The result of validating the files.
 */
export function validateFiles({
	files,
	options,
}: {
	files: Array<File>;
	options: ValidateFilesOptions;
}): ValidateFilesResult {
	const { accept, maxSize, minSize, maxFiles, validator } = options;

	const accepted: Array<File> = [];
	const rejected: Array<File> = [];

	for (const file of files) {
		/** Check if the file matches the accept array. */
		if (accept && accept.length > 0 && !fileMatchesAccept({ file, accept })) {
			rejected.push(file);
			continue;
		}
		/** Check if the file size is less than the maximum size. */
		if (maxSize !== undefined && file.size > maxSize) {
			rejected.push(file);
			continue;
		}
		/** Check if the file size is greater than the minimum size. */
		if (minSize !== undefined && file.size < minSize) {
			rejected.push(file);
			continue;
		}

		/** Add the file to the accepted array. */
		accepted.push(file);
	}

	/** Cap the accepted files to the maximum number of files. */
	const capped = maxFiles !== undefined && accepted.length > maxFiles ? accepted.slice(0, maxFiles) : accepted;
	const extra = maxFiles !== undefined && accepted.length > maxFiles ? accepted.slice(maxFiles) : [];
	const passesValidator = !validator || validator(capped);
	const finalAccepted = passesValidator ? capped : [];
	const finalRejected = [...rejected, ...extra, ...(passesValidator ? [] : capped)];

	return { accepted: finalAccepted, rejected: finalRejected };
}
