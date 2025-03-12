import { Schema, model, models } from "mongoose"

const testimonialSchema = new Schema(
  {
    id: { 
      type: Number, 
      required: true, 
      unique: true, 
    },
    quote: String,
    authorName: String,
    authorPosition: String,
    authorImage: String,
  },
  { timestamps: true },
)

export default models.Testimonial || model("Testimonial", testimonialSchema)

