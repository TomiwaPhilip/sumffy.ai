import mongoose, { Schema, Document, Model } from 'mongoose';

interface IMessage extends Document {
    text?: string;
    type: 'text' | 'audio';
    audioUrl?: string;
    userType: 'ai' | 'user';
    user: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
    text: { type: String },
    type: { type: String, enum: ['text', 'audio'], required: true },
    audioUrl: { type: String },
    userType: { type: String, enum: ['ai', 'user'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
