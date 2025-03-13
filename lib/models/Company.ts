import { Schema, model, models } from "mongoose"

const companySchema = new Schema(
  {
    id: { type: Number, required: true },
    name: String,
    img: String,
  },
  { timestamps: true },
)

export default models.Company || model("Company", companySchema)

