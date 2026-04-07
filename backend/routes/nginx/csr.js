import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import express from "express";
import jwtdecode from "../../lib/express/jwt-decode.js";
import errs from "../../lib/error.js";
import { debug, express as logger } from "../../logger.js";

const router = express.Router({
	caseSensitive: true,
	strict: true,
	mergeParams: true,
});

/**
 * POST /api/nginx/csr
 *
 * Generate a CSR (Certificate Signing Request) and private key
 */
router
	.route("/")
	.options((_, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())
	.post(async (req, res, next) => {
		try {
			if (!res.locals.access.token.getUserId()) {
				throw new errs.PermissionError("Login required");
			}

			const {
				commonName,
				organization = "",
				organizationalUnit = "",
				locality = "",
				state = "",
				country = "",
				email = "",
				keySize = "2048",
				keyType = "rsa",
			} = req.body;

			if (!commonName || commonName.trim() === "") {
				throw new errs.ValidationError("common_name is required");
			}

			// Validate country code
			if (country && !/^[A-Za-z]{0,2}$/.test(country)) {
				throw new errs.ValidationError("country must be a 2-letter code");
			}

			// Validate key size
			const validKeySizes = ["2048", "4096"];
			const validKeyTypes = ["rsa", "ecdsa"];
			if (!validKeySizes.includes(String(keySize))) {
				throw new errs.ValidationError("keySize must be 2048 or 4096");
			}
			if (!validKeyTypes.includes(keyType)) {
				throw new errs.ValidationError("keyType must be rsa or ecdsa");
			}

			// Build subject string - escape special characters
			const escapeField = (val) => val.replace(/[/\\]/g, "_").trim();
			const subjectParts = [];
			if (country) subjectParts.push(`C=${escapeField(country.toUpperCase())}`);
			if (state) subjectParts.push(`ST=${escapeField(state)}`);
			if (locality) subjectParts.push(`L=${escapeField(locality)}`);
			if (organization) subjectParts.push(`O=${escapeField(organization)}`);
			if (organizationalUnit) subjectParts.push(`OU=${escapeField(organizationalUnit)}`);
			subjectParts.push(`CN=${escapeField(commonName)}`);
			if (email) subjectParts.push(`emailAddress=${escapeField(email)}`);

			const subject = `/${subjectParts.join("/")}`;

			// Use a temp directory
			const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "npm-csr-"));
			const keyFile = path.join(tmpDir, "key.pem");
			const csrFile = path.join(tmpDir, "csr.pem");

			try {
				if (keyType === "ecdsa") {
					// Generate ECDSA key and CSR
					execSync(
						`openssl ecparam -name prime256v1 -genkey -noout -out ${keyFile}`,
						{ timeout: 30000 },
					);
					execSync(
						`openssl req -new -key ${keyFile} -out ${csrFile} -subj "${subject}"`,
						{ timeout: 30000 },
					);
				} else {
					// Generate RSA key and CSR in one command
					execSync(
						`openssl req -new -newkey rsa:${keySize} -nodes -keyout ${keyFile} -out ${csrFile} -subj "${subject}"`,
						{ timeout: 30000 },
					);
				}

				const csrContent = fs.readFileSync(csrFile, "utf8");
				const keyContent = fs.readFileSync(keyFile, "utf8");

				res.status(200).send({
					csr: csrContent,
					privateKey: keyContent,
					subject,
				});
			} finally {
				// Clean up temp files
				try {
					fs.rmSync(tmpDir, { recursive: true, force: true });
				} catch (_) {
					// ignore cleanup errors
				}
			}
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.path}: ${err}`);
			next(err);
		}
	});

export default router;
