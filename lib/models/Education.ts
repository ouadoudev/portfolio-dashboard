import { Schema, model, models } from "mongoose"
const educationSchema = new Schema(
    {
      id: { type: Number, required: true },
      degree: { type: String, required: true, unique: true, },
      institution: { type: String, required: true },
      location: { type: String, required: true },
      period: { type: String, required: true },
      description: { type: String },
      courses: [{ type: String }],
      options: { type: String },
    },
    { timestamps: true },
  )
  
  export default models.Education || model("Education", educationSchema)
  
  