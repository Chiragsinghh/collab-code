import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

/* ✅ forwardRef REQUIRED */
const TerminalPanel = forwardRef((props, ref) => {
  const terminalDivRef = useRef(null);
  const termRef = useRef(null);

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
      if (width === 0 || height === 0) return; // Wait for layout

      term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        theme: {
          background: "#0B0E14",
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

      term.writeln("Welcome to CodeSync Terminal 🚀");
      termRef.current = term;
    };

    // Use ResizeObserver to detect when dimensions become available and handle resizes
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

    // Fallback trigger
    const timer = setTimeout(initTerminal, 100);

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (term) {
        term.dispose();
        termRef.current = null;
      }
    };
  }, []);

  /* ✅ Expose write() to parent */
  useImperativeHandle(ref, () => ({
    write: (text) => {
      termRef.current?.writeln(text);
    },
    clear: () => {
      termRef.current?.clear();
    },
  }));

  return (
    <div className="h-48 bg-black border-t border-white/10">
      <div ref={terminalDivRef} className="h-full w-full" />
    </div>
  );
});

export default TerminalPanel;
