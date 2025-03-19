import { Schema, model, models } from "mongoose"

const certificationSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
    details: { type: String },
    date: { type: Date, required: true },
    certificateUrl: { type: String, required: true },

  },

)

export default models.Certification || model("Certification", certificationSchema)

