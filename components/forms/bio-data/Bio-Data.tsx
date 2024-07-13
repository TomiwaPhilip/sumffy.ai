"use client";

import { NoOutlineButtonBig } from '@/components/shared/buttons';
import { StatusMessage } from '@/components/shared/reusables';
import { saveBioData } from '@/server/actions/auth/bio-data.actions';
import React, { useState, ChangeEvent, FormEvent } from 'react';

export type FormData = {
    firstName: string;
    lastName: string;
    skills: string;
    interests: string;
    jobTitle?: string;
    relationshipStatus?: string;
    shortTermGoal?: string;
    longTermGoal?: string;
    shortBio?: string;
    preferences?: string;
};

type Errors = Partial<FormData>;

export interface Props {
    defaultValues?: FormData;
}

export default function BioDataForm({defaultValues}: Props) {
    const [formData, setFormData] = useState<FormData>({
        firstName: defaultValues?.firstName || '',
        lastName: defaultValues?.lastName || '',
        skills: defaultValues?.skills || '',
        interests: defaultValues?.interests || '',
        jobTitle: defaultValues?.jobTitle || '',
        relationshipStatus: defaultValues?.relationshipStatus || '',
        shortTermGoal: defaultValues?.shortTermGoal || '',
        longTermGoal: defaultValues?.longTermGoal || '',
        shortBio: defaultValues?.shortBio || '',
        preferences: defaultValues?.preferences || '',
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDataSaved, setIsDataSaved] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = (): Errors => {
        const newErrors: Errors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.skills) newErrors.skills = 'Skills are required';
        if (!formData.interests) newErrors.interests = 'Interests are required';
        // if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
        // if (!formData.relationshipStatus) newErrors.relationshipStatus = 'Relationship status is required';
        // if (!formData.shortTermGoal) newErrors.shortTermGoal = 'Short-term goal is required';
        // if (!formData.longTermGoal) newErrors.longTermGoal = 'Long-term goal is required';
        // if (!formData.shortBio) newErrors.shortBio = 'Short bio is required';
        // if (!formData.preferences) newErrors.preferences = 'Preferences are required';
        return newErrors;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setLoading(true);
            const response = await saveBioData(formData);
            if (response.success) {
                setIsDataSaved(true);
                setMessage(response.success);
                setIsError(false);
                setLoading(false);
                window.location.href = "/";
            } else if(response.error) {
                setIsError(true);
                setMessage(response.error);
                setIsDataSaved(false);
                setLoading(false);
            }
        } else {
            setIsError(true);
            setMessage("Incomplete form fields!");
            setIsDataSaved(false);
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="mt-5">
                <div className="grid grid-cols-2 gap-7">
                    <div>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        />
                        {errors.firstName && <span className="text-red-500">{errors.firstName}</span>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        />
                        {errors.lastName && <span className="text-red-500">{errors.lastName}</span>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="skills"
                            placeholder="HTML, CSS, JS"
                            value={formData.skills}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        />
                        {errors.skills && <span className="text-red-500">{errors.skills}</span>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="interests"
                            placeholder="Photography, Cycling and Coding"
                            value={formData.interests}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        />
                        {errors.interests && <span className="text-red-500">{errors.interests}</span>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="jobTitle"
                            placeholder="Job Title"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        />
                        {errors.jobTitle && <span className="text-red-500">{errors.jobTitle}</span>}
                    </div>
                    <div>
                        <select
                            name="relationshipStatus"
                            value={formData.relationshipStatus}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        >
                            <option value="" disabled>
                                Relationship Status
                            </option>
                            <option value="single">Single</option>
                            <option value="in a relationship">In a Relationship</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                        </select>
                        {errors.relationshipStatus && (
                            <span className="text-red-500">{errors.relationshipStatus}</span>
                        )}
                    </div>
                    <div>
                        <textarea
                            name="shortTermGoal"
                            placeholder="Short-Term Goal"
                            value={formData.shortTermGoal}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        ></textarea>
                        {errors.shortTermGoal && (
                            <span className="text-red-500">{errors.shortTermGoal}</span>
                        )}
                    </div>
                    <div>
                        <textarea
                            name="longTermGoal"
                            placeholder="Long-Term Goal"
                            value={formData.longTermGoal}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        ></textarea>
                        {errors.longTermGoal && (
                            <span className="text-red-500">{errors.longTermGoal}</span>
                        )}
                    </div>
                    <div>
                        <textarea
                            name="shortBio"
                            placeholder="Short Bio"
                            value={formData.shortBio}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        ></textarea>
                        {errors.shortBio && <span className="text-red-500">{errors.shortBio}</span>}
                    </div>
                    <div>
                        <textarea
                            name="preferences"
                            placeholder="Preferences"
                            value={formData.preferences}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#10111C] border-2 border-[#7A7D93] rounded-lg focus:outline-none focus:ring-[#E0E0E0] focus:border-[#E0E0E0] sm:text-sm placeholder-[#464D67]"
                        ></textarea>
                        {errors.preferences && (
                            <span className="text-red-500">{errors.preferences}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-center mt-[3rem]">
                    <NoOutlineButtonBig
                        name='Save and Continue'
                        type='submit'
                        loading={loading}
                        disabled={loading}
                    />
                </div>
            </form>
            {isDataSaved === true && (
                <StatusMessage type="success" message={message} />
            )}
            {isError === true && (
                <StatusMessage type="error" message={message} />
            )}
        </>
    );
}
