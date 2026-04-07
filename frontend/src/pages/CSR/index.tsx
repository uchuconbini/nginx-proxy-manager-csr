import { IconClipboard, IconDownload, IconKey } from "@tabler/icons-react";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { generateCSR, type CSRRequest, type CSRResponse } from "src/api/backend";
import { Button } from "src/components";
import { T } from "src/locale";

const COUNTRIES = [
	{ code: "", label: "-- Select Country --" },
	{ code: "AF", label: "Afghanistan" },
	{ code: "AL", label: "Albania" },
	{ code: "DZ", label: "Algeria" },
	{ code: "AD", label: "Andorra" },
	{ code: "AO", label: "Angola" },
	{ code: "AG", label: "Antigua and Barbuda" },
	{ code: "AR", label: "Argentina" },
	{ code: "AM", label: "Armenia" },
	{ code: "AU", label: "Australia" },
	{ code: "AT", label: "Austria" },
	{ code: "AZ", label: "Azerbaijan" },
	{ code: "BS", label: "Bahamas" },
	{ code: "BH", label: "Bahrain" },
	{ code: "BD", label: "Bangladesh" },
	{ code: "BB", label: "Barbados" },
	{ code: "BY", label: "Belarus" },
	{ code: "BE", label: "Belgium" },
	{ code: "BZ", label: "Belize" },
	{ code: "BJ", label: "Benin" },
	{ code: "BT", label: "Bhutan" },
	{ code: "BO", label: "Bolivia" },
	{ code: "BA", label: "Bosnia and Herzegovina" },
	{ code: "BW", label: "Botswana" },
	{ code: "BR", label: "Brazil" },
	{ code: "BN", label: "Brunei" },
	{ code: "BG", label: "Bulgaria" },
	{ code: "BF", label: "Burkina Faso" },
	{ code: "BI", label: "Burundi" },
	{ code: "CV", label: "Cabo Verde" },
	{ code: "KH", label: "Cambodia" },
	{ code: "CM", label: "Cameroon" },
	{ code: "CA", label: "Canada" },
	{ code: "CF", label: "Central African Republic" },
	{ code: "TD", label: "Chad" },
	{ code: "CL", label: "Chile" },
	{ code: "CN", label: "China" },
	{ code: "CO", label: "Colombia" },
	{ code: "KM", label: "Comoros" },
	{ code: "CG", label: "Congo" },
	{ code: "CD", label: "Congo (DRC)" },
	{ code: "CR", label: "Costa Rica" },
	{ code: "HR", label: "Croatia" },
	{ code: "CU", label: "Cuba" },
	{ code: "CY", label: "Cyprus" },
	{ code: "CZ", label: "Czech Republic" },
	{ code: "DK", label: "Denmark" },
	{ code: "DJ", label: "Djibouti" },
	{ code: "DM", label: "Dominica" },
	{ code: "DO", label: "Dominican Republic" },
	{ code: "EC", label: "Ecuador" },
	{ code: "EG", label: "Egypt" },
	{ code: "SV", label: "El Salvador" },
	{ code: "GQ", label: "Equatorial Guinea" },
	{ code: "ER", label: "Eritrea" },
	{ code: "EE", label: "Estonia" },
	{ code: "SZ", label: "Eswatini" },
	{ code: "ET", label: "Ethiopia" },
	{ code: "FJ", label: "Fiji" },
	{ code: "FI", label: "Finland" },
	{ code: "FR", label: "France" },
	{ code: "GA", label: "Gabon" },
	{ code: "GM", label: "Gambia" },
	{ code: "GE", label: "Georgia" },
	{ code: "DE", label: "Germany" },
	{ code: "GH", label: "Ghana" },
	{ code: "GR", label: "Greece" },
	{ code: "GD", label: "Grenada" },
	{ code: "GT", label: "Guatemala" },
	{ code: "GN", label: "Guinea" },
	{ code: "GW", label: "Guinea-Bissau" },
	{ code: "GY", label: "Guyana" },
	{ code: "HT", label: "Haiti" },
	{ code: "HN", label: "Honduras" },
	{ code: "HU", label: "Hungary" },
	{ code: "IS", label: "Iceland" },
	{ code: "IN", label: "India" },
	{ code: "ID", label: "Indonesia" },
	{ code: "IR", label: "Iran" },
	{ code: "IQ", label: "Iraq" },
	{ code: "IE", label: "Ireland" },
	{ code: "IL", label: "Israel" },
	{ code: "IT", label: "Italy" },
	{ code: "JM", label: "Jamaica" },
	{ code: "JP", label: "Japan" },
	{ code: "JO", label: "Jordan" },
	{ code: "KZ", label: "Kazakhstan" },
	{ code: "KE", label: "Kenya" },
	{ code: "KI", label: "Kiribati" },
	{ code: "KW", label: "Kuwait" },
	{ code: "KG", label: "Kyrgyzstan" },
	{ code: "LA", label: "Laos" },
	{ code: "LV", label: "Latvia" },
	{ code: "LB", label: "Lebanon" },
	{ code: "LS", label: "Lesotho" },
	{ code: "LR", label: "Liberia" },
	{ code: "LY", label: "Libya" },
	{ code: "LI", label: "Liechtenstein" },
	{ code: "LT", label: "Lithuania" },
	{ code: "LU", label: "Luxembourg" },
	{ code: "MG", label: "Madagascar" },
	{ code: "MW", label: "Malawi" },
	{ code: "MY", label: "Malaysia" },
	{ code: "MV", label: "Maldives" },
	{ code: "ML", label: "Mali" },
	{ code: "MT", label: "Malta" },
	{ code: "MH", label: "Marshall Islands" },
	{ code: "MR", label: "Mauritania" },
	{ code: "MU", label: "Mauritius" },
	{ code: "MX", label: "Mexico" },
	{ code: "FM", label: "Micronesia" },
	{ code: "MD", label: "Moldova" },
	{ code: "MC", label: "Monaco" },
	{ code: "MN", label: "Mongolia" },
	{ code: "ME", label: "Montenegro" },
	{ code: "MA", label: "Morocco" },
	{ code: "MZ", label: "Mozambique" },
	{ code: "MM", label: "Myanmar" },
	{ code: "NA", label: "Namibia" },
	{ code: "NR", label: "Nauru" },
	{ code: "NP", label: "Nepal" },
	{ code: "NL", label: "Netherlands" },
	{ code: "NZ", label: "New Zealand" },
	{ code: "NI", label: "Nicaragua" },
	{ code: "NE", label: "Niger" },
	{ code: "NG", label: "Nigeria" },
	{ code: "KP", label: "North Korea" },
	{ code: "MK", label: "North Macedonia" },
	{ code: "NO", label: "Norway" },
	{ code: "OM", label: "Oman" },
	{ code: "PK", label: "Pakistan" },
	{ code: "PW", label: "Palau" },
	{ code: "PA", label: "Panama" },
	{ code: "PG", label: "Papua New Guinea" },
	{ code: "PY", label: "Paraguay" },
	{ code: "PE", label: "Peru" },
	{ code: "PH", label: "Philippines" },
	{ code: "PL", label: "Poland" },
	{ code: "PT", label: "Portugal" },
	{ code: "QA", label: "Qatar" },
	{ code: "RO", label: "Romania" },
	{ code: "RU", label: "Russia" },
	{ code: "RW", label: "Rwanda" },
	{ code: "KN", label: "Saint Kitts and Nevis" },
	{ code: "LC", label: "Saint Lucia" },
	{ code: "VC", label: "Saint Vincent and the Grenadines" },
	{ code: "WS", label: "Samoa" },
	{ code: "SM", label: "San Marino" },
	{ code: "ST", label: "Sao Tome and Principe" },
	{ code: "SA", label: "Saudi Arabia" },
	{ code: "SN", label: "Senegal" },
	{ code: "RS", label: "Serbia" },
	{ code: "SC", label: "Seychelles" },
	{ code: "SL", label: "Sierra Leone" },
	{ code: "SG", label: "Singapore" },
	{ code: "SK", label: "Slovakia" },
	{ code: "SI", label: "Slovenia" },
	{ code: "SB", label: "Solomon Islands" },
	{ code: "SO", label: "Somalia" },
	{ code: "ZA", label: "South Africa" },
	{ code: "KR", label: "South Korea" },
	{ code: "SS", label: "South Sudan" },
	{ code: "ES", label: "Spain" },
	{ code: "LK", label: "Sri Lanka" },
	{ code: "SD", label: "Sudan" },
	{ code: "SR", label: "Suriname" },
	{ code: "SE", label: "Sweden" },
	{ code: "CH", label: "Switzerland" },
	{ code: "SY", label: "Syria" },
	{ code: "TW", label: "Taiwan" },
	{ code: "TJ", label: "Tajikistan" },
	{ code: "TZ", label: "Tanzania" },
	{ code: "TH", label: "Thailand" },
	{ code: "TL", label: "Timor-Leste" },
	{ code: "TG", label: "Togo" },
	{ code: "TO", label: "Tonga" },
	{ code: "TT", label: "Trinidad and Tobago" },
	{ code: "TN", label: "Tunisia" },
	{ code: "TR", label: "Turkey" },
	{ code: "TM", label: "Turkmenistan" },
	{ code: "TV", label: "Tuvalu" },
	{ code: "UG", label: "Uganda" },
	{ code: "UA", label: "Ukraine" },
	{ code: "AE", label: "United Arab Emirates" },
	{ code: "GB", label: "United Kingdom" },
	{ code: "US", label: "United States" },
	{ code: "UY", label: "Uruguay" },
	{ code: "UZ", label: "Uzbekistan" },
	{ code: "VU", label: "Vanuatu" },
	{ code: "VE", label: "Venezuela" },
	{ code: "VN", label: "Vietnam" },
	{ code: "YE", label: "Yemen" },
	{ code: "ZM", label: "Zambia" },
	{ code: "ZW", label: "Zimbabwe" },
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
