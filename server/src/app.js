import express from "express";
import cors from "cors";
import morgan from "morgan";
import yarnsRouter from "./routes/yarns.js";
import companiesRouter from "./routes/companies.js";
import exportRouter from "./routes/export.js";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"), false);
		},
		credentials: true
	})
);
app.use(express.json({ limit: "4mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
	res.json({ ok: true, service: "zgfzyx-scrapper-manager", time: new Date().toISOString() });
});

app.use("/api/yarns", yarnsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/export", exportRouter);

export default app;


