import type { AxiosInstance } from "axios";
import { ROOT_FOLDER_ID } from "./const";
import type { GoogleFileId } from "./types";

const ADDITIONAL_APP_PROPERTIES = {
	source: "offline-notion",
	environment: import.meta.env.MODE,
};

/**
 * AI generated function, but it seems OK.
 *
 * Build a multipart/related body for Google Drive API uploads
 * @param metadata - File metadata as JSON object
 * @param contentType - MIME type of the media content
 * @param content - Media content as Uint8Array
 * @returns Object containing the body buffer and boundary string
 */
const buildMultipartBody = (
	metadata: Record<string, unknown>,
	contentType: string,
	content: Uint8Array,
): { body: Uint8Array; boundary: string } => {
	const boundary = `----WebKitFormBoundary${crypto.randomUUID().replace(/-/g, "")}`;
	const metadataJson = JSON.stringify(metadata);

	const encoder = new TextEncoder();
	const boundaryBytes = encoder.encode(`--${boundary}`);
	const crlf = encoder.encode("\r\n");
	const metadataHeader = encoder.encode(
		"Content-Type: application/json; charset=UTF-8\r\n\r\n",
	);
	const metadataContent = encoder.encode(metadataJson);
	const mediaHeader = encoder.encode(`Content-Type: ${contentType}\r\n\r\n`);
	const closingBoundary = encoder.encode(`--${boundary}--`);

	const totalLength =
		boundaryBytes.byteLength +
		crlf.byteLength +
		metadataHeader.byteLength +
		metadataContent.byteLength +
		crlf.byteLength +
		boundaryBytes.byteLength +
		crlf.byteLength +
		mediaHeader.byteLength +
		content.byteLength +
		crlf.byteLength +
		closingBoundary.byteLength +
		crlf.byteLength;

	const body = new Uint8Array(totalLength);
	let offset = 0;

	// First part: metadata
	body.set(boundaryBytes, offset);
	offset += boundaryBytes.byteLength;
	body.set(crlf, offset);
	offset += crlf.byteLength;
	body.set(metadataHeader, offset);
	offset += metadataHeader.byteLength;
	body.set(metadataContent, offset);
	offset += metadataContent.byteLength;
	body.set(crlf, offset);
	offset += crlf.byteLength;

	// Second part: media
	body.set(boundaryBytes, offset);
	offset += boundaryBytes.byteLength;
	body.set(crlf, offset);
	offset += crlf.byteLength;
	body.set(mediaHeader, offset);
	offset += mediaHeader.byteLength;
	body.set(content, offset);
	offset += content.byteLength;
	body.set(crlf, offset);
	offset += crlf.byteLength;

	// Closing boundary
	body.set(closingBoundary, offset);
	offset += closingBoundary.byteLength;
	body.set(crlf, offset);

	return { body, boundary };
};

type CreateFolderResponse = {
	kind: string;
	id: GoogleFileId;
	name: string;
	mimeType: string;
};

export const createFolder = async (
	authenticatedAxiosInstance: AxiosInstance,
	folderName: string,
	parentFolderId = ROOT_FOLDER_ID,
	metadata: Record<string, unknown> = {},
) => {
	const baseMetadata = {
		name: folderName,
		mimeType: "application/vnd.google-apps.folder",
		parents: [parentFolderId],
		...metadata,
		appProperties: {
			...ADDITIONAL_APP_PROPERTIES,
			...(metadata.appProperties ?? {}),
		},
	};

	const response = await authenticatedAxiosInstance.post(
		"/drive/v3/files",
		baseMetadata,
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return (response.data as CreateFolderResponse).id;
};

export const getExistingFolder = async (
	authenticatedAxiosInstance: AxiosInstance,
	folderName: string,
	parentFolderId = ROOT_FOLDER_ID,
): Promise<GoogleFileId | null> => {
	const escapedName = folderName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

	const response = await authenticatedAxiosInstance.get("/drive/v3/files", {
		params: {
			q:
				`name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${parentFolderId}' in parents` +
				` and appProperties has { key='source' and value='${ADDITIONAL_APP_PROPERTIES.source}' }` +
				` and appProperties has { key='environment' and value='${ADDITIONAL_APP_PROPERTIES.environment}' }`,
			fields: "files(id)",
			pageSize: 1,
		},
	});

	const files = response.data.files as { id: GoogleFileId }[];
	if (!files || files.length === 0) return null;
	return files[0].id;
};

export const getOrCreateFolder = async (
	authenticatedAxiosInstance: AxiosInstance,
	folderName: string,
	parentFolderId = ROOT_FOLDER_ID,
	metadata: Record<string, unknown> = {},
): Promise<GoogleFileId> => {
	const existingFolder = await getExistingFolder(
		authenticatedAxiosInstance,
		folderName,
		parentFolderId,
	);

	if (existingFolder) return existingFolder;

	return await createFolder(
		authenticatedAxiosInstance,
		folderName,
		parentFolderId,
		metadata,
	);
};

export const createFile = async (
	authenticatedAxiosInstance: AxiosInstance,
	fileName: string,
	content: Uint8Array,
	contentType: string,
	parentFolderId = ROOT_FOLDER_ID,
	metadata: Record<string, unknown> = {},
) => {
	const fileMetadata = {
		name: fileName,
		parents: [parentFolderId],
		...metadata,
		appProperties: {
			...ADDITIONAL_APP_PROPERTIES,
			...(metadata.appProperties ?? {}),
		},
	};

	const { body, boundary } = buildMultipartBody(
		fileMetadata,
		contentType,
		content,
	);

	return authenticatedAxiosInstance
		.post("/upload/drive/v3/files?uploadType=multipart", body, {
			headers: {
				"Content-Type": `multipart/related; boundary=${boundary}`,
				"Content-Length": body.byteLength,
			},
		})
		.then((res) => res.data);
};

export const getExistingFile = async (
	authenticatedAxiosInstance: AxiosInstance,
	fileName: string,
	parentFolderId = ROOT_FOLDER_ID,
): Promise<any | null> => {
	const appProperties = ADDITIONAL_APP_PROPERTIES;
	const appPropertiesQueryParts = Object.entries(appProperties).map(
		([key, value]) => {
			const escapedValue = String(value)
				.replace(/\\/g, "\\\\")
				.replace(/'/g, "\\'");
			return `appProperties has { key='${key}' and value='${escapedValue}' }`;
		},
	);
	const appPropertiesQuery =
		appPropertiesQueryParts.length > 0
			? ` and ${appPropertiesQueryParts.join(" and ")}`
			: "";

	const response = await authenticatedAxiosInstance.get("/drive/v3/files", {
		params: {
			q: `'${parentFolderId}' in parents and name = '${fileName}' and trashed = false${appPropertiesQuery}`,
			fields: "files(id, name, mimeType, parents, appProperties)",
			pageSize: 1,
		},
	});
	const files = response.data.files;
	return files && files.length > 0 ? files[0] : null;
};

export const updateExistingFile = async (
	authenticatedAxiosInstance: AxiosInstance,
	fileId: string,
	content: Uint8Array,
	contentType: string,
	metadata: Record<string, unknown> = {},
) => {
	const fileMetadata = {
		...metadata,
		appProperties: {
			...ADDITIONAL_APP_PROPERTIES,
			...(metadata.appProperties || {}),
		},
	};

	const { body, boundary } = buildMultipartBody(
		fileMetadata,
		contentType,
		content,
	);

	return authenticatedAxiosInstance
		.patch(`/upload/drive/v3/files/${fileId}?uploadType=multipart`, body, {
			headers: {
				"Content-Type": `multipart/related; boundary=${boundary}`,
				"Content-Length": body.byteLength,
			},
		})
		.then((res) => res.data);
};

export const getOrCreateFile = async (
	authenticatedAxiosInstance: AxiosInstance,
	fileName: string,
	content: Uint8Array,
	contentType: string,
	parentFolderId = ROOT_FOLDER_ID,
	metadata: Record<string, unknown> = {},
) => {
	const existingFile = await getExistingFile(
		authenticatedAxiosInstance,
		fileName,
		parentFolderId,
	);

	if (existingFile) return existingFile;

	return await createFile(
		authenticatedAxiosInstance,
		fileName,
		content,
		contentType,
		parentFolderId,
		metadata,
	);
};

export const readFile = async (
	authenticatedAxiosInstance: AxiosInstance,
	fileId: string,
): Promise<Uint8Array> => {
	const response = await authenticatedAxiosInstance.get(
		`/drive/v3/files/${fileId}`,
		{
			responseType: "arraybuffer",
			params: {
				alt: "media",
			},
		},
	);
	return new Uint8Array(response.data);
};
