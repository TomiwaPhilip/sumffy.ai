"use client";

import BioDataForm from "../forms/bio-data/Bio-Data";

export default function BioData() {
    return (
        <div className="">
            <h1 className="text-gradient text-[36px] font-extrabold">Let&apos;s get to know you!</h1>
            <p className="text-[16px] text-[#A1A3B0]">The below information would help Sumffy personalize suggestions and ideas to make 
                it truly useful for you. The more information you share, the better Sumffy gets. 
                We protect your data and do not share your personal data with anyone. <span className="underline">Learn more</span>. 
            </p>
            <div className="mt-10">
                <BioDataForm />
            </div>
        </div>
    )
}