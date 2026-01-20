/**
 * Safely parse a URL string, returning null if invalid
 */
export function parseUrl(url: string): URL | null {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

/**
 * Check if a URL string points to an internal document
 * @param url - The URL string to check
 * @param currentOrigin - The current origin (window.location.origin)
 * @returns true if the URL is an internal document link
 */
export function isInternalDocumentUrl(
	url: string,
	currentOrigin: string,
): boolean {
	const parsedUrl = parseUrl(url);
	if (!parsedUrl) return false;

	if (parsedUrl.origin !== currentOrigin) return false;

	const documentPathPattern =
		/^\/docs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return documentPathPattern.test(parsedUrl.pathname);
}

/**
 * Extract document ID from an internal document URL
 * @param url - The URL string
 * @returns the document ID if valid, null otherwise
 */
export function extractDocumentId(url: string): string | null {
	const parsedUrl = parseUrl(url);
	if (!parsedUrl) return null;

	const match = parsedUrl.pathname.match(
		/^\/docs\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
	);
	return match ? match[1] : null;
}

/**
 * Check if an href string points to an internal document
 * @param href - The href string (already extracted from a link)
 * @param currentOrigin - The current origin (window.location.origin)
 * @returns true if the href is an internal document link
 */
export function isInternalDocumentHref(
	href: string,
	currentOrigin: string,
): boolean {
	try {
		const url = new URL(href);
		if (url.origin !== currentOrigin) return false;

		const documentPathPattern =
			/^\/docs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return documentPathPattern.test(url.pathname);
	} catch {
		return false;
	}
}
