import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    provider: {
        type: String,
        enum: ["vercel", "netlify", "docker", "custom"],
        required: true
    },
    deploymentUrl: { type: String },

    status: {
        type: String,
        enum: ["custom", "building", "success", "failed"],
        default: "building"
    },

    buildLogs: { type: String },
    commitHash: { type: String },

    durationMs: { type: Number }
}, {
    timestamps: true
});

deploymentSchema.index({ projectId: 1, createdAt: -1 });

const Deployment = mongoose.model("Deployment", deploymentSchema);
export default Deployment;
