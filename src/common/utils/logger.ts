import pino from 'pino'

class Logger {

	private name = "MainLogger"
	private pinoLogger: pino.Logger

	constructor(name?: string) {
		if (name) {
			this.name = name
		}

		this.pinoLogger = pino({
			level: 'info',
			name: this.name,
			transport: {
				target: 'pino-pretty',
				options: {
					translateTime: 'SYS:standard',
					colorize: true,
					ignore: 'pid,hostname',
				},
			},
		})
	}

	get logger() {
		return this.pinoLogger
	}

	log(message: string) {
		return this.pinoLogger.info(message, { label: this.name })
	}


	debug(message: string) {
		return this.pinoLogger.debug(message, { label: this.name })
	}


	trace(message: string) {
		return this.pinoLogger.trace(message, { label: this.name })
	}


	error(message: string) {
		return this.pinoLogger.error(message, { label: this.name })
	}


	warn(message: string) {
		return this.pinoLogger.warn(message, { label: this.name })
	}
}


const defaultLogger = new Logger()

export { Logger, defaultLogger }
