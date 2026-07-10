import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

const colors = [
  "#E4895F", // clay
  "#7FB39E", // teal
  "#5FA8E4", // blue
  "#E45F8F", // pink
  "#A85FE4", // purple
  "#E4C75F", // yellow
  "#5FE4A8", // light green
  "#FF6B6B", // rose red
  "#4D96FF", // neon blue
  "#6BCB77", // emerald green
  "#FFD93D", // gold yellow
  "#B983FF", // lavender purple
  "#FF8AAE", // hot pink
  "#94B49F", // sage green
];

const getUserColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const detectLanguage = (filename) => {
  if (!filename) return "plaintext";
  const ext = filename.split(".").pop();

  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    cpp: "cpp",
    java: "java",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown"
  };

  return map[ext] || "plaintext";
};

export default function CodeEditor({ activeFile, onChange, remoteCursors = {}, onCursorChange }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track local cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      }
    });
  };

  // Reset decorations when active file ID changes
  useEffect(() => {
    decorationsRef.current = [];
  }, [activeFile?.id]);

  // Apply decorations whenever remote cursors or active file updates
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFile) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Filter cursors that are in the active file
    const currentFileCursors = Object.entries(remoteCursors).filter(
      ([uid, data]) => data.fileId === activeFile.id && data.cursor
    );

    const newDecorations = currentFileCursors.map(([uid, data]) => {
      const { cursor, username } = data;
      const color = getUserColor(username);

      // Inject / update style element for the user's cursor styling
      const styleId = `monaco-remote-cursor-style-${uid}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        .remote-cursor-${uid} {
          border-left: 2px solid ${color};
          margin-left: -1px;
          position: relative;
        }
        .remote-cursor-${uid}::after {
          content: "${username}";
          position: absolute;
          top: -14px;
          left: 0;
          background: ${color};
          color: #fff;
          font-size: 10px;
          font-family: sans-serif;
          padding: 1px 4px;
          border-radius: 2px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0.9;
          z-index: 100;
        }
      `;

      return {
        range: new monaco.Range(
          cursor.lineNumber,
          cursor.column,
          cursor.lineNumber,
          cursor.column
        ),
        options: {
          className: `remote-cursor-${uid}`,
          hoverMessage: { value: username }
        }
      };
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [remoteCursors, activeFile, activeFile?.id]);

  // Clean up injected CSS style elements on unmount
  useEffect(() => {
    return () => {
      const styles = document.querySelectorAll("[id^='monaco-remote-cursor-style-']");
      styles.forEach((s) => s.remove());
    };
  }, []);

  if (!activeFile) return null;

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      path={activeFile.name} // Helps Monaco with intellisense
      defaultLanguage={detectLanguage(activeFile.name)}
      language={detectLanguage(activeFile.name)}
      value={activeFile.content || ""}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false }, // Save space
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
