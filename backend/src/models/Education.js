import mongoose from "mongoose";


const EducationSchema = new mongoose.Schema(
{
userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },


institution: { type: String, required: true, trim: true },
degreeType: { type: String, required: true, trim: true }, // e.g., B.S., M.S., J.D., etc.
fieldOfStudy: { type: String, required: true, trim: true },


level: {
type: String,
enum: [
"High School",
"Associate",
"Bachelor's",
"Master's",
"PhD",
"Professional",
"Certificate",
"Diploma"
],
required: true,
},


startDate: { type: String, default: "" }, // ISO YYYY-MM (or YYYY-MM-DD) as string
graduationDate: { type: String, default: "" },
currentlyEnrolled: { type: Boolean, default: false },


gpa: { type: Number, min: 0, max: 5, default: null }, // allow 4.0+ scales
gpaPrivate: { type: Boolean, default: false },


honors: { type: String, default: "" }, // achievements/honors text
},
{ timestamps: true }
);


export default mongoose.model("Education", EducationSchema);