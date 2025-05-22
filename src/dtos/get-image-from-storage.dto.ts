import { z } from "zod";

const GetImageFromStorageDTO = z.object({
	file_id: z.string(),
})


export { GetImageFromStorageDTO }
