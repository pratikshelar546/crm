import { connect } from "mongoose";

export const connectMongoDB = async () => {
    try {
        const { MONGO_CONNECTION_URL } = process.env;
        console.log(MONGO_CONNECTION_URL);
        await connect(MONGO_CONNECTION_URL || "");
        console.log("connected to mongoDB");
        return true;
    } catch (error) {
        console.log("Failed to Connect with MongoDB");
    }
}