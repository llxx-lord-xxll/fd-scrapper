import { Yarn } from "../models/Yarn.js";

export function buildCompanyQuery(params) {
	const { q, name, city, products } = params;
	const query = {};
	const or = [];
	if (q) {
		or.push(
			{ "company.name": { $regex: q, $options: "i" } },
			{ "company.address": { $regex: q, $options: "i" } },
			{ "company.business_products": { $regex: q, $options: "i" } }
		);
	}
	if (name) query["company.name"] = { $regex: name, $options: "i" };
	if (city) query["company.address"] = { $regex: city, $options: "i" };
	if (products) query["company.business_products"] = { $regex: products, $options: "i" };
	if (or.length) query.$or = or;
	return query;
}

export async function companiesAggregate(match, opts = {}) {
	const { page = 1, limit = 20, sort = "company.name", order = "asc", paginate = true } = opts;
	const pipeline = [
		{ $match: { "company.name": { $exists: true, $ne: null, $ne: "" }, ...match } },
		{
			$group: {
				_id: {
					name: "$company.name",
					contact_link: "$company.contact_link",
					store_link: "$company.store_link",
					address: "$company.address",
					image: "$company.image",
					email: "$company.email",
					company_phone: "$company.company_phone",
					business_products: "$company.business_products"
				},
				yarnCount: { $sum: 1 }
			}
		},
		{
			$project: {
				_id: 0,
				name: "$_id.name",
				contact_link: "$_id.contact_link",
				store_link: "$_id.store_link",
				address: "$_id.address",
				image: "$_id.image",
				email: "$_id.email",
				company_phone: "$_id.company_phone",
				business_products: "$_id.business_products",
				yarnCount: 1
			}
		}
	];
	const sortObj = { [sort]: order === "asc" ? 1 : -1 };
	if (!paginate || !limit) {
		return await Yarn.aggregate([...pipeline, { $sort: sortObj }]);
	}
	const skip = (Number(page) - 1) * Number(limit);
	return await Yarn.aggregate([...pipeline, { $sort: sortObj }, { $skip: skip }, { $limit: Number(limit) }]);
}


