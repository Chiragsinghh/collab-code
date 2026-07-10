import mongoose from "mongoose";

const previewSessionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },
    roomId: {
        type: String,
        required: true,
        index: true
    },

    port: { type: Number, unique: true, required: true },
    previewUrl: { type: String, required: true },

    status: {
        type: String,
        enum: ["starting", "running", "stopped", "failed"],
        default: "starting"
    },

    processId: { type: Number }, // PID of the spawn process
    containerId: { type: String }, // If using Docker

    lastAccessAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Auto-expire after 2 hours unused
previewSessionSchema.index({ lastAccessAt: 1 }, { expireAfterSeconds: 7200 });

const PreviewSession = mongoose.model("PreviewSession", previewSessionSchema);
export default PreviewSession;
