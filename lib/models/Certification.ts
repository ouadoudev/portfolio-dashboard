import { Schema, model, models } from "mongoose"

const certificationSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: Date, required: true },
    certificateUrl: { type: String, required: true },

  },

)

export default models.Certification || model("Certification", certificationSchema)

