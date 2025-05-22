import { z } from "zod";

const versionObject = z.object({
	path: z.string(),
	width: z.number(),
	height: z.number(),
	size: z.number(),
})

const UpdateImageMetadataVersionDTO = z.object({
	task_id: z.string(),
	versions: z.object({
		low: versionObject.optional().nullable(),
		medium: versionObject.optional().nullable(),
		high_optimized: versionObject.optional().nullable(),
	})
})

type TUpdateImageMetadataVersionDTO = z.infer<typeof UpdateImageMetadataVersionDTO>

export { UpdateImageMetadataVersionDTO, TUpdateImageMetadataVersionDTO }
