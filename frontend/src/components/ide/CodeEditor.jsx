/**
 * CodeEditor.jsx — Monaco with codesync-dark theme + collaborative cursors
 */

import { useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";

const CURSOR_COLORS = [
  "#E4895F",
  "#7FB39E",
  "#5FA8E4",
  "#E45F8F",
  "#A85FE4",
  "#E4C75F",
  "#5FE4A8",
  "#FF6B6B",
  "#4D96FF",
  "#6BCB77",
  "#FFD93D",
  "#B983FF",
  "#FF8AAE",
  "#94B49F",
];

export const getUserColor = (username) => {
  const key = username || "user";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
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
    md: "markdown",
  };

  return map[ext] || "plaintext";
};

const defineCodeSyncTheme = (monaco) => {
  monaco.editor.defineTheme("codesync-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "9B988F", fontStyle: "italic" },
      { token: "keyword", foreground: "7FB39E" },
      { token: "string", foreground: "E4895F" },
      { token: "number", foreground: "E4895F" },
      { token: "type", foreground: "E4A98A" },
      { token: "identifier", foreground: "F4F1EA" },
      { token: "delimiter", foreground: "9B988F" },
      { token: "tag", foreground: "7FB39E" },
      { token: "attribute.name", foreground: "E4895F" },
    ],
    colors: {
      "editor.background": "#1E1B16",
      "editor.foreground": "#F4F1EA",
      "editorCursor.foreground": "#E4895F",
      "editor.lineHighlightBackground": "#221F1A",
      "editorLineNumber.foreground": "#57544C",
      "editorLineNumber.activeForeground": "#9B988F",
      "editor.selectionBackground": "#E4895F33",
      "editor.inactiveSelectionBackground": "#E4895F1A",
      "editorIndentGuide.background": "#2A271F",
      "editorIndentGuide.activeBackground": "#3A362C",
      "editorWhitespace.foreground": "#2A271F",
      "editorGutter.background": "#1E1B16",
      "scrollbarSlider.background": "#33302966",
      "scrollbarSlider.hoverBackground": "#333029AA",
    },
  });
};

const createRemoteCursorWidget = (monaco, userId, username, color, lineHeight = 19) => {
  const domNode = document.createElement("div");
  domNode.className = "remote-cursor-widget";

  const caret = document.createElement("span");
  caret.className = "remote-cursor-caret";
  caret.style.background = color;
  caret.style.height = `${lineHeight}px`;

  const label = document.createElement("span");
  label.className = "remote-cursor-label";
  label.style.background = color;
  label.textContent = username;

  domNode.appendChild(caret);
  domNode.appendChild(label);

  const widget = {
    userId,
    username,
    color,
    lineHeight,
    position: { lineNumber: 1, column: 1 },
    domNode,
    labelEl: label,
    caretEl: caret,
    getId() {
      return `remote-cursor-${userId}`;
    },
    getDomNode() {
      return domNode;
    },
    getPosition() {
      return {
        position: widget.position,
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
      };
    },
    update(nextUsername, nextColor, position, nextLineHeight) {
      widget.username = nextUsername;
      widget.color = nextColor;
      widget.position = position;
      if (nextLineHeight) {
        widget.lineHeight = nextLineHeight;
        widget.caretEl.style.height = `${nextLineHeight}px`;
      }
      widget.labelEl.textContent = nextUsername;
      widget.labelEl.style.background = nextColor;
      widget.caretEl.style.background = nextColor;
    },
  };

  return widget;
};

export default function CodeEditor({
  activeFile,
  onChange,
  remoteCursors = {},
  onCursorChange,
  currentUserId,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const widgetsRef = useRef(new Map());

  const clearAllWidgets = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      for (const widget of widgetsRef.current.values()) {
        editor.removeContentWidget(widget);
      }
    }
    widgetsRef.current.clear();
  }, []);

  const syncRemoteCursors = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeFile) return;

    const visible = Object.entries(remoteCursors).filter(
      ([uid, data]) =>
        String(uid) !== String(currentUserId) &&
        data.fileId === activeFile.id &&
        data.cursor?.lineNumber &&
        data.cursor?.column
    );

    const visibleIds = new Set(visible.map(([uid]) => uid));

    for (const [uid, widget] of widgetsRef.current.entries()) {
      if (!visibleIds.has(uid)) {
        editor.removeContentWidget(widget);
        widgetsRef.current.delete(uid);
      }
    }

    for (const [uid, data] of visible) {
      const displayName = data.username || "Collaborator";
      const color = getUserColor(displayName);
      const position = {
        lineNumber: data.cursor.lineNumber,
        column: data.cursor.column,
      };
      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);

      let widget = widgetsRef.current.get(uid);
      if (!widget) {
        widget = createRemoteCursorWidget(monaco, uid, displayName, color, lineHeight);
        widgetsRef.current.set(uid, widget);
        editor.addContentWidget(widget);
      } else {
        widget.update(displayName, color, position, lineHeight);
      }

      editor.layoutContentWidget(widget);
    }
  }, [remoteCursors, activeFile, currentUserId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.onDidChangeCursorSelection((e) => {
      onCursorChange?.({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    });

    syncRemoteCursors();
  };

  useEffect(() => {
    clearAllWidgets();
  }, [activeFile?.id, clearAllWidgets]);

  useEffect(() => {
    syncRemoteCursors();
  }, [syncRemoteCursors]);

  useEffect(() => {
    return () => clearAllWidgets();
  }, [clearAllWidgets]);

  if (!activeFile) return null;

  return (
    <>
      <style>{`
        .remote-cursor-widget {
          position: relative;
          width: 0;
          height: 0;
          overflow: visible;
          pointer-events: none;
          z-index: 50;
        }
        .remote-cursor-caret {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          width: 2px;
          border-radius: 1px;
        }
        .remote-cursor-label {
          position: absolute;
          bottom: calc(100% + 2px);
          left: 0;
          display: inline-block;
          color: #fff;
          font-size: 10px;
          font-family: Inter, sans-serif;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px 4px 4px 0;
          white-space: nowrap;
          line-height: 1.2;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }
      `}</style>
      <Editor
        height="100%"
        theme="codesync-dark"
        beforeMount={defineCodeSyncTheme}
        path={activeFile.id}
        defaultLanguage={detectLanguage(activeFile.name)}
        language={detectLanguage(activeFile.name)}
        value={activeFile.content || ""}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </>
  );
}
