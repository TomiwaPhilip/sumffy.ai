"use server";

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

import connectToDB from '@/server/models/database/database';
import Chat from '@/server/models/schemas/chat';
import Message from '@/server/models/schemas/message';
import getSession from '@/server/session/session.action';
// import { Message } from "@/components/forms/chat/ChatForm";

export async function createChat() {

    await connectToDB();

    const session = await getSession();

    if (!session || !session.userId) {
        throw new Error("User is unauthorized!")
    }

    const userId = session.userId;

    const newChat: any = new Chat({
        users: [userId],
    });

    await newChat.save();

    return { chatId: newChat._id.toString() }

}

export async function findChatById(chatId: string) {

    await connectToDB();

    const session = await getSession();

    if (!session || !session.userId) {
        throw new Error("User is unauthorized!")
    }
    const chat = await Chat.findById(chatId)

    if (chat) {
        return true;
    } else {
        return false;
    }
}

interface SaveMessageParams {
    chatId: string;
    text?: string;
    type: 'text' | 'audio';
    audioUrl?: string;
    userType: 'ai' | 'user';
}

export async function saveMessage(params: SaveMessageParams) {
    try {
        await connectToDB();

        const session = await getSession();

        if (!session || !session.userId) {
            throw new Error("User is unauthorized!")
        }

        const userId = session.userId;

        const { chatId, text, type, audioUrl, userType } = params;

        const message: any = await Message.create({
            text,
            type,
            audioUrl,
            userType,
            user: userId,
        });

        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.messages.push(message._id);
            await chat.save();
        }

        if (type === 'audio' && audioUrl) {
            return {
                type: type,
                userType: userType,
                audioUrl: audioUrl,
            }
        } else if (type === 'text' && text) {
            return {
                type: type,
                userType: userType,
                text: text,
            }
        }

    } catch (error: any) {
        throw new Error(`Failed to save message: ${error.message}`);
    }
}

interface SumffyMessageProps {
    userMessage?: string;
    chatId: string;
    type: 'text' | 'audio';
    audioUrl?: string;
    userType: 'ai' | 'user'; 
}

export async function sendMessageToSumffy(params: SumffyMessageProps) {
    try {
        await connectToDB();
        const session = await getSession();

        if (!session || !session.userId) {
            throw new Error("User is unauthorized!");
        }

        const userId = session.userId;
        const { chatId, userMessage } = params;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("You do not have API to Gemini");
        }

        let result;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.0-pro",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain",
            };

            if(!userMessage) {
                throw new Error("There is no message from user");
            }

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [{ text: userMessage }],
                    },
                ],
            });

            if (!userMessage) {
                throw new Error("User message is not provided");
            }

            result = await chatSession.sendMessage(userMessage);
            console.log("Gemini API response:", result.response.text());
        } catch (error: any) {
            throw new Error("Error querying Gemini: " + error.message);
        }

        if (!result || !result.response) {
            throw new Error("Model failed to give a response");
        }

        const sumffyReply = result.response.text();

        const message: any = await Message.create({
            text: sumffyReply,
            type: params.type,
            userType: params.userType,
            user: userId,
        });

        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error(`Chat not found with ID: ${chatId}`);
        }

        chat.messages.push(message._id);
        await chat.save();

        return {
            text: sumffyReply,
            type: params.type,
            userType: params.userType,
        };
    } catch (error: any) {
        console.error("Error in sendMessageToSumffy:", error);
        throw new Error("Error in sendMessageToSumffy: " + error.message);
    }
}
