import { Router } from "express";
import { Yarn } from "../models/Yarn.js";

const router = Router();

function buildQuery(params) {
	const {
		q,
		name,
		code,
		brand,
		companyName,
		companyCity,
		categoryName,
		categoryId
	} = params;

	const query = {};

	if (q) {
		query.$text = { $search: q };
	}
	if (name) query.name = { $regex: name, $options: "i" };
	if (code) query.code = { $regex: code, $options: "i" };
	if (brand) query.brand = { $regex: brand, $options: "i" };

	if (companyName) query["company.name"] = { $regex: companyName, $options: "i" };
	if (companyCity) query["company.address"] = { $regex: companyCity, $options: "i" };

	if (categoryName) query["category.category_name"] = { $regex: categoryName, $options: "i" };
	if (categoryId) query["category.category_id"] = categoryId;

	return query;
}

router.get("/", async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			sort = "createdAt",
			order = "desc"
		} = req.query;

		const query = buildQuery(req.query);

		const skip = (Number(page) - 1) * Number(limit);
		const sortObj = { [sort]: order === "asc" ? 1 : -1 };

		const [items, total] = await Promise.all([
			Yarn.find(query).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
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
		res.status(500).json({ error: "Failed to fetch yarns" });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const doc = await Yarn.findById(req.params.id).lean();
		if (!doc) return res.status(404).json({ error: "Not found" });
		res.json(doc);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch yarn" });
	}
});

export default router;


