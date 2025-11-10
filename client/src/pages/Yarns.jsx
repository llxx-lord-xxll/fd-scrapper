import { useEffect, useMemo, useState } from "react";
import { api, toQuery } from "../lib/api.js";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Grid,
	IconButton,
	ImageList,
	ImageListItem,
	InputAdornment,
	TextField,
	Typography
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FileZipIcon from "@mui/icons-material/Archive";
import PaginationBar from "../components/PaginationBar.jsx";
import ColorCardDialog from "../components/ColorCardDialog.jsx";

export default function Yarns() {
	const [filters, setFilters] = useState({
		q: "",
		name: "",
		code: "",
		brand: "",
		companyName: "",
		categoryName: ""
	});
	const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1, limit: 20 });
	const [loading, setLoading] = useState(false);
	const [colorCardDialog, setColorCardDialog] = useState({ open: false, value: null });

	const queryParams = useMemo(
		() => ({
			...filters,
			page: data.page,
			limit: data.limit,
			sort: "createdAt",
			order: "desc"
		}),
		[filters, data.page, data.limit]
	);

	useEffect(() => {
		let cancel = false;
		async function run() {
			setLoading(true);
			try {
				const qs = toQuery(queryParams);
				const res = await api.get(`/yarns?${qs}`);
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

	async function onExport() {
		const exportParams = { ...filters }; // no pagination
		const qs = toQuery(exportParams);
		const res = await api.get(`/export/yarns?${qs}`, { responseType: "blob" });
		const blob = new Blob([res.data], { type: "application/zip" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "yarns-export.zip";
		a.click();
		URL.revokeObjectURL(url);
	}

	async function onExportOne(id) {
		const res = await api.get(`/export/yarn/${id}`, { responseType: "blob" });
		const blob = new Blob([res.data], { type: "application/zip" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `yarn-${id}.zip`;
		a.click();
		URL.revokeObjectURL(url);
	}

	return (
		<Box>
			<Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2, mb: 2 }}>
				<TextField label="Search" value={filters.q} onChange={(e) => setField("q", e.target.value)} />
				<TextField label="Name" value={filters.name} onChange={(e) => setField("name", e.target.value)} />
				<TextField label="Code" value={filters.code} onChange={(e) => setField("code", e.target.value)} />
				<TextField label="Brand" value={filters.brand} onChange={(e) => setField("brand", e.target.value)} />
				<TextField label="Company" value={filters.companyName} onChange={(e) => setField("companyName", e.target.value)} />
				<TextField label="Category" value={filters.categoryName} onChange={(e) => setField("categoryName", e.target.value)} />
			</Box>
			<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
				<Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport}>
					Export current query
				</Button>
				<Typography variant="body2" sx={{ alignSelf: "center", opacity: 0.7 }}>
					{loading ? "Loading..." : `Showing ${data.items.length} of ${data.total}`}
				</Typography>
			</Box>
			<Grid container spacing={2}>
				{data.items.map((item) => (
					<Grid key={item._id} item xs={12} md={6} lg={4}>
						<Card variant="outlined">
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
									<Typography variant="h6">{item.name || "Untitled"}</Typography>
									{item.link ? (
										<IconButton size="small" href={item.link} target="_blank" rel="noreferrer">
											<OpenInNewIcon fontSize="small" />
										</IconButton>
									) : null}
								</Box>
								<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                                    {item.code ? <Chip label={item.code} size="small" /> : null}
									{item.brand ? <Chip label={item.brand} size="small" /> : null}
									{item.category?.category_name ? <Chip label={item.category.category_name} size="small" /> : null}
									{item.company?.name ? <Chip label={item.company.name} size="small" color="primary" /> : null}
								</Box>
								<Typography variant="body2" sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
									{item.description || ""}
								</Typography>
								{Array.isArray(item.images) && item.images.length > 0 ? (
									<ImageList cols={3} rowHeight={120} sx={{ mb: 1 }}>
										{item.images.slice(0, 6).map((src, idx) => (
											<ImageListItem key={idx}>
												<img src={src} loading="lazy" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
											</ImageListItem>
										))}
									</ImageList>
								) : null}
								{Array.isArray(item.color_cards) && item.color_cards.length > 0 ? (
									<Box sx={{ mb: 1 }}>
										<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
											Color cards
										</Typography>
										<ImageList cols={4} rowHeight={90} sx={{ mb: 1 }}>
											{item.color_cards
												.filter((cc) => cc?.img)
												.slice(0, 8)
												.map((cc, idx) => (
													<ImageListItem key={idx} onClick={() => setColorCardDialog({ open: true, value: cc })} sx={{ cursor: "pointer" }}>
														<img
															src={cc.img}
															loading="lazy"
															style={{ objectFit: "cover", width: "100%", height: "100%" }}
														/>
													</ImageListItem>
												))}
										</ImageList>
										<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
											{item.color_cards.slice(0, 16).map((cc, idx) => (
												<Chip
													key={idx}
													size="small"
													onClick={() => setColorCardDialog({ open: true, value: cc })}
													label={
														cc?.Name ||
														cc?.name ||
														(cc?.Color ? `Color ${cc.Color}` : cc?.["Pantone Color"] || `Card ${idx + 1}`)
													}
												/>
											))}
										</Box>
									</Box>
								) : null}
								<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
									<Button size="small" startIcon={<FileZipIcon />} onClick={() => onExportOne(item._id)}>
										Export ZIP
									</Button>
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
			<ColorCardDialog
				open={colorCardDialog.open}
				colorCard={colorCardDialog.value}
				onClose={() => setColorCardDialog({ open: false, value: null })}
			/>
		</Box>
	);
}


