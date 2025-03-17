import { Schema, model, models } from "mongoose"

const workExperienceSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: String,
    company: String,
    companyLogo: String,
    location: String,
    period: String,
    description: String,
    responsibilities:  [String],
    technologies: [String]
  },
)

export default models.WorkExperience || model("WorkExperience", workExperienceSchema)

