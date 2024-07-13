import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  firstName: {
    type: String,
    // required: [true, 'Firstname is required!'],
  },
  lastName: {
    type: String,
    // required: [true, 'Lastname is required!'],
  },
  skills: {
    type: String,
  },
  interests: {
    type: String,
  },
  jobTitle: {
    type: String,
  },
  relationshipStatus: {
    type: String,
  },
  shortTermGoal: {
    type: String,
  },
  longTermGoal: {
    type: String,
  },
  shortBio: {
    type: String,
  },
  preferences: {
    type: String,
  },
  image: {
    type: String,
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  premium: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  loginType: {
    type: String,
    enum: ["email", "google"],
  },
});

const User = models.User || model("User", UserSchema);

export default User;