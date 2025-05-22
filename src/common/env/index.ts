import { z } from "zod";
import { NodeEnv } from "../enums/nodeEnv";

const envSchema = z.object({
	NODE_ENV: z.nativeEnum(NodeEnv).default(NodeEnv.DEVELOPMENT),
	MONGO_URI: z.string().url("Invalid Mongo URI"),
	PORT: z.coerce.number().default(3000),
	RABBITMQ_URI: z.string().url("Invalid RabbitMQ URI"),
	RABBITMQ_QUEUE: z.string().default("images.process"),
	RABBITMQ_EXCHANGE: z.string().default("images.process"),
	STORAGE_TYPE: z.enum(["local", "bunny"]).default("local"),

	BUNNY_STORAGE_NAME: z.string().optional(),
	BUNNY_STORAGE_API_KEY: z.string().optional(),
	BUNNY_STORAGE_HOSTNAME: z.string().optional(),
});

const envs = envSchema.parse(process.env);

export { envs }
