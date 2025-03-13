import { Schema, model, models } from "mongoose"

const technologySchema = new Schema(
  {
    id: { type: Number, required: true },
   category: { type: String, required: true },
   name: { type: String, required: true },
   icon: { type: String, required: true },
  },
)

export default models.Technology|| model("Technology", technologySchema)

