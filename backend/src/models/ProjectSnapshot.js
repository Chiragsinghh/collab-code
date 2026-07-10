import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },
    tree: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    message: { type: String },
    snapshotType: {
        type: String,
        enum: ["autosave", "manual", "run", "deploy"],
        default: "manual"
    }
}, {
    timestamps: true
});

// Compound index for getting latest snapshots
snapshotSchema.index({ projectId: 1, createdAt: -1 });

const ProjectSnapshot = mongoose.model("ProjectSnapshot", snapshotSchema);
export default ProjectSnapshot;
