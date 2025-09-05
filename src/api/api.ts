import { API_BASE_URL } from "@/lib/utils";

interface HttpClientConfig {
    method?: RequestInit["method"];
    headers?: Record<string, string>;
    body?: object;
}

export function httpClient(
	relativeUrl: string,
	config: HttpClientConfig = { method: "GET" }
) {
	const defaultHeaders = config.method === "POST" ? { "Content-Type": "application/json" } : {};
	return fetch(`${API_BASE_URL}${relativeUrl}`, {
		method: config?.method || "GET",
		headers: {
			...defaultHeaders,
			...config?.headers,
		},
		body: config?.body ? JSON.stringify(config.body) : null,
		credentials: "include",
	});
}