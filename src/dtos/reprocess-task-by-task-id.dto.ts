import { z } from "zod";

const ReprocessTaskByTaskIdDTO = z.object({
	task_id: z.string(),
})


export { ReprocessTaskByTaskIdDTO }
