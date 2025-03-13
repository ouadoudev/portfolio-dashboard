import { Schema, model, models } from "mongoose"

const contactSchema = new Schema(
  {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    socialLinks:{
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
      github : { type: String },
    }
   
  },
)

export default models.Contact || model("Contact", contactSchema)

