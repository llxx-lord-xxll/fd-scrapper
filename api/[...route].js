import app from "../server/src/app.js";
import { connectToDatabase } from "../server/src/db.js";

const DB_NAME = process.env.MONGODB_DB || "zgfzyx";
const DB_USER = process.env.MONGODB_USER || "metricalo";
const DB_PASS = process.env.MONGODB_PASSWORD;
const DB_HOST = process.env.MONGODB_HOST || "metricalo.43bj4rj.mongodb.net";

const MONGODB_URI = (() => {
	if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
	if (DB_PASS) {
		const encoded = encodeURIComponent(DB_PASS);
		return `mongodb+srv://${DB_USER}:${encoded}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
	}
	return `mongodb://localhost:27017/${DB_NAME}`;
})();

export default async function handler(req, res) {
	await connectToDatabase(MONGODB_URI, DB_NAME);
	return app(req, res);
}


