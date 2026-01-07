import MonacoEditor from "@monaco-editor/react";

export default function Editor({ activeFile, onChange }) {
  if (!activeFile) {
    return <div className="p-4 text-gray-400">No file open</div>;
  }

  const ext = activeFile.name.split(".").pop();
  let language = "javascript";
  if (ext === "ts") language = "typescript";
  if (ext === "json") language = "json";
  if (ext === "html") language = "html";
  if (ext === "css") language = "css";

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme="vs-dark"
      value={activeFile.content}
      onChange={value => onChange(value)}
      options={{
        fontFamily: "Fira Code, monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on"
      }}
    />
  );
}
