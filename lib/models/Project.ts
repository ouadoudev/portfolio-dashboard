import { Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
    iconLists: [
      {
        type: String,
        required: false,
      },
    ],
    liveUrl: {
      type: String,
      required: false,
    },
    githubUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default models.Project || model("Project", projectSchema);
