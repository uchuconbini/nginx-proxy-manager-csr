import * as api from "./base";

export interface SslCheckRequest {
	url: string;
}

export interface SslCheckResult {
	host: string;
	port: number;
	subject: string;
	issuer: string;
	validFrom: string;
	validTo: string;
	daysRemaining: number;
	sans: string[];
	fingerprint: string;
	expired: boolean;
	error?: string;
}

export async function checkSslExpiry(data: SslCheckRequest): Promise<SslCheckResult> {
	return await api.post({
		url: "/nginx/ssl-checker",
		data,
	});
}
