// src/lib/api.ts

async function api(method: string, resource: string, data?: object) {
	const res = await fetch(`/${resource}`, {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: data ? JSON.stringify(data) : undefined
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message || 'Something went wrong');
	}

	return res.json();
}

export const get = (resource: string) => api('GET', resource);
export const post = (resource: string, data: object) => api('POST', resource, data);
export const put = (resource: string, data: object) => api('PUT', resource, data);
export const patch = (resource: string, data: object) => api('PATCH', resource, data);
export const del = (resource: string) => api('DELETE', resource);
