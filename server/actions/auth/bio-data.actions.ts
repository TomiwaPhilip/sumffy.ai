"use server";

import { FormData } from "@/components/forms/bio-data/Bio-Data";
import connectToDB from "@/server/models/database/database";
import User from "@/server/models/schemas/user";
import getSession from "@/server/session/session.action";

export async function saveBioData(params: FormData) {
    try {
        await connectToDB();

        const session = await getSession();

        if (!session || !session.userId) {
            return { error: "User is not authenticated." };
        }

        const userId = session.userId;

        const user = await User.findById(userId);
        if (!user) {
            return { error: "User not found." };
        }

        Object.assign(user, {
            ...params,
            updatedAt: Date.now(),
        });

        await user.save();

        session.isOnboarded = true;
        session.firstName = params.firstName;
        session.lastName = params.lastName;

        await session.save();
        
        console.log(session)

        return { success: "Changes saved successfully" };
    } catch (error) {
        console.error("Error saving bio data:", error);
        return { error: "Error saving changes. Retry." };
    }
}

export async function fetchBioData() {
    await connectToDB();
  
    const session = await getSession();
  
    if (!session || !session.userId) {
      throw new Error ("User is not authenticated.");
    }
  
    const userId = session.userId;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error ("User not found");
      }

      console.log(user);
  
      // Extract only the fields that match the FormData type
      const userData: FormData = {
        firstName: user.firstName,
        lastName: user.lastName,
        skills: user.skills,
        interests: user.interests,
        jobTitle: user.jobTitle,
        relationshipStatus: user.relationshipStatus,
        shortTermGoal: user.shortTermGoal,
        longTermGoal: user.longTermGoal,
        shortBio: user.shortBio,
        preferences: user.preferences,
      };
  
      return userData;
    } catch (error) {
      console.error("Error fetching bio data:", error);
      throw new Error("Error fetching user data");
    }
  }