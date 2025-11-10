import { Router } from "express";
import { Yarn } from "../models/Yarn.js";
import { buildCompanyQuery, companiesAggregate } from "../utils/companies.js";

const router = Router();

// Unique company list derived from yarn documents
router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			sort = "company.name",
			order = "asc"
		} = req.query;

		const query = buildCompanyQuery(req.query);

		// Count
		const count = await Yarn.aggregate([
			{ $match: { "company.name": { $exists: true, $ne: null, $ne: "" }, ...query } },
			{ $group: { _id: "$company.name" } },
			{ $count: "total" }
		]);
		const total = count[0]?.total || 0;

		const items = await companiesAggregate(query, { page: Number(page), limit: Number(limit), sort, order, paginate: true });

		res.json({
			items,
			page: Number(page),
			limit: Number(limit),
			total,
			totalPages: Math.ceil(total / Number(limit))
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch companies" });
	}
});

// Yarns by company name
router.get("/:name/yarns", async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;
		const skip = (Number(page) - 1) * Number(limit);
		const name = decodeURIComponent(req.params.name);
		const query = { "company.name": name };
		const [items, total] = await Promise.all([
			Yarn.find(query).skip(skip).limit(Number(limit)).lean(),
			Yarn.countDocuments(query)
		]);
		res.json({
			items,
			page: Number(page),
			limit: Number(limit),
			total,
			totalPages: Math.ceil(total / Number(limit))
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch company yarns" });
	}
});

export default router;


