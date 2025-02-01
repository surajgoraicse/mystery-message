// check if db is already connected, then skip the db connection.
// after connecting db, update the isConnected field

import mongoose from "mongoose";

type ConnectionObject = {
	isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
	if (connection.isConnected) {
		console.log("Already connected to database");
		return;
	}
	try {
		const db = await mongoose.connect(process.env.MONGODB_URI || "", {
			dbName: "mystery-message",
		});
		connection.isConnected = db.connections[0].readyState;
		console.log("DB connected successfully");
	} catch (error) {
		console.log("Database connection failed : ", error);
		process.exit(1);
	}
}

export default dbConnect;
