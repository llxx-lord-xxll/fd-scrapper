import ExcelJS from "exceljs";
import fetch from "node-fetch";
import Archiver from "archiver";
import { PassThrough } from "stream";
import pLimit from "p-limit";
import { Yarn } from "../models/Yarn.js";
import { buildQuery } from "./query.js";

function safeSheetName(name) {
	return (name || "Sheet").replace(/[\\/?*[\]:]/g, "_").slice(0, 31);
}

export async function streamExportYarns(req, res) {
	const ts = new Date().toISOString().replace(/[:.]/g, "-");
	const filename = `yarns-export-${ts}.zip`;
	res.setHeader("Content-Type", "application/zip");
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

	const archive = Archiver("zip", { zlib: { level: 9 } });
	archive.on("warning", (err) => {
		// Non-blocking archiver warnings
		console.warn("archiver warning:", err);
	});
	archive.on("error", (err) => {
		throw err;
	});
	archive.pipe(res);

	// Excel streaming setup
	const excelStream = new PassThrough();
	archive.append(excelStream, { name: "yarns.xlsx" });
	const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: excelStream, useStyles: false, useSharedStrings: false });
	const ws = workbook.addWorksheet(safeSheetName("Yarns"));
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

	// JSON streaming setup
	const jsonStream = new PassThrough();
	archive.append(jsonStream, { name: "yarns.json" });
	jsonStream.write("[\n");
	let firstJson = true;

	// Image fetching with concurrency limit
	const limit = pLimit(6);
	const imagePromises = [];
	let docCount = 0;

	const query = buildQuery(req.query);
	const cursor = Yarn.find(query).lean().cursor();

	for await (const d of cursor) {
		docCount++;
		// Excel row
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
				? d.color_cards.map((c) => c?.Name || c?.name || c?.Color || "").filter(Boolean).join(", ")
				: ""
		}).commit();

		// JSON streaming
		const json = JSON.stringify(d);
		jsonStream.write((firstJson ? "" : ",") + "\n" + json);
		firstJson = false;

		// Images
		const id = String(d._id || "");
		const baseDir = `media/${id}`;
		if (Array.isArray(d.images)) {
			d.images.forEach((url, idx) => {
				if (!url) return;
				imagePromises.push(
					limit(async () => {
						try {
							const resImg = await fetch(url);
							if (!resImg.ok) throw new Error(`HTTP ${resImg.status}`);
							const ext = (url.split(".").pop() || "jpg").split("?")[0].split("#")[0];
							archive.append(resImg.body, { name: `${baseDir}/image_${idx + 1}.${ext}` });
						} catch (e) {
							archive.append(Buffer.from(`Failed to fetch ${url}\n`), { name: `${baseDir}/image_${idx + 1}.txt` });
						}
					})
				);
			});
		}
		if (Array.isArray(d.color_cards)) {
			d.color_cards.forEach((cc, idx) => {
				const url = cc?.img;
				if (!url) return;
				imagePromises.push(
					limit(async () => {
						try {
							const resImg = await fetch(url);
							if (!resImg.ok) throw new Error(`HTTP ${resImg.status}`);
							const ext = (url.split(".").pop() || "jpg").split("?")[0].split("#")[0];
							archive.append(resImg.body, { name: `${baseDir}/color_card_${idx + 1}.${ext}` });
						} catch (e) {
							archive.append(Buffer.from(`Failed to fetch ${url}\n`), { name: `${baseDir}/color_card_${idx + 1}.txt` });
						}
					})
				);
			});
		}
	}

	// finalize JSON and Excel streams
	jsonStream.write("\n]\n");
	jsonStream.end();

	await workbook.commit();
	// Excel stream will end automatically after commit

	// Wait for all image appends to be scheduled/fetched
	await Promise.all(imagePromises);

	// finalize archive
	await archive.finalize();
}


