const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}
	return response.json() as Promise<TRes>;
}
