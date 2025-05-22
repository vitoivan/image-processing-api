import { z } from "zod";

const GetImageMetadataByTaskIdDTO = z.object({
	task_id: z.string(),
})


export { GetImageMetadataByTaskIdDTO }
