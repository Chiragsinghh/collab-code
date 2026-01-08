import Project from '../models/Project.js';

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    
    // Join Room and Fetch Initial Data
    socket.on('join-room', async ({ roomId, username, userId }) => {
      if (!roomId) return;
      socket.join(roomId);

      try {
        let project = await Project.findOne({ roomId });
        
        if (!project) {
          project = await Project.create({ 
            name: "New Project", 
            roomId: roomId, 
            owner: userId || null, // Set owner if user is logged in
            members: userId ? [userId] : [],
            tree: [] 
          });
        }

        // If user is logged in and not already a member, add them
        if (userId && !project.members.includes(userId)) {
          project.members.push(userId);
          await project.save();
          
          // Also add project to User's profile
          await User.findByIdAndUpdate(userId, { 
            $addToSet: { projects: project._id } 
          });
        }
        
        socket.emit('init-state', { tree: project.tree, projectName: project.name });
        socket.to(roomId).emit('user-joined', { username });
      } catch (err) {
        console.error("❌ Join Room Error:", err);
      }
    });

    // Handle Structural Changes (New File/Delete/Move)
    socket.on('update-tree', async ({ roomId, newTree }) => {
      socket.to(roomId).emit('tree-synced', newTree);
      try {
        await Project.findOneAndUpdate({ roomId }, { tree: newTree });
      } catch (err) {
        console.error("Tree Save Error:", err);
      }
    });

    // Handle Content Changes (Typing)
    socket.on('code-change', async ({ roomId, fileId, newContent }) => {
      // 1. Instant broadcast to other users
      socket.to(roomId).emit('code-synced', { fileId, newContent });

      try {
        // 2. Fetch the current project to update the nested structure
        const project = await Project.findOne({ roomId });
        if (!project) return;

        // Recursive helper to find the file and update content
        const updateNestedContent = (nodes) => nodes.map(node => {
          if (node.id === fileId) return { ...node, content: newContent };
          if (node.children) return { ...node, children: updateNestedContent(node.children) };
          return node;
        });

        const updatedTree = updateNestedContent(project.tree);
        
        // 3. Save the updated tree back to MongoDB Atlas
        await Project.updateOne({ roomId }, { $set: { tree: updatedTree } });
      } catch (err) {
        console.error("Code Save Error:", err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};