import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
  content: String,
  language: String,
}, { timestamps: true });

const Code = mongoose.model('Code', codeSchema);

export default Code;

