import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In a real app, we will hash this
  avatar: { type: String, default: '' },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], // Projects owned/joined
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);