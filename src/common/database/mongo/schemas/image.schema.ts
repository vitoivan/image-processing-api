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
		required: [true, "field original_metadata.width is required"],
	},
	height: {
		type: Number,
		required: [true, "field original_metadata.height is required"],
	},
	mimetype: {
		type: String,
		required: [true, "field original_metadata.mimetype is required"],
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
