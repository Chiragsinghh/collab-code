export const fullStackTemplate = [
    {
      id: "backend",
      name: "backend",
      type: "folder",
      children: [
        {
          id: "server",
          name: "server.js",
          type: "file",
          content: `
  import express from "express";
  
  const app = express();
  
  app.get("/", (req, res) => {
    res.send("🚀 Backend Running in CodeSync!");
  });
  
  app.listen(5000, () => {
    console.log("Backend running on port 5000");
  });
          `,
        },
      ],
    },
  ];
  