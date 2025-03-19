import { Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    id: { 
      type: Number, 
      required: true, 
      unique: true, // Ensures the 'id' is unique
    },
    title: { 
      type: String, 
      required: true, // Make title required
    },
    description: { 
      type: String, 
      required: true, // Make description required
    },
    domain: { 
      type: String, 
      required: true, // Assuming domain is required
    },
    thumbnail: { 
      type: String, 
      required: false, // Optional field for the thumbnail image
    },
    images: [{ 
      type: String, 
      required: false, // Optional list of image URLs
    }],
    iconLists: [{ 
      type: String, 
      required: false, // Optional list of icon URLs
    }],
    liveUrl: { 
      type: String, 
      required: false, // Optional live URL
    },
    githubUrl: { 
      type: String, 
      required: false, 
    },
  },
  { timestamps: true } 
);

export default models.Project || model("Project", projectSchema);
