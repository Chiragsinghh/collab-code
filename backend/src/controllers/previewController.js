import { startPreview } from '../services/previewService.js';

export const runPreview = async (req, res) => {
    try {
        const { roomId, files } = req.body;
        if (!roomId || !files) {
            return res.status(400).json({ message: "Missing roomId or files" });
        }

        const { url } = await startPreview(roomId, files);
        res.json({ url });
    } catch (error) {
        console.error("Preview error:", error);
        res.status(500).json({ message: error.message });
    }
};
