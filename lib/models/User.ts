import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  id: { type: Number, required: true },
  fullName: String,
  image: String,
  title: String,
  tagline: String,
  introduction: String,
  keySkills: [{ type: String }],
  status: {
    type: String,
    enum: [
      "Open to Work",
      "Freelancing",
      "Employed",
      "Available for Collaboration",
      "Working on Personal Projects",
      "Interning",
      "Exploring New Technologies",
      "Unavailable",
      "Remote Only",
      "Contract-Based Work Only",
    ],
  },
  cv: String,
  yearsOfExperience: { type: Number, default: 0 },
});

export default models.User || model("User", userSchema);
