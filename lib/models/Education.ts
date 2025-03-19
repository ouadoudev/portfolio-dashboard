import { Schema, model, models } from "mongoose"
const educationSchema = new Schema(
    {
      id: { type: Number, required: true },
      degree: String,
      institution: String,
      location: String,
      period: String,
      description: String,
      courses: [String],
      options: String,
    },
    { timestamps: true },
  )
  
  export default models.Education || model("Education", educationSchema)
  
  