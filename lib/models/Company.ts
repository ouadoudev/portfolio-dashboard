import { Schema, model, models } from "mongoose"

const companySchema = new Schema(
  {
    id: { type: Number, required: true },
    name: String,
    Logo: String,
  },
  { timestamps: true },
)

export default models.Company || model("Company", companySchema)

