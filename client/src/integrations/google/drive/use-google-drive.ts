import axios from "axios";
import { useMemo } from "react";
import { useGoogleProvider } from "../context/use-google-provider";

/**
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

export const useGoogleDrive = () => {
	const { accessToken } = useGoogleProvider();

	const googleDriveInstance = useMemo(() => {
		return axios.create({
			baseURL: "https://www.googleapis.com",
			headers: accessToken
				? {
						Authorization: `Bearer ${accessToken}`,
					}
				: {},
		});
	}, [accessToken]);

	const uploadMultipart = (
		filePath: string,
		contentType: string,
		content: Uint8Array,
		metadata: Record<string, unknown> = {},
	) => {
		const fileMetadata = {
			name: filePath.split("/").pop() || filePath,
			...metadata,
		};
		const { body, boundary } = buildMultipartBody(
			fileMetadata,
			contentType,
			content,
		);

		return googleDriveInstance
			.post("/upload/drive/v3/files?uploadType=multipart", body, {
				headers: {
					"Content-Type": `multipart/related; boundary=${boundary}`,
					"Content-Length": body.byteLength,
				},
			})
			.then((res) => res.data);
	};

	/**
	 * Update an existing file with new content (creates a new revision)
	 * @param fileId - The Google Drive file ID to update
	 * @param contentType - MIME type of the content
	 * @param content - File content as Uint8Array
	 * @param metadata - Optional metadata to update
	 * @returns The updated file metadata
	 */
	const updateMultipart = (
		fileId: string,
		contentType: string,
		content: Uint8Array,
		metadata: Record<string, unknown> = {},
	) => {
		const { body, boundary } = buildMultipartBody(metadata, contentType, content);

		return googleDriveInstance
			.patch(`/upload/drive/v3/files/${fileId}?uploadType=multipart`, body, {
				headers: {
					"Content-Type": `multipart/related; boundary=${boundary}`,
					"Content-Length": body.byteLength,
				},
			})
			.then((res) => res.data);
	};

	/**
	 * Get file ID by searching for a file with matching appProperties
	 * @param appProperties - Object of app properties to match (all must match)
	 * @returns The file ID if found, or null
	 */
	const getFileIdByAppProperties = async (
		appProperties: Record<string, string>,
	): Promise<string | null> => {
		// Build query: appProperties has { key='value' } for each property
		const queryParts = Object.entries(appProperties).map(([key, value]) => {
			const escapedValue = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
			return `appProperties has { key='${key}' and value='${escapedValue}' }`;
		});

		const query = `${queryParts.join(" and ")}`;

		const response = await googleDriveInstance.get("/drive/v3/files", {
			params: {
				q: query,
				fields: "files(id, name, appProperties)",
				pageSize: 1,
			},
		});

		const files = response.data.files;
		return files && files.length > 0 ? files[0].id : null;
	};

	/**
	 * Get the latest revision of a file by file ID
	 * @param fileId - The Google Drive file ID
	 * @returns The latest revision metadata, or null if no revisions exist
	 */
	const getLatestRevisionId = async (
		fileId: string,
	): Promise<string> => {
		// Get the head revision ID from file metadata
		const fileResponse = await googleDriveInstance.get(
			`/drive/v3/files/${fileId}`,
			{
				params: {
					fields: "headRevisionId",
				},
			},
		);

		return fileResponse.data.headRevisionId as string;
	};

	return {
		uploadMultipart,
		updateMultipart,
		getFileIdByAppProperties,
		getLatestRevisionId,
	};
};
