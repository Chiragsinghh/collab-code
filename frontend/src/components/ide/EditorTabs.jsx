export default function EditorTabs({ openFiles, activeFile, setActiveFile }) {
  return (
    <div className="h-9 flex border-b border-white/10 bg-[#0F131B]">
      {openFiles.map((file) => (
        <button
          key={file.id}
          onClick={() => setActiveFile(file)}
          className={`px-4 text-sm border-r border-white/10 ${
            activeFile?.id === file.id
              ? "bg-[#1A1F2A] text-white"
              : "text-gray-400"
          }`}
        >
          {file.name}
        </button>
      ))}
    </div>
  );
}
