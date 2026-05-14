import { IconSearch, IconShield, IconShieldOff, IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import { checkSslExpiry, type SslCheckResult } from "src/api/backend";
import { T } from "src/locale";

function StatusBadge({ result }: { result: SslCheckResult }) {
	if (result.expired) {
		return <span className="badge bg-red ms-2"><T id="ssl-checker.status.expired" /></span>;
	}
	if (result.daysRemaining <= 14) {
		return <span className="badge bg-orange ms-2"><T id="ssl-checker.status.expiring-soon" /></span>;
	}
	return <span className="badge bg-green ms-2"><T id="ssl-checker.status.valid" /></span>;
}

function ResultCard({ result }: { result: SslCheckResult }) {
	const validFrom = new Date(result.validFrom).toLocaleString();
	const validTo = new Date(result.validTo).toLocaleString();
	const isExpired = result.expired;
	const isWarningSoon = !isExpired && result.daysRemaining <= 14;

	return (
		<div className="card mt-4">
			<div className={`card-status-top ${isExpired ? "bg-red" : isWarningSoon ? "bg-orange" : "bg-green"}`} />
			<div className="card-header">
				<h3 className="card-title d-flex align-items-center">
					{isExpired ? (
						<IconShieldOff size={20} className="me-2 text-danger" />
					) : (
						<IconShield size={20} className="me-2 text-success" />
					)}
					{result.host}:{result.port}
					<StatusBadge result={result} />
				</h3>
			</div>
			<div className="card-body">
				{isExpired && (
					<Alert variant="danger" className="mb-3">
						<IconShieldOff size={16} className="me-1" />
						<T id="ssl-checker.alert.expired" />
					</Alert>
				)}
				{isWarningSoon && (
					<Alert variant="warning" className="mb-3">
						<IconAlertTriangle size={16} className="me-1" />
						<T id="ssl-checker.alert.expiring-soon" data={{ days: result.daysRemaining }} />
					</Alert>
				)}
				<div className="row">
					<div className="col-md-6">
						<table className="table table-sm table-borderless">
							<tbody>
								<tr>
									<td className="text-muted fw-semibold" style={{ width: "40%" }}>
										<T id="ssl-checker.field.subject" />
									</td>
									<td className="font-monospace">{result.subject || "—"}</td>
								</tr>
								<tr>
									<td className="text-muted fw-semibold"><T id="ssl-checker.field.issuer" /></td>
									<td>{result.issuer || "—"}</td>
								</tr>
								<tr>
									<td className="text-muted fw-semibold"><T id="ssl-checker.field.valid-from" /></td>
									<td>{validFrom}</td>
								</tr>
								<tr>
									<td className="text-muted fw-semibold"><T id="ssl-checker.field.valid-to" /></td>
									<td className={isExpired ? "text-danger fw-bold" : isWarningSoon ? "text-warning fw-bold" : ""}>
										{validTo}
									</td>
								</tr>
								<tr>
									<td className="text-muted fw-semibold"><T id="ssl-checker.field.days-remaining" /></td>
									<td className={isExpired ? "text-danger fw-bold" : isWarningSoon ? "text-warning fw-bold" : "text-success fw-bold"}>
										{isExpired
											? <T id="ssl-checker.field.days-remaining.expired" data={{ days: Math.abs(result.daysRemaining) }} />
											: <T id="ssl-checker.field.days-remaining.value" data={{ days: result.daysRemaining }} />
										}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="col-md-6">
						{result.sans.length > 0 && (
							<>
								<p className="text-muted fw-semibold mb-1"><T id="ssl-checker.field.sans" /></p>
								<div className="d-flex flex-wrap gap-1">
									{result.sans.map((san) => (
										<span key={san} className="badge bg-azure-lt font-monospace">{san}</span>
									))}
								</div>
							</>
						)}
						{result.fingerprint && (
							<div className="mt-3">
								<p className="text-muted fw-semibold mb-1"><T id="ssl-checker.field.fingerprint" /></p>
								<code style={{ fontSize: "0.7rem", wordBreak: "break-all" }}>{result.fingerprint}</code>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function SSLChecker() {
	const [url, setUrl] = useState("");
	const [result, setResult] = useState<SslCheckResult | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleCheck = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setIsLoading(true);
		setErrorMsg(null);
		setResult(null);

		try {
			const data = await checkSslExpiry({ url: url.trim() });
			if (data.error) {
				setErrorMsg(data.error);
			} else {
				setResult(data);
			}
		} catch (err: any) {
			setErrorMsg(err.message || "Failed to check SSL certificate");
		}
		setIsLoading(false);
	};

	return (
		<div className="container-xl mt-4">
			<div className="row">
				<div className="col">
					<h2 className="mb-0"><T id="ssl-checker.title" /></h2>
					<p className="text-muted mt-1"><T id="ssl-checker.subtitle" /></p>
				</div>
			</div>

			<div className="row mt-3">
				<div className="col-lg-8">
					<form onSubmit={handleCheck}>
						<div className="input-group">
							<input
								type="text"
								className="form-control form-control-lg"
								placeholder="example.com or https://example.com"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								disabled={isLoading}
								autoFocus
							/>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isLoading || !url.trim()}
							>
								{isLoading ? (
									<span className="spinner-border spinner-border-sm me-1" />
								) : (
									<IconSearch size={16} className="me-1" />
								)}
								<T id="ssl-checker.check" />
							</button>
						</div>
					</form>

					{errorMsg && (
						<Alert variant="danger" className="mt-3" onClose={() => setErrorMsg(null)} dismissible>
							{errorMsg}
						</Alert>
					)}

					{result && <ResultCard result={result} />}
				</div>
			</div>
		</div>
	);
}
