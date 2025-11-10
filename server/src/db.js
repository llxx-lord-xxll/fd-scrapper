import mongoose from "mongoose";

let cached = global.__mongooseCached;
if (!cached) {
	cached = global.__mongooseCached = { conn: null, promise: null };
}

export async function connectToDatabase(uri, dbName) {
	if (cached.conn) {
		return cached.conn;
	}
	if (!cached.promise) {
		const MONGODB_URI = uri;
		if (!MONGODB_URI) {
			throw new Error("MONGODB_URI is not set");
		}
		cached.promise = mongoose.connect(MONGODB_URI, { dbName }).then((mongoose) => {
			return mongoose;
		});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}


