import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
	baseURL: API_URL,
	timeout: 30000
});

export function toQuery(params) {
	const usp = new URLSearchParams();
	Object.entries(params || {}).forEach(([k, v]) => {
		if (v === undefined || v === null || v === "") return;
		usp.set(k, v);
	});
	return usp.toString();
}


