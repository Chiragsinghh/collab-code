import mongoose from "mongoose";

const fileOpLogSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    filePath: { type: String, required: true },
    operation: {
        type: String,
        enum: ["create", "update", "delete", "rename"],
        required: true
    },

    beforeHash: { type: String },
    afterHash: { type: String }
}, {
    timestamps: true
});

fileOpLogSchema.index({ projectId: 1, filePath: 1 });

const FileOperationLog = mongoose.model("FileOperationLog", fileOpLogSchema);
export default FileOperationLog;
