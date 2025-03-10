import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        id: {type: Number, required: true},
        fullName: {type: String, required: true},
        image: {type: String, required: true},
        title: {type: String, required: true},
        tagline: {type: String, required: true},
        introduction:{type: String, required:true},
        keySkills: [{type: String}],
        status: {
            type: String,
            enum: [
              "Seeking New Career Opportunities",
              "Open to Work",
              "Freelancing",
              "Employed",
              "Available for Collaboration",
              "Working on Personal Projects",
              "Interning",
              "Exploring New Technologies",
              "Unavailable",
              "Remote Only",
              "Contract-Based Work Only",
            ],
            default: "Open to Work",
          },
          cv: {type: String, required: true},
          yearsOfExperience: {type: Number, default: 1},
          
    }
)
export default models.User || model('User', UserSchema);