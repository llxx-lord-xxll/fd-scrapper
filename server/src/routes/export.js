import { Router } from "express";
import { Yarn } from "../models/Yarn.js";
import { createExportArchive } from "../utils/exportYarns.js";
import { streamExportYarns } from "../utils/exportYarnsStream.js";
import { buildQuery as buildYarnQuery } from "../utils/query.js";
import { buildCompanyQuery, companiesAggregate } from "../utils/companies.js";

const router = Router();

router.get("/yarns", async (req, res) => {
	// Stream large exports to avoid memory pressure/timeouts
	return streamExportYarns(req, res).catch((err) => {
		console.error(err);
		if (!res.headersSent) {
			res.status(500).json({ error: "Failed to export yarns" });
		} else {
			res.end();
		}
	});
});

// Single-yarn export (zip: excel + json + images for that yarn)
router.get("/yarn/:id", async (req, res) => {
	try {
		const doc = await Yarn.findById(req.params.id).lean();
		if (!doc) return res.status(404).json({ error: "Yarn not found" });
		const { archive } = await createExportArchive([doc]);
		const filename = `yarn-${String(doc._id)}.zip`;
		res.setHeader("Content-Type", "application/zip");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		archive.pipe(res);
		await archive.finalize();
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to export yarn" });
	}
});

router.get("/companies.csv", async (req, res) => {
	try {
		const match = buildCompanyQuery(req.query);
		// Run aggregate without pagination to export full current query
		const items = await companiesAggregate(match, { page: 1, limit: 0, sort: "company.name", order: "asc", paginate: false });

		const headers = [
			"name",
			"address",
			"email",
			"company_phone",
			"business_products",
			"contact_link",
			"store_link",
			"yarnCount"
		];

		function csvEscape(val) {
			if (val === null || val === undefined) return "";
			const s = String(val);
			if (/[",\n]/.test(s)) {
				return `"${s.replace(/"/g, '""')}"`;
			}
			return s;
		}

		const lines = [];
		lines.push(headers.join(","));
		for (const c of items) {
			lines.push(
				[
					csvEscape(c.name),
					csvEscape(c.address),
					csvEscape(c.email),
					csvEscape(c.company_phone),
					csvEscape(c.business_products),
					csvEscape(c.contact_link),
					csvEscape(c.store_link),
					csvEscape(c.yarnCount)
				].join(",")
			);
		}

		const ts = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `companies-${ts}.csv`;
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		res.send("\uFEFF" + lines.join("\n")); // include BOM for Excel
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to export companies CSV" });
	}
});

export default router;


