import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { getAvailablePort } from '../utils/portAllocator.js';

const PREVIEW_ROOT = path.join(process.cwd(), 'previews');
if (!fs.existsSync(PREVIEW_ROOT)) fs.mkdirSync(PREVIEW_ROOT);

const runningServers = new Map(); // roomId -> { process, port, url }

export const startPreview = async (roomId, files) => {
    const projectPath = path.join(PREVIEW_ROOT, roomId);

    // 1. Clean & Create Directory
    // Ideally we sync intelligently, but for now we recreate to ensure consistency
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    // 2. Write Files
    files.forEach(file => {
        const filePath = path.join(projectPath, file.path);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        // Write only if content is string; if it's a directory node in tree, skip
        if (typeof file.content === 'string') {
            fs.writeFileSync(filePath, file.content);
        }
    });

    // 3. Check for existing server
    if (runningServers.has(roomId)) {
        const server = runningServers.get(roomId);
        try {
            process.kill(-server.process.pid); // Kill process group
        } catch (e) {
            console.log(`Failed to kill process group ${server.process.pid}:`, e.message);
        }
        runningServers.delete(roomId);
    }

    // 4. Determine Project Type & Command
    const packageJsonPath = path.join(projectPath, 'package.json');
    let command = 'npm start';
    let args = [];

    if (fs.existsSync(packageJsonPath)) {
        // 5. Allocate Port
        const port = await getAvailablePort();

        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.scripts && pkg.scripts.dev) {
            command = 'npm';
            args = ['run', 'dev', '--', '--host', '--port', port.toString()];
        } else if (pkg.scripts && pkg.scripts.start) {
            command = 'npm';
            args = ['start'];
        }

        // 6. Install Dependencies
        if (!fs.existsSync(path.join(projectPath, 'node_modules'))) {
            await new Promise((resolve) => {
                exec('npm install', { cwd: projectPath }, (err, stdout, stderr) => {
                    if (err) {
                        console.error("Install error:", stderr);
                    }
                    resolve();
                });
            });
        }

        // 7. Start Server
        const child = spawn(command, args, {
            cwd: projectPath,
            detached: true,
            shell: true,
            stdio: 'ignore'
        });

        child.unref(); // Allow backend to exit independently

        const url = `http://localhost:${port}`;
        runningServers.set(roomId, { process: child, port, url });
        return { url };
    } else {
        // Fallback to serving static files directly via Express static middleware on port 5001!
        const backendPort = process.env.PORT || 5001;
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${backendPort}`;
        const url = `${backendUrl}/previews/${roomId}/`;
        return { url };
    }
};
