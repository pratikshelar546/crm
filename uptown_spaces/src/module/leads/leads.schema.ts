import mongoose from "mongoose";
const { Schema, Types } = mongoose;


const leadsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    propertyType: {
        type: String,
        required: true,
    },
    leadSource: {
        type: String,
        required: true,
    },
    addedBy: {
        type: Types.ObjectId,
        required: true,
        ref: "users",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["NEW", "CONTACTED", "SITE_VISITED", "CLOSED"],
        default: "NEW",
    },
    comments: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
})

export const Leads = mongoose.model("Leads", leadsSchema);