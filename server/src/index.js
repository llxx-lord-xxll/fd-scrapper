import dotenv from "dotenv";
import { connectToDatabase } from "./db.js";
import app from "./app.js";

dotenv.config();
const DB_NAME = process.env.MONGODB_DB || "zgfzyx";
const DB_USER = process.env.MONGODB_USER || "metricalo";
const DB_PASS = process.env.MONGODB_PASSWORD;
const DB_HOST = process.env.MONGODB_HOST || "metricalo.43bj4rj.mongodb.net";

const PORT = process.env.PORT || 4000;
const MONGODB_URI = (() => {
	// Priority 1: Full URI provided
	if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
	// Priority 2: Build SRV URI from password and optional host/user/db
	if (DB_PASS) {
		const encoded = encodeURIComponent(DB_PASS);
		return `mongodb+srv://${DB_USER}:${encoded}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
	}
	// Priority 3: Local fallback
	return `mongodb://localhost:27017/${DB_NAME}`;
})();

async function start() {
	try {
		await connectToDatabase(MONGODB_URI, DB_NAME);
		console.log("Connected to MongoDB");
		app.listen(PORT, () => {
			console.log(`Server listening on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server", err);
		process.exit(1);
	}
}

start();


