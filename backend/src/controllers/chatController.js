import ChatMessage from '../models/ChatMessage.js';

export const getHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
