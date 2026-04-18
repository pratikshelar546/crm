import mongoose from "mongoose";

let isConnected = false;
let connectingPromise: Promise<typeof mongoose> | null = null;

export const connectMongoDB = async () => {
    if (isConnected) return true;

    const { MONGO_CONNECTION_URL } = process.env;
    if (!MONGO_CONNECTION_URL) {
        throw new Error("MONGO_CONNECTION_URL is missing");
    }

    try {
        if (!connectingPromise) {
            connectingPromise = mongoose.connect(MONGO_CONNECTION_URL, {
                serverSelectionTimeoutMS: 30000,
            });
        }

        await connectingPromise;
        isConnected = true;
        console.log("Connected to MongoDB");
        return true;
    } catch (error) {
        connectingPromise = null;
        isConnected = false;
        console.log("Failed to connect with MongoDB", error);
        throw error;
    }
};