import { Schema as MongooseSchema } from "mongoose"

const version = new MongooseSchema({
	path: String,
	width: Number,
	height: Number,
	size: Number
})

const versionsSchema = new MongooseSchema({
	low: version,
	medium: version,
	high_optimized: version,
})

const originalMetadataSchema = new MongooseSchema({
	width: {
		type: Number,
		required: false,
	},
	height: {
		type: Number,
		required: false,
	},
	mimetype: {
		type: String,
		required: false,
	},
	exif: {
		type: Map,
		of: String,
		required: false,
	}
})

const imageSchema = new MongooseSchema({
	task_id: {
		type: String,
		required: [true, "field task_id is required"],
	},
	original_filename: {
		type: String,
		required: [true, "field original_filename is required"],
	},
	status: {
		type: "string",
		required: [true, "field status is required"],
	},
	original_metadata: originalMetadataSchema,
	processed_at: Date,
	error_message: String,
	versions: versionsSchema
}, { timestamps: true, bufferCommands: false });



export { imageSchema }
