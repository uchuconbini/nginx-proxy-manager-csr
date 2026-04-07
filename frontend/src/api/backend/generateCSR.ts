import * as api from "./base";

export interface CSRRequest {
	commonName: string;
	organization?: string;
	organizationalUnit?: string;
	locality?: string;
	state?: string;
	country?: string;
	email?: string;
	keySize?: "2048" | "4096";
	keyType?: "rsa" | "ecdsa";
}

export interface CSRResponse {
	csr: string;
	privateKey: string;
	subject: string;
}

export async function generateCSR(data: CSRRequest): Promise<CSRResponse> {
	return await api.post({
		url: "/nginx/csr",
		data,
	});
}
