import { IconClipboard, IconDownload, IconKey } from "@tabler/icons-react";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { generateCSR, type CSRRequest, type CSRResponse } from "src/api/backend";
import { Button } from "src/components";
import { T } from "src/locale";

const COUNTRIES = [
	{ code: "", label: "-- Select Country --" },
	{ code: "AU", label: "Australia" },
	{ code: "BR", label: "Brazil" },
	{ code: "CA", label: "Canada" },
	{ code: "CN", label: "China" },
	{ code: "FR", label: "France" },
	{ code: "DE", label: "Germany" },
	{ code: "IN", label: "India" },
	{ code: "IT", label: "Italy" },
	{ code: "JP", label: "Japan" },
	{ code: "MX", label: "Mexico" },
	{ code: "NL", label: "Netherlands" },
	{ code: "PL", label: "Poland" },
	{ code: "PT", label: "Portugal" },
	{ code: "RU", label: "Russia" },
	{ code: "ES", label: "Spain" },
	{ code: "SE", label: "Sweden" },
	{ code: "CH", label: "Switzerland" },
	{ code: "GB", label: "United Kingdom" },
	{ code: "US", label: "United States" },
];

const initialValues: CSRRequest = {
	commonName: "",
	organization: "",
	organizationalUnit: "",
	locality: "",
	state: "",
	country: "",
	email: "",
	keySize: "2048",
	keyType: "rsa",
};

const copyToClipboard = (text: string) => {
	navigator.clipboard.writeText(text);
};

const downloadFile = (content: string, filename: string) => {
	const blob = new Blob([content], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};

export default function CSRGenerator() {
	const [result, setResult] = useState<CSRResponse | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [copiedCsr, setCopiedCsr] = useState(false);
	const [copiedKey, setCopiedKey] = useState(false);

	const handleCopyCsr = () => {
		if (result) {
			copyToClipboard(result.csr);
			setCopiedCsr(true);
			setTimeout(() => setCopiedCsr(false), 2000);
		}
	};

	const handleCopyKey = () => {
		if (result) {
			copyToClipboard(result.privateKey);
			setCopiedKey(true);
			setTimeout(() => setCopiedKey(false), 2000);
		}
	};

	const onSubmit = async (values: CSRRequest) => {
		setIsSubmitting(true);
		setErrorMsg(null);
		setResult(null);
		try {
			const data = await generateCSR(values);
			setResult(data);
		} catch (err: any) {
			setErrorMsg(err.message || "Failed to generate CSR");
		}
		setIsSubmitting(false);
	};

	return (
		<div className="container-xl mt-4">
			<div className="row">
				<div className="col">
					<h2 className="mb-0">
						<T id="csr.title" />
					</h2>
					<p className="text-muted mt-1">
						<T id="csr.subtitle" />
					</p>
				</div>
			</div>

			<div className="row mt-3">
				<div className="col-lg-6">
					<div className="card">
						<div className="card-status-top bg-teal" />
						<div className="card-header">
							<h3 className="card-title">
								<T id="csr.form.title" />
							</h3>
						</div>
						<div className="card-body">
							{errorMsg && (
								<Alert variant="danger" onClose={() => setErrorMsg(null)} dismissible>
									{errorMsg}
								</Alert>
							)}
							<Formik initialValues={initialValues} onSubmit={onSubmit}>
								{() => (
									<Form>
										<div className="mb-3">
											<label className="form-label required">
												<T id="csr.field.common-name" />
											</label>
											<Field
												name="commonName"
												className="form-control"
												placeholder="example.com"
												required
											/>
											<small className="form-text text-muted">
												<T id="csr.field.common-name.hint" />
											</small>
										</div>

										<div className="mb-3">
											<label className="form-label">
												<T id="csr.field.organization" />
											</label>
											<Field
												name="organization"
												className="form-control"
												placeholder="My Company Ltd"
											/>
										</div>

										<div className="mb-3">
											<label className="form-label">
												<T id="csr.field.organizational-unit" />
											</label>
											<Field
												name="organizationalUnit"
												className="form-control"
												placeholder="IT Department"
											/>
										</div>

										<div className="row">
											<div className="col">
												<div className="mb-3">
													<label className="form-label">
														<T id="csr.field.city" />
													</label>
													<Field
														name="locality"
														className="form-control"
														placeholder="San Francisco"
													/>
												</div>
											</div>
											<div className="col">
												<div className="mb-3">
													<label className="form-label">
														<T id="csr.field.state" />
													</label>
													<Field
														name="state"
														className="form-control"
														placeholder="California"
													/>
												</div>
											</div>
										</div>

										<div className="mb-3">
											<label className="form-label">
												<T id="csr.field.country" />
											</label>
											<Field name="country" as="select" className="form-select">
												{COUNTRIES.map((c) => (
													<option key={c.code} value={c.code}>
														{c.label}
													</option>
												))}
											</Field>
										</div>

										<div className="mb-3">
											<label className="form-label">
												<T id="csr.field.email" />
											</label>
											<Field
												name="email"
												type="email"
												className="form-control"
												placeholder="admin@example.com"
											/>
										</div>

										<div className="row">
											<div className="col">
												<div className="mb-3">
													<label className="form-label">
														<T id="csr.field.key-type" />
													</label>
													<Field name="keyType" as="select" className="form-select">
														<option value="rsa">RSA</option>
														<option value="ecdsa">ECDSA (prime256v1)</option>
													</Field>
												</div>
											</div>
											<div className="col">
												<div className="mb-3">
													<label className="form-label">
														<T id="csr.field.key-size" />
													</label>
													<Field name="keySize" as="select" className="form-select">
														<option value="2048">2048 bit</option>
														<option value="4096">4096 bit</option>
													</Field>
													<small className="form-text text-muted">
														<T id="csr.field.key-size.hint" />
													</small>
												</div>
											</div>
										</div>

										<Button
											type="submit"
											actionType="primary"
											className="bg-teal w-100"
											isLoading={isSubmitting}
											disabled={isSubmitting}
										>
											<IconKey size={16} className="me-1" />
											<T id="csr.generate" />
										</Button>
									</Form>
								)}
							</Formik>
						</div>
					</div>
				</div>

				{result && (
					<div className="col-lg-6">
						<div className="card mb-3">
							<div className="card-status-top bg-teal" />
							<div className="card-header">
								<h3 className="card-title">
									<T id="csr.result.csr-title" />
								</h3>
								<div className="card-options">
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary me-1"
										onClick={handleCopyCsr}
									>
										<IconClipboard size={14} className="me-1" />
										{copiedCsr ? <T id="csr.copied" /> : <T id="csr.copy" />}
									</button>
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary"
										onClick={() => downloadFile(result.csr, "request.csr")}
									>
										<IconDownload size={14} className="me-1" />
										<T id="csr.download" />
									</button>
								</div>
							</div>
							<div className="card-body p-0">
								<textarea
									className="form-control font-monospace"
									rows={10}
									readOnly
									value={result.csr}
									style={{ border: "none", borderRadius: 0, resize: "vertical", fontSize: "0.75rem" }}
								/>
							</div>
						</div>

						<div className="card">
							<div className="card-status-top bg-orange" />
							<div className="card-header">
								<h3 className="card-title">
									<T id="csr.result.key-title" />
								</h3>
								<div className="card-options">
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary me-1"
										onClick={handleCopyKey}
									>
										<IconClipboard size={14} className="me-1" />
										{copiedKey ? <T id="csr.copied" /> : <T id="csr.copy" />}
									</button>
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary"
										onClick={() => downloadFile(result.privateKey, "private.key")}
									>
										<IconDownload size={14} className="me-1" />
										<T id="csr.download" />
									</button>
								</div>
							</div>
							<div className="card-body p-0">
								<textarea
									className="form-control font-monospace"
									rows={10}
									readOnly
									value={result.privateKey}
									style={{ border: "none", borderRadius: 0, resize: "vertical", fontSize: "0.75rem" }}
								/>
							</div>
							<div className="card-footer text-warning">
								<small>
									<strong><T id="csr.result.key-warning-title" /></strong>{" "}
									<T id="csr.result.key-warning" />
								</small>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
