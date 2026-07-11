import React, { useEffect, useState, useImperativeHandle, useRef, forwardRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const termBg = "#060605ff";
const line = "rgba(244,241,234,0.10)";

const TerminalPanel = forwardRef((props, ref) => {
  const { socket, roomId } = props;
  const terminalDivRef = useRef(null);
  const termRef = useRef(null);

  const [termInitialized, setTermInitialized] = useState(false);

  const inputBufferRef = useRef("");
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isCommandRunning = useRef(false);
  const currentCwdRelative = useRef("");

  // Helper to print prompt
  const printPrompt = () => {
    const term = termRef.current;
    if (!term) return;
    const pathText = currentCwdRelative.current ? `~/${currentCwdRelative.current}` : "~/project";
    term.write(`\r\n\x1b[1;32mcodesync\x1b[0m:\x1b[1;34m${pathText}\x1b[0m$ `);
  };

  // Keyboard data handler
  const handleTermData = (data) => {
    const term = termRef.current;
    if (!term) return;

    if (isCommandRunning.current) {
      // If a command is running, only allow Ctrl+C (\x03) to interrupt
      if (data === "\x03") {
        socket?.emit("terminal:kill", { roomId });
        term.write("^C\r\n");
      }
      return;
    }

    for (let i = 0; i < data.length; i++) {
      const char = data[i];

      if (char === "\r" || char === "\n") {
        const cmd = inputBufferRef.current.trim();
        term.write("\r\n");
        if (cmd) {
          historyRef.current.push(cmd);
          historyIndexRef.current = historyRef.current.length;
          isCommandRunning.current = true;
          socket?.emit("terminal:command", { command: cmd, roomId });
        } else {
          printPrompt();
        }
        inputBufferRef.current = "";
      } else if (char === "\x7f" || char === "\b") {
        // Backspace
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          term.write("\b \b");
        }
      } else if (char === "\x03") {
        // Ctrl+C
        inputBufferRef.current = "";
        term.write("^C");
        printPrompt();
      } else if (char === "\u001b") {
        // Escape sequence (Arrow keys)
        const rest = data.slice(i);
        if (rest.startsWith("\u001b[A")) {
          // Up Arrow
          if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            const cmd = historyRef.current[historyIndexRef.current];
            const currentLength = inputBufferRef.current.length;
            for (let j = 0; j < currentLength; j++) {
              term.write("\b \b");
            }
            inputBufferRef.current = cmd;
            term.write(cmd);
          }
          break;
        } else if (rest.startsWith("\u001b[B")) {
          // Down Arrow
          if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            const cmd = historyRef.current[historyIndexRef.current];
            const currentLength = inputBufferRef.current.length;
            for (let j = 0; j < currentLength; j++) {
              term.write("\b \b");
            }
            inputBufferRef.current = cmd;
            term.write(cmd);
          } else if (historyIndexRef.current === historyRef.current.length - 1) {
            historyIndexRef.current = historyRef.current.length;
            const currentLength = inputBufferRef.current.length;
            for (let j = 0; j < currentLength; j++) {
              term.write("\b \b");
            }
            inputBufferRef.current = "";
          }
          break;
        }
        break;
      } else {
        // Normal printable characters
        const code = char.charCodeAt(0);
        if (code >= 32 && code <= 126) {
          inputBufferRef.current += char;
          term.write(char);
        }
      }
    }
  };

  // Terminal lifecycle
  useEffect(() => {
    let term = null;
    let fitAddon = null;
    let resizeObserver = null;

    const runFit = () => {
      if (term && fitAddon && terminalDivRef.current) {
        const width = terminalDivRef.current.clientWidth;
        const height = terminalDivRef.current.clientHeight;
        if (width > 0 && height > 0) {
          try {
            fitAddon.fit();
          } catch (err) {
            console.warn("xterm fit addon failed:", err);
          }
        }
      }
    };

    const initTerminal = () => {
      if (!terminalDivRef.current || termRef.current) return;

      const width = terminalDivRef.current.clientWidth;
      const height = terminalDivRef.current.clientHeight;
      if (width === 0 || height === 0) return;

      term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        theme: {
          background: termBg,
          foreground: "#F4F1EA",
          cursor: "#E4895F",
          cursorAccent: termBg,
          selectionBackground: "#E4895F40",
          black: "#1E1B16",
          brightBlack: "#57544C",
          red: "#D9705A",
          brightRed: "#E4895F",
          green: "#7FB39E",
          brightGreen: "#9CC9B7",
          yellow: "#D9A05B",
          brightYellow: "#E8B678",
          blue: "#7C9CBF",
          brightBlue: "#9BB6D6",
          magenta: "#B08AC9",
          brightMagenta: "#C6A6DB",
          cyan: "#7FB39E",
          brightCyan: "#9CC9B7",
          white: "#F4F1EA",
          brightWhite: "#FFFFFF",
        },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalDivRef.current);

      try {
        fitAddon.fit();
      } catch (err) {
        console.warn("xterm initial fit failed:", err);
      }

      term.writeln("Welcome to CodeSync terminal");
      
      // Listen for typing data
      term.onData(handleTermData);

      termRef.current = term;
      setTermInitialized(true);
    };

    if (terminalDivRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (!termRef.current) {
          initTerminal();
        } else {
          runFit();
        }
      });
      resizeObserver.observe(terminalDivRef.current);
    }

    const timer = setTimeout(initTerminal, 100);

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (term) {
        term.dispose();
        termRef.current = null;
        setTermInitialized(false);
      }
    };
  }, []);

  // Socket communication
  useEffect(() => {
    if (!socket || !termInitialized || !termRef.current) return;

    const handleOutput = ({ output }) => {
      termRef.current?.write(output);
    };

    const handleReady = ({ relativePath }) => {
      currentCwdRelative.current = relativePath;
      isCommandRunning.current = false;
      printPrompt();
    };

    socket.on("terminal:output", handleOutput);
    socket.on("terminal:ready", handleReady);

    // Fetch initial path & render prompt
    socket.emit("terminal:init", { roomId });

    return () => {
      socket.off("terminal:output", handleOutput);
      socket.off("terminal:ready", handleReady);
    };
  }, [socket, roomId, termInitialized]);

  useImperativeHandle(ref, () => ({
    write: (text) => {
      termRef.current?.writeln(text);
    },
    clear: () => {
      termRef.current?.clear();
    },
  }));

  return (
    <div className="h-48" style={{ background: termBg, borderTop: `1px solid ${line}` }}>
      <div ref={terminalDivRef} className="h-full w-full" />
    </div>
  );
});

export default TerminalPanel;