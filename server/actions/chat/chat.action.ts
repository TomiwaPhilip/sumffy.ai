"use server";

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import axios from "axios";
import fs from 'fs';
import path from 'path';
import ngeohash from 'ngeohash';
import { ipAddress, geolocation } from '@vercel/functions';
import type { NextRequest } from 'next/server';

import connectToDB from '@/server/models/database/database';
import Chat from '@/server/models/schemas/chat';
import Message from '@/server/models/schemas/message';
import getSession from '@/server/session/session.action';
import { personalityDoc } from "./utils/constants";
import User from "@/server/models/schemas/user";

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
        const fileContent = fs.readFileSync(filePath, 'utf-8');
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

export async function getUserLocation(mapboxAccessToken: string) {
    try {
        // Get user IP address from the API route
        const ipResponse = await axios.get("https://sumffy-ai.vercel.app/api/ip-address");
        const userIp = ipResponse.data.ip;
        console.log("userIp:", userIp);

        // Use the IP address to get geolocation data
        const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${userIp}`);
        const { latitude, longitude } = response.data;
        console.log("location:", latitude, longitude )

        // Reverse geocode to get place name
        const reverseGeocodeResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxAccessToken}`);
        const placeName = reverseGeocodeResponse.data.features[0].place_name;

        return {
            latitude,
            longitude,
            placeName,
        };
    } catch (error: any) {
        console.error("Error getting user location:", error);
        throw new Error("Error getting user location: " + error.message);
    }
}


export async function getPlacesOfInterest(location: { longitude: number, latitude: number }, interests: string[], mapboxAccessToken: string) {
    try {
        const interestsQuery = interests.join(',');
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${interestsQuery}.json?proximity=${location.longitude},${location.latitude}&access_token=${mapboxAccessToken}`);
        if (response.data && response.data.features && response.data.features.length > 0) {
            const places = response.data.features.map((place: any) => ({
                name: place.text,
                address: place.place_name,
                coordinates: place.center,
            }));
            return {
                location,
                places
            };
        } else {
            throw new Error("No places of interest found!");
        }
    } catch (error: any) {
        console.error("Error in getPlacesOfInterest:", error);
        throw new Error("Error in getPlacesOfInterest: " + error.message);
    }
}

interface Location {
    placeName: string;
    latitude: number;
    longitude: number;
}

export async function fetchEvents(location: Location) {
    try {
        const geoHash = ngeohash.encode(location.latitude, location.longitude);

        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                geoPoint: geoHash,
                radius: '10',
                unit: 'km',
                sort: 'date,asc',
                size: '5', // Limit to top 5 events
                apikey: process.env.TICKETMASTER_API_KEY
            }
        });

        const events = response.data._embedded?.events.map((event: any) => ({
            name: event.name,
            description: event.info || 'No description available',
            start: event.dates.start.localDate,
            url: event.url,
        })) || [];

        return events;
    } catch (error: any) {
        console.error("Error fetching events:", error);
        throw new Error("Error fetching events: " + error.message);
    }
}


export async function findPOIsForUser() {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            throw new Error("User is unauthorized!");
        }

        const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!mapboxAccessToken) {
            throw new Error("Mapbox Access Token is not provided!");
        }

        const location = await getUserLocation(mapboxAccessToken);
        console.log("User location:", location);

        // Inline code to fetch user bio data and interests
        const user = await User.findById(session.userId);
        if (!user) {
            throw new Error("User not found!");
        }

        const interests = user.interests ? user.interests.split(',') : [];
        if (interests.length === 0) {
            throw new Error("User has no specified interests!");
        }

        const placesOfInterest = await getPlacesOfInterest(location, interests, mapboxAccessToken);
        console.log("Places of interest:", placesOfInterest);

        const events = await fetchEvents(location);
        console.log("Events around user location:", events);

        const result = {
            location: location.placeName,
            placesOfInterest: placesOfInterest.places.map((place: any) => ({
                name: place.name,
                address: place.address,
                coordinates: `Latitude: ${place.coordinates[1]}, Longitude: ${place.coordinates[0]}`,
            })),
            events: events.map((event: any) => ({
                name: event.name,
                description: event.description,
                start: event.start,
                url: event.url,
            }))
        };

        console.log("Results:", result);

        // Formatting result for Gemini API
        let formattedResult = `User Location: ${location.placeName}\n\nPlaces of Interest:\n`;

        formattedResult += placesOfInterest.places
            .map((place: any, index: number) => {
                return `${index + 1}. ${place.name}\n   Address: ${place.address}\n   Coordinates: Latitude: ${place.coordinates[1]}, Longitude: ${place.coordinates[0]}`;
            })
            .join('\n\n');

        formattedResult += `\n\nEvents Around User Location:\n`;

        formattedResult += events
            .map((event: any, index: number) => {
                return `${index + 1}. ${event.name}\n   Description: ${event.description}\n   Start: ${event.start}\n   URL: ${event.url}`;
            })
            .join('\n\n');
        
        console.log("Formatted result for gemini", formattedResult)

        return formattedResult;
    } catch (error: any) {
        console.error("Error in findPOIsForUser:", error);
        throw new Error("Error in findPOIsForUser: " + error.message);
    }
}

export async function fetchUserBio() {
    try {
        await connectToDB();

        const session = await getSession();

        if (!session || !session.userId) {
            throw new Error("Unathorixed access!")
        }

        const userId = session.userId;

        const user: any = await User.findById(userId).select('-email').lean();

        if (!user) {
            throw new Error('User not found!');
        }

        // Compile the user bio information into a multiline string
        const bioInfo = `
Below are the information about the user chatting with you right now:\n

Firstname: ${user.firstName || 'Not provided'}\n
Lastname: ${user.lastName || 'Not provided'}\n
Skills: ${user.skills || 'Not provided'}\n
Interests: ${user.interests || 'Not provided'}\n
Job Title: ${user.jobTitle || 'Not provided'}\n
Relationship Status: ${user.relationshipStatus || 'Not provided'}\n
Short Term Goal: ${user.shortTermGoal || 'Not provided'}\n
Long Term Goal: ${user.longTermGoal || 'Not provided'}\n
Short Bio: ${user.shortBio || 'Not provided'}\n
Preferences: ${user.preferences || 'Not provided'}\n
`;

        return bioInfo.trim(); // Trim to remove any extra whitespace
    } catch (error) {
        console.error('Error fetching user bio:', error);
        throw new Error('Error fetching user bio');
    }
}


export async function getChatHistory(chatId: string, personalityDoc: string, userMessage: string, userBioData: string) {
    const chat = await Chat.findById(chatId).populate('messages');
    let history = [];

    if (chat && chat.messages.length > 0) {
        history.push({
            role: "user",
            parts: [{ text: `Answer user prompt based on your personality. Always make reference to the User Bio Data while responding in personalized manner that suits their goals and lifestyle. \nHere is your personality document: \`${personalityDoc}\`\n Here is the bio-data of the user: \`${userBioData}\`\nUser Prompt: \`${chat.messages[0].text}\`` }]
        });

        chat.messages.forEach((msg: any) => {
            history.push({
                role: msg.userType === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        });
    } else {
        history.push({
            role: "user",
            parts: [{ text: `Answer user prompt based on your personality. Always make reference to the User Bio Data while responding in personalized manner that suits their goals and lifestyle. \nHere is your personality document: \`${personalityDoc}\`\n Here is the bio-data of the user: \`${userBioData}\`\nUser Prompt: \`${userMessage}\`` }]
        });
    }

    history.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    return history;
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
                model: "gemini-1.0-pro",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                maxOutputTokens: 2048,
                responseMimeType: "text/plain",
            };

            if (!userMessage) {
                throw new Error("There is no message from user");
            }
            const userBioData = await fetchUserBio();
            const userMetaData = await findPOIsForUser();
            const chatHistory = await getChatHistory(chatId, personalityDoc, userMessage, userBioData);

            const chatSession = model.startChat({
                generationConfig,
                history: chatHistory,
            });

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