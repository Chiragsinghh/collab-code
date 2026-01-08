import mongoose from "mongoose";

export const Connectdb = async () => {
    try {
        // Ensure the URI exists
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is not defined in .env");
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "codesync", // Explicitly name your database here
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        // Exit process with failure so you don't keep running a broken server
        process.exit(1);
    }
};