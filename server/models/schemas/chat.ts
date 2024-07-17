import mongoose, { Schema, Document, Model } from 'mongoose';

interface IChat extends Document {
    users: mongoose.Schema.Types.ObjectId[];
    messages: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
}

const ChatSchema: Schema<IChat> = new Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    createdAt: { type: Date, default: Date.now },
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;
