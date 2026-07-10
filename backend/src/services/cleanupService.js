import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), 'temp');
const PREVIEW_DIR = path.join(process.cwd(), 'previews');

const isOlderThan = (filePath, ageInMs) => {
    const stats = fs.statSync(filePath);
    return (Date.now() - stats.mtimeMs) > ageInMs;
};

export const cleanup = () => {
    console.log('Running cleanup...');
    const ONE_HOUR = 60 * 60 * 1000;

    // Cleanup temp files
    if (fs.existsSync(TEMP_DIR)) {
        fs.readdirSync(TEMP_DIR).forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            if (isOlderThan(filePath, ONE_HOUR)) {
                fs.rmSync(filePath, { recursive: true, force: true });
            }
        });
    }

    // Cleanup previews
    if (fs.existsSync(PREVIEW_DIR)) {
        fs.readdirSync(PREVIEW_DIR).forEach(file => {
            const filePath = path.join(PREVIEW_DIR, file);
            if (isOlderThan(filePath, ONE_HOUR)) {
                fs.rmSync(filePath, { recursive: true, force: true });
            }
        });
    }
};

// Simple interval runner (in production, use cron or separate worker)
setInterval(cleanup, 60 * 60 * 1000); // 1 hour
