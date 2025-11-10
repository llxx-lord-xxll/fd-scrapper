import ExcelJS from "exceljs";
import fetch from "node-fetch";
import Archiver from "archiver";
import pLimit from "p-limit";

function safeSheetName(name) {
	return (name || "Sheet").replace(/[\\/?*[\]:]/g, "_").slice(0, 31);
}

async function buildWorkbook(docs) {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet(safeSheetName("Yarns"));

	ws.columns = [
		{ header: "ID", key: "_id", width: 26 },
		{ header: "Name", key: "name", width: 28 },
		{ header: "Code", key: "code", width: 18 },
		{ header: "Brand", key: "brand", width: 24 },
		{ header: "Description", key: "description", width: 60 },
		{ header: "Category", key: "category_name", width: 20 },
		{ header: "Company", key: "company_name", width: 28 },
		{ header: "Link", key: "link", width: 40 },
		{ header: "Images", key: "images", width: 60 },
		{ header: "Color Cards", key: "color_cards", width: 40 }
	];

	for (const d of docs) {
		ws.addRow({
			_id: String(d._id),
			name: d.name || "",
			code: d.code || "",
			brand: d.brand || "",
			description: d.description || "",
			category_name: d.category?.category_name || "",
			company_name: d.company?.name || "",
			link: d.link || "",
			images: Array.isArray(d.images) ? d.images.join(", ") : "",
			color_cards: Array.isArray(d.color_cards)
				? d.color_cards.map((c) => c.Name || c.name || c.Color || "").filter(Boolean).join(", ")
				: ""
		});
	}
	return wb;
}

async function fetchBuffer(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return Buffer.from(await res.arrayBuffer());
}

export async function createExportArchive(docs) {
	const wb = await buildWorkbook(docs);
	const archive = Archiver("zip", { zlib: { level: 9 } });
	const ts = new Date().toISOString().replace(/[:.]/g, "-");
	const filename = `yarns-export-${ts}.zip`;

	// Excel file
	const excelStream = await wb.xlsx.writeBuffer();
	archive.append(Buffer.from(excelStream), { name: "yarns.xlsx" });

	// JSON snapshot
	archive.append(Buffer.from(JSON.stringify(docs, null, 2), "utf-8"), { name: "yarns.json" });

	// Images folder
	const limit = pLimit(6);
	const imageTasks = [];
	docs.forEach((doc) => {
		const id = String(doc._id || "");
		const baseDir = `media/${id}`;
		// main images
		if (Array.isArray(doc.images)) {
			doc.images.forEach((url, idx) => {
				if (!url) return;
				imageTasks.push(
					limit(async () => {
						try {
							const buf = await fetchBuffer(url);
							const ext = (url.split(".").pop() || "jpg").split("?")[0].split("#")[0];
							archive.append(buf, { name: `${baseDir}/image_${idx + 1}.${ext}` });
						} catch (e) {
							archive.append(Buffer.from(`Failed to fetch ${url}\n`), { name: `${baseDir}/image_${idx + 1}.txt` });
						}
					})
				);
			});
		}
		// color cards images
		if (Array.isArray(doc.color_cards)) {
			doc.color_cards.forEach((cc, idx) => {
				const url = cc?.img;
				if (!url) return;
				imageTasks.push(
					limit(async () => {
						try {
							const buf = await fetchBuffer(url);
							const ext = (url.split(".").pop() || "jpg").split("?")[0].split("#")[0];
							archive.append(buf, { name: `${baseDir}/color_card_${idx + 1}.${ext}` });
						} catch (e) {
							archive.append(Buffer.from(`Failed to fetch ${url}\n`), { name: `${baseDir}/color_card_${idx + 1}.txt` });
						}
					})
				);
			});
		}
	});

	await Promise.all(imageTasks);

	return { archive, filename };
}


