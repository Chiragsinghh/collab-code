import React from 'react';
import Editor from "@monaco-editor/react";

export default function CodeEditor({ activeFile, onChange, onCursorChange }) {
  const handleEditorDidMount = (editor, monaco) => {
    // Listen for cursor position changes for the footer
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange({
        line: e.position.lineNumber,
        col: e.position.column
      });
    });

    // Defining a custom dark theme to match your UI
    monaco.editor.defineTheme('codesync-dark', {
      base: 'vs-dark', // This is the base dark theme
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0B0E14', // Very dark background from your image
        'editor.lineHighlightBackground': '#ffffff05',
        'editorLineNumber.foreground': '#454545',
        'editorLineNumber.activeForeground': '#00E5FF',
        'editorCursor.foreground': '#00E5FF',
      }
    });

    // Apply the theme immediately
    monaco.editor.setTheme('codesync-dark');
  };

  return (
    <div className="h-full w-full bg-[#0B0E14]">
      <Editor
        height="100%"
        theme="codesync-dark" // Ensure this matches the defined name
        language="javascript"
        value={activeFile?.content || ""}
        onChange={(value) => onChange(value)}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', monospace",
          minimap: { enabled: false },
          padding: { top: 20 },
          automaticLayout: true,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "all",
          backgroundColor: "#0B0E14"
        }}
      />
    </div>
  );
}