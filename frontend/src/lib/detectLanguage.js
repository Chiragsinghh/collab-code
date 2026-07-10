export function detectLanguage(filename) {
    const ext = filename.split(".").pop();
  
    const map = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "tsx",
      py: "python",
      cpp: "cpp",
      c: "c",
      java: "java",
      html: "html",
      css: "css",
      json: "json"
    };
  
    return map[ext] || "plaintext";
  }
  