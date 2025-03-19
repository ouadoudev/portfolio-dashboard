import { Schema, model, models } from "mongoose";

const technologySchema = new Schema({
  id: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      "Frontend",
      "Backend",
      "Mobile Development",
      "AI & Machine Learning",
      "Data Science",
      "DevOps",
      "Database",
      'IoT',
      "UI/UX Design",
      "Scientific Computing",
      "Programming Languages",
      
    ],
  },
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true, unique: true },
});

export default models.Technology || model("Technology", technologySchema);
