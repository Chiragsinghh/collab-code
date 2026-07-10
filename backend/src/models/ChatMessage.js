import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ChatMessage', chatMessageSchema);
