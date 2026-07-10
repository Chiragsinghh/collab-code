export const reactTemplate = [
    {
      id: "root",
      name: "src",
      type: "folder",
      children: [
        {
          id: "app",
          name: "App.jsx",
          type: "file",
          content: `
  export default function App() {
    return (
      <div style={{ padding: 20 }}>
        <h1>🚀 Welcome to CodeSync Replit Clone</h1>
        <p>Edit files and click Run Project!</p>
      </div>
    );
  }
          `,
        },
        {
          id: "main",
          name: "main.jsx",
          type: "file",
          content: `
  import React from "react";
  import ReactDOM from "react-dom/client";
  import App from "./App";
  
  ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
  );
          `,
        },
      ],
    },
  
    {
      id: "html",
      name: "index.html",
      type: "file",
      content: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CodeSync Project</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
      `,
    },
  
    {
      id: "pkg",
      name: "package.json",
      type: "file",
      content: `
  {
    "name": "codesync-project",
    "version": "1.0.0",
    "scripts": {
      "dev": "vite --host",
      "build": "vite build"
    },
    "dependencies": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0"
    },
    "devDependencies": {
      "vite": "^5.0.0"
    }
  }
      `,
    },
  ];
  