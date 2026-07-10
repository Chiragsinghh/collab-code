import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // 'RUN', 'DEPLOY', 'PROJECT_CREATE', 'LOGIN'
    details: { type: Object },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ActivityLog', activityLogSchema);
