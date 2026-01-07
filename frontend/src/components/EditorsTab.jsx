import { X } from "lucide-react";

export default function EditorTabs({
  files,
  activeFile,
  setActiveFile,
  closeTab
}) {
  return (
    <div className="flex border-b bg-gray-900 text-white">
      {files.map(file => (
        <div
          key={file.id}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
            activeFile?.id === file.id
              ? "bg-gray-800 font-medium"
              : "text-gray-400"
          }`}
          onClick={() => setActiveFile(file)}
        >
          {file.name}
          <X
            size={14}
            onClick={e => {
              e.stopPropagation();
              closeTab(file.id);
            }}
          />
        </div>
      ))}
    </div>
  );
}
