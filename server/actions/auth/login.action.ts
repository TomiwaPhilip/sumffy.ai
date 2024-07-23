"use server";

import VerificationToken from "@/server/models/schemas/emailToken";
import {
  generateToken,
  sendVerificationRequest,
  verifyToken,
  saveSession,
} from "@/server/actions/auth/utils";
import connectToDB from "@/server/models/database/database";
import User from "@/server/models/schemas/user";
import getSession from "@/server/session/session.action";
import { getGoogleAuthUrl } from "@/server/actions/auth/google-auth.action";
import { redirect } from "next/navigation";

export async function signIn(email: string) {
  console.log("I want to send emails");
  try {
    connectToDB();

    // Generate token and URL for verification
    const { token, generatedAt, expiresIn } = generateToken();

    console.log(token)

    const url = `https://sumffy-ai.vercel.app/auth/verify?token=${token}`;

    // Send email with resend.dev
    await sendVerificationRequest({ url: url, email: email });

    console.log("Email sent!");

    // Save email address, verification token, and expiration time in the database
    const save = await VerificationToken.create({
      token: token,
      email: email,
      createdAt: generatedAt, // Since generated in the function, set current time
      expiresAt: expiresIn,
    });

    if (save) {
      console.log("saved token to DB");
    }

    // Return a response
    return true;
  } catch (error) {
    return false;
  }
}

export async function verifyUserTokenAndLogin(token: string) {
  try {
    connectToDB();

    const existingToken = await VerificationToken.findOne({ token: token });

    if (!existingToken) {
      console.log("Token not found in DB");
      return { error: "Invalid Credentials!" }; // Token not found in the database
    }

    // Check if the token has expired
    const currentTime = new Date();
    const createdAt = existingToken.createdAt;
    const expiresIn = existingToken.expiresAt;
    const timeDifference = currentTime.getTime() - createdAt.getTime(); // Time difference in milliseconds
    const minutesDifference = Math.floor(timeDifference / (1000 * 60)); // Convert milliseconds to minutes
    if (minutesDifference > 5) {
      console.log("Token has expired");
      // If the token has expired, delete the token document from the database
      await VerificationToken.findOneAndDelete({ token: token });
      return { error: "Invalid token" };; // Token has expired
    }

    const email = existingToken.email;

    try {
      // Check if the user already exists in the Role collection with the correct login type
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {

        // Create session data
        let sessionData = {
          userId: existingUser._id.toString(),
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          image: existingUser.image, // Initialize image as an empty string
          isPremium: existingUser.premium,
          isOnboarded: existingUser.onboarded,
          isLoggedIn: true,
        };

        // Save session
        await saveSession(sessionData);

        // If the token is valid, delete the token document from the database
        await VerificationToken.findOneAndDelete({ token: token });

        // Redirect to the dashboard or appropriate page
        return { newUser: false };
      } else {
        // User does not exist, create a new organization and role with the received email
        console.log("I got to create new user")
        // Create a new User for the user with the received email
        const newUser = await User.create({
          email: email,
          loginType: "email", // or the appropriate login type
        });


        if(!newUser) {
          return {error: "Error creating an account for user"}
        }

        // Create session data
        const sessionData = {
          userId: newUser._id.toString(),
          email: newUser.email,
          isPremium: newUser.premium,
          isOnboarded: newUser.onboarded,
          isLoggedIn: true,
        };

        // Save session
        await saveSession(sessionData);

        // If the token is valid, delete the token document from the database
        await VerificationToken.findOneAndDelete({ token: token });

        // Redirect to the dashboard or appropriate page
        return { newUser: true };
      }
    } catch (error: any) {
      console.error("Error logging user in", error.message);
      return { error: "Error logging in. Try again later!" };
    }
  } catch (error: any) {
    console.error("Error verifying token:", error.message);
    return { error: "Error verifying token. Try again later!" };
  }
}


export const signOut = async () => {
  console.log("Okay, you caught me!")
  const session = await getSession();
  session.destroy();
  redirect("/auth/signin");
};

let googleAuthUrl: string;
export async function handleGoogleLogin() {
  try {
    // Get the Google OAuth URL
    googleAuthUrl = await getGoogleAuthUrl();
  } catch (error) {
    console.error("Error:", error);
    // Handle error
  } finally {
    // Redirect the user to the Google OAuth URL
    redirect(googleAuthUrl);
  }
}
