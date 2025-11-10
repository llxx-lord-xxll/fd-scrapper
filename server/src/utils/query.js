export function buildQuery(params) {
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


