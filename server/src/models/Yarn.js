import mongoose from "mongoose";

const YarnSchema = new mongoose.Schema(
	{
		name: { type: String, index: true },
		code: { type: String, index: true },
		description: String,
		brand: { type: String, index: true },
		images: [String],
		color_cards: { type: Array, default: [] },
		link: String,
		company: {
			type: Object,
			default: {}
		},
		category: {
			type: Object,
			default: {}
		}
	},
	{
		timestamps: true,
		strict: false
	}
);

// Helpful indexes for common filters
YarnSchema.index({ "company.name": 1 });
YarnSchema.index({ "category.category_name": 1, "category.category_id": 1 });
YarnSchema.index({ name: "text", description: "text", brand: "text", code: "text" }, { default_language: "none" });

export const Yarn = mongoose.model("zgfzyx_yarn", YarnSchema, "data");


