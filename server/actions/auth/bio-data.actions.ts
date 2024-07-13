"use server";

import { FormData } from "@/components/forms/bio-data/Bio-Data";
import connectToDB from "@/server/models/database/database";
import User from "@/server/models/schemas/user";
import getSession from "@/server/session/session.action";

export async function saveBioData(params:FormData) {
    
    await connectToDB();

    const session = await getSession();

    const userId = session.userId;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            ...params,
        });
        await user.save();
        
    } catch (error) {
        console.error(error)
    }
}