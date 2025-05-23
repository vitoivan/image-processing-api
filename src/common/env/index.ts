import { z } from "zod";
import { NodeEnv } from "../enums/nodeEnv";

const envSchema = z.object({
	NODE_ENV: z.nativeEnum(NodeEnv).default(NodeEnv.DEVELOPMENT),
	MONGO_URI: z.string().url("Invalid Mongo URI"),
	PORT: z.coerce.number().default(3000),
	RABBITMQ_URI: z.string().url("Invalid RabbitMQ URI"),
	RABBITMQ_QUEUE: z.string().default("images.process"),
	RABBITMQ_EXCHANGE: z.string().default("images.process"),
	RABBITMQ_RETRIES_TRESHOLD: z.number().default(5),
	STORAGE_TYPE: z.enum(["local", "bunny"]).default("bunny"),
	BUNNY_STORAGE_NAME: z.string().optional().default("victor-cdn-storage"),
	BUNNY_STORAGE_API_KEY: z.string().optional().default("2f3d5a4b-2f38-48f2-8db3fc18c168-4c49-4ee3"),
	BUNNY_STORAGE_HOSTNAME: z.string().optional().default("br.storage.bunnycdn.com"),
});

const envs = envSchema.parse(process.env);

export { envs }
