// Example of the user's project structure handled by your IDE
const initialTree = {
  id: 'root',
  name: 'my-project',
  isFolder: true,
  children: [
    {
      id: 'frontend',
      name: 'frontend',
      isFolder: true,
      children: [{ id: 'app-js', name: 'App.js', content: 'console.log("hello");' }]
    },
    {
      id: 'backend',
      name: 'backend',
      isFolder: true,
      children: [{ id: 'server-js', name: 'server.js', content: 'const express = require("express");' }]
    }
  ]
};