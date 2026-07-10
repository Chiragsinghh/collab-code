import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

export const executeCode = async (language, code) => {
  return new Promise((resolve) => {
    const jobId = uuid();

    const tempDir = path.join("temp", jobId);
    fs.mkdirSync(tempDir, { recursive: true });

    let fileName = "";
    let command = "";

    /* LANGUAGE SUPPORT */
    if (language === "javascript") {
      fileName = "main.js";
      command = `node ${fileName}`;
    }

    if (language === "python") {
      fileName = "main.py";
      command = `python3 ${fileName}`;
    }

    if (language === "cpp") {
      fileName = "main.cpp";
      command = `g++ main.cpp -o main && ./main`;
    }

    if (!fileName) {
      return resolve("❌ Language not supported yet.");
    }

    /* WRITE FILE */
    fs.writeFileSync(path.join(tempDir, fileName), code);

    /* EXECUTE */
    exec(
      command,
      { cwd: tempDir, timeout: 5000 },
      (err, stdout, stderr) => {
        if (err) {
          resolve(`❌ Error:\n${stderr || err.message}`);
        } else {
          resolve(stdout || "✅ Ran successfully (no output)");
        }
      }
    );
  });
};
