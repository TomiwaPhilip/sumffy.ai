"use client";

import { useEffect, useState } from "react";
import BioDataForm from "../forms/bio-data/Bio-Data";
import { fetchBioData } from "@/server/actions/auth/bio-data.actions";
import { FormData } from "../forms/bio-data/Bio-Data";
import { Loaders } from "../shared/reusables";

export default function BioData() {
    const [bioData, setBioData] = useState<FormData | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await fetchBioData();
                console.log(data);
                // Ensure the returned data is of FormData type before setting state
                if (data) {
                    setBioData(data);
                } else {
                    console.error("Invalid data format received.");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        }
        fetchData();
    }, []);

    // Helper function to check if object matches FormData structure
    const isFormData = (data: any): data is FormData => {
        return (
            typeof data === 'object' &&
            typeof data.firstName === 'string' &&
            typeof data.lastName === 'string' &&
            typeof data.skills === 'string' &&
            typeof data.interests === 'string' &&
            (typeof data.jobTitle === 'string' || data.jobTitle === "") &&
            (typeof data.relationshipStatus === 'string' || data.relationshipStatus === "") &&
            (typeof data.shortTermGoal === 'string' || data.shortTermGoal === "") &&
            (typeof data.longTermGoal === 'string' || data.longTermGoal === "") &&
            (typeof data.shortBio === 'string' || data.shortBio === "") &&
            (typeof data.preferences === 'string' || data.preferences === "")
        );
    };

    return (
        <div className="">
            <h1 className="text-gradient text-[36px] font-extrabold">Let&apos;s get to know you!</h1>
            <p className="text-[16px] text-[#A1A3B0]">The below information would help Sumffy personalize suggestions and ideas to make
                it truly useful for you. The more information you share, the better Sumffy gets.
                We protect your data and do not share your personal data with anyone. <span className="underline">Learn more</span>.
            </p>
            <div className="mt-10">
                {bioData === null ? (
                    <Loaders />
                ) : (
                    <BioDataForm defaultValues={bioData} />
                )}
            </div>
        </div>
    );
}
