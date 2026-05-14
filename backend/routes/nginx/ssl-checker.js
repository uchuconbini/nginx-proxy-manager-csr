import tls from "tls";
import express from "express";
import jwtdecode from "../../lib/express/jwt-decode.js";
import errs from "../../lib/error.js";
import { debug, express as logger } from "../../logger.js";

const router = express.Router({
	caseSensitive: true,
	strict: true,
	mergeParams: true,
});

function extractHostname(input) {
	let host = input.trim();
	// Strip protocol if present
	host = host.replace(/^https?:\/\//i, "");
	// Strip path, query, hash
	host = host.split("/")[0].split("?")[0].split("#")[0];
	// Strip port
	const portMatch = host.match(/^(.+):(\d+)$/);
	if (portMatch) {
		return { host: portMatch[1], port: parseInt(portMatch[2], 10) };
	}
	return { host, port: 443 };
}

/**
 * POST /api/nginx/ssl-checker
 */
router
	.route("/")
	.options((_, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())
	.post((req, res, next) => {
		try {
			if (!res.locals.access.token.getUserId()) {
				throw new errs.PermissionError("Login required");
			}

			const { url } = req.body;
			if (!url || String(url).trim() === "") {
				throw new errs.ValidationError("url is required");
			}

			const { host, port } = extractHostname(String(url));

			if (!host || host.length < 1) {
				throw new errs.ValidationError("Invalid URL or hostname");
			}

			const socket = tls.connect(
				{ host, port, servername: host, rejectUnauthorized: false, timeout: 10000 },
				() => {
					const cert = socket.getPeerCertificate(true);
					socket.end();

					if (!cert || !cert.subject) {
						return res.status(200).send({
							error: "No certificate returned by server",
						});
					}

					const validFrom = new Date(cert.valid_from);
					const validTo = new Date(cert.valid_to);
					const now = new Date();
					const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

					const sans = cert.subjectaltname
						? cert.subjectaltname
							.split(", ")
							.filter((s) => s.startsWith("DNS:"))
							.map((s) => s.replace("DNS:", ""))
						: [];

					res.status(200).send({
						host,
						port,
						subject: cert.subject?.CN || "",
						issuer: cert.issuer?.O || cert.issuer?.CN || "",
						validFrom: validFrom.toISOString(),
						validTo: validTo.toISOString(),
						daysRemaining,
						sans,
						fingerprint: cert.fingerprint256 || cert.fingerprint || "",
						expired: daysRemaining < 0,
					});
				},
			);

			socket.on("error", (err) => {
				res.status(200).send({ error: `Connection failed: ${err.message}` });
			});

			socket.setTimeout(10000, () => {
				socket.destroy();
				res.status(200).send({ error: "Connection timed out" });
			});
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.path}: ${err}`);
			next(err);
		}
	});

export default router;
