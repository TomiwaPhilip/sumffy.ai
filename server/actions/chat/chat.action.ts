"use server";

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import axios from "axios";
import fs from 'fs';
import path from 'path';

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


export async function uploadFileToGemini(filePath: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/files:upload?key=${apiKey}`;

  try {
    const fileContent = fs.readFileSync(process.cwd() + filePath, 'utf-8');
    const fileName = path.basename(filePath);

    const response = await axios.post(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        file: {
          name: fileName,
          content: fileContent,
        },
      },
    });

    if (response.data && response.data.fileUrl) {
      return response.data.fileUrl;
    } else {
      throw new Error('File URL not found in the response');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
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

        const response = await axios.get("https://api.ipify.org?format=json");
        console.log("Your IP address is:", response.data.ip);

        let result;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain",
            };

            if (!userMessage) {
                throw new Error("There is no message from user");
            }

            const personalityUrl = uploadFileToGemini("/public/utils/sumffy.txt");

            console.log("Personality Url is:", personalityUrl);

            const prompt = `Answer user prompt based on your personality.
            Here is the link to your personality document: \`${personalityUrl}\`
            User Prompt: \`${userMessage}\``;

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
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

export type Message = {
    text?: string;
    type: "text" | "audio";
    audioUrl?: string;
    userType: 'ai' | 'user';
};

export async function fetchChatMessages(chatId: string): Promise<Message[]> {
    try {
        await connectToDB();

        const chat = await Chat.findById(chatId).populate({
            path: "messages",
            model: Message,
        });

        if (!chat) {
            throw new Error("Chat not found");
        }

        // Map the messages to the required format
        const messages: Message[] = chat.messages.map((msg: any) => ({
            text: msg.text,
            type: msg.type,
            audioUrl: msg.audioUrl,
            userType: msg.userType,
        }));

        return messages;
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        throw new Error("Failed to fetch chat messages");
    }
}