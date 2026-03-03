const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
    const explicitBase = import.meta.env.VITE_API_URL?.trim();
    if (explicitBase) {
        return trimTrailingSlash(explicitBase);
    }

    // In local dev we rely on Vite's /api proxy configuration.
    return '';
};

export const buildApiUrl = (path: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getApiBaseUrl()}${normalizedPath}`;
};
