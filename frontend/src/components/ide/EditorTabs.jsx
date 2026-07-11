
const surface = "#0e0d0bff";
const surfaceRaised = "#26221C";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#15110eff";

export default function EditorTabs({ openFiles, activeFile, setActiveFile }) {
  return (
    <div className="h-9 flex" style={{ borderBottom: `1px solid ${line}`, background: surface, fontFamily: "'JetBrains Mono', monospace" }}>
      {openFiles.map((file) => {
        const isActive = activeFile?.id === file.id;
        return (
          <button
            key={file.id}
            onClick={() => setActiveFile(file)}
            className="px-4 text-[13px] relative transition-colors"
            style={{
              borderRight: `1px solid ${line}`,
              background: isActive ? surfaceRaised : "transparent",
              color: isActive ? text : textMuted,
            }}
          >
            {file.name}
            {isActive && (
              <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ background: clay }} />
            )}
          </button>
        );
      })}
    </div>
  );
}