import { useEffect, useMemo, useState } from "react";
import { api, toQuery } from "../lib/api.js";
import {
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	Grid,
	Button,
	TextField,
	Typography
} from "@mui/material";
import PaginationBar from "../components/PaginationBar.jsx";

export default function Companies() {
	const [filters, setFilters] = useState({
		q: "",
		name: "",
		city: "",
		products: ""
	});
	const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1, limit: 20 });
	const [loading, setLoading] = useState(false);

	const queryParams = useMemo(
		() => ({
			...filters,
			page: data.page,
			limit: data.limit,
			sort: "company.name",
			order: "asc"
		}),
		[filters, data.page, data.limit]
	);

	useEffect(() => {
		let cancel = false;
		async function run() {
			setLoading(true);
			try {
				const qs = toQuery(queryParams);
				const res = await api.get(`/companies?${qs}`);
				if (!cancel) setData((d) => ({ ...d, ...res.data }));
			} finally {
				if (!cancel) setLoading(false);
			}
		}
		run();
		return () => {
			cancel = true;
		};
	}, [queryParams]);

	function setField(field, value) {
		setData((d) => ({ ...d, page: 1 })); // reset page on filter change
		setFilters((f) => ({ ...f, [field]: value }));
	}

	async function onExportCsv() {
		const params = { ...filters }; // no pagination
		const qs = toQuery(params);
		const res = await api.get(`/export/companies.csv?${qs}`, { responseType: "blob" });
		const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "companies.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	return (
		<Box>
			<Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 2 }}>
				<TextField label="Search" value={filters.q} onChange={(e) => setField("q", e.target.value)} />
				<TextField label="Name" value={filters.name} onChange={(e) => setField("name", e.target.value)} />
				<TextField label="City / Address" value={filters.city} onChange={(e) => setField("city", e.target.value)} />
				<TextField label="Products" value={filters.products} onChange={(e) => setField("products", e.target.value)} />
			</Box>
			<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
				<Button variant="contained" onClick={onExportCsv}>
					Export current query (CSV)
				</Button>
				<Typography variant="body2" sx={{ alignSelf: "center", opacity: 0.7 }}>
					Showing {data.items.length} of {data.total}
				</Typography>
			</Box>
			<Grid container spacing={2}>
				{data.items.map((c, idx) => (
					<Grid key={`${c.name}-${idx}`} item xs={12} md={6} lg={4}>
						<Card variant="outlined">
							<CardContent>
								<Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
									<Avatar src={c.image} alt={c.name} />
									<Box sx={{ flex: 1 }}>
										<Typography variant="h6">{c.name}</Typography>
										<Typography variant="body2" sx={{ opacity: 0.8 }}>
											{c.address || ""}
										</Typography>
									</Box>
								</Box>

								<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
									{c.company_phone ? <Chip size="small" label={c.company_phone} /> : null}
									{c.email ? <Chip size="small" label={c.email} /> : null}
									{c.business_products ? <Chip size="small" label={c.business_products} /> : null}
								</Box>

								<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
									{c.contact_link ? (
										<Chip size="small" label="Contact" component="a" href={c.contact_link} target="_blank" clickable />
									) : null}
									{c.store_link ? (
										<Chip size="small" label="Store" component="a" href={c.store_link} target="_blank" clickable />
									) : null}
									<Chip size="small" color="primary" label={`Yarns: ${c.yarnCount || 0}`} />
								</Box>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
			<PaginationBar
				page={data.page}
				totalPages={data.totalPages}
				total={data.total}
				onChange={(p) => setData((d) => ({ ...d, page: p }))}
			/>
		</Box>
	);
}


