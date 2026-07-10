import mongoose from "mongoose";

const codeRunSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    language: { type: String, required: true },
    entryFile: { type: String },

    status: {
        type: String,
        enum: ["success", "error", "timeout"],
        required: true
    },
    stdout: { type: String },
    stderr: { type: String },

    runtimeMs: { type: Number },
    memoryKb: { type: Number },

    errorDetail: { type: String } // For system errors
}, {
    timestamps: true
});

codeRunSchema.index({ projectId: 1, createdAt: -1 });

const CodeRun = mongoose.model("CodeRun", codeRunSchema);
export default CodeRun;
