import { z } from "zod";

const InsertImageMetadataDTO = z.object({
	task_id: z.string(),
	original_filename: z.string(),
	original_metadata: z.object({
		width: z.number().optional(),
		height: z.number().optional(),
		mimetype: z.string(),
		exif: z.record(z.any()).optional(),
	}).optional(),
	error_message: z.string().optional(),
	processed_at: z.date().optional(),
})


export { InsertImageMetadataDTO }
