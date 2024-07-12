import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  firstname: {
    type: String,
    // required: [true, 'Firstname is required!'],
  },
  lastname: {
    type: String,
    // required: [true, 'Lastname is required!'],
  },
  phoneNumber: {
    type: String,
  },
  image: {
    type: String,
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  loginType: {
    type: String,
    enum: ["email", "google"],
  },
});

const User = models.User || model("User", UserSchema);

export default User;