import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

const RUN_TIMEOUT = 5000; // 5 seconds hard limit

// Determine python command once on startup
let pythonCmd = "python3";
try {
    execSync("python3 --version", { stdio: "ignore" });
} catch (e) {
    pythonCmd = "python";
}

export const runCodeLocal = async (language, code, onLog) => {
    const jobId = uuidv4();
    const tempDir = path.join(process.cwd(), "temp", jobId);

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
        let filename;
        let compileCmd = null;
        let compileArgs = [];
        let runCmd;
        let runArgs = [];

        if (language === 'javascript') {
            filename = 'main.js';
            runCmd = 'node';
            runArgs = ['main.js'];
        } else if (language === 'python') {
            filename = 'main.py';
            runCmd = pythonCmd;
            runArgs = ['main.py'];
        } else if (language === 'cpp') {
            filename = 'main.cpp';
            compileCmd = 'g++';
            compileArgs = ['main.cpp', '-o', 'app'];
            runCmd = path.join(tempDir, 'app');
            runArgs = [];
        } else if (language === 'java') {
            filename = 'Main.java';
            compileCmd = 'javac';
            compileArgs = ['Main.java'];
            runCmd = 'java';
            runArgs = ['Main'];
        } else {
            throw new Error(`Unsupported language: ${language}`);
        }

        const filepath = path.join(tempDir, filename);
        await fs.promises.writeFile(filepath, code);

        // 1. Compilation phase (if needed)
        if (compileCmd) {
            onLog("⚙️ Compiling...\n");
            const compResult = await executeProcess(compileCmd, compileArgs, tempDir, onLog, RUN_TIMEOUT);
            if (compResult.code !== 0) {
                onLog(`\n❌ Compilation Failed (Exit Code: ${compResult.code})\n`);
                return { output: compResult.output, exitCode: compResult.code };
            }
        }

        // 2. Execution phase
        onLog("🚀 Running...\n");
        const runResult = await executeProcess(runCmd, runArgs, tempDir, onLog, RUN_TIMEOUT);
        return { output: runResult.output, exitCode: runResult.code };

    } finally {
        // Cleanup Files
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    }
};

const executeProcess = (cmd, args, cwd, onLog, timeoutMs) => {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, { cwd });
        const outputChunks = [];
        let timedOut = false;

        const timeoutTimer = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, timeoutMs);

        child.stdout.on("data", (data) => {
            const text = data.toString();
            outputChunks.push(text);
            if (onLog) onLog(text);
        });

        child.stderr.on("data", (data) => {
            const text = data.toString();
            outputChunks.push(text);
            if (onLog) onLog(text);
        });

        child.on("close", (code) => {
            clearTimeout(timeoutTimer);
            if (timedOut) {
                const timeoutMsg = "\n❌ Execution timed out (Limit: 5s)\n";
                if (onLog) onLog(timeoutMsg);
                resolve({ code: -1, output: outputChunks.join("") + timeoutMsg });
            } else {
                resolve({ code: code ?? 0, output: outputChunks.join("") });
            }
        });

        child.on("error", (err) => {
            clearTimeout(timeoutTimer);
            const errMsg = `\n❌ Error spawning process: ${err.message}\n`;
            if (onLog) onLog(errMsg);
            resolve({ code: -1, output: outputChunks.join("") + errMsg });
        });
    });
};
