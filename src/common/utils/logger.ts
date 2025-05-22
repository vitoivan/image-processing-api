


enum LogLevel {
	Trace = "trace",
	Debug = "debug",
	Info = "info",
	Warn = "warn",
	Error = "error",
}

const mapLevelToANSIColor = {
	[LogLevel.Trace]: "\x1b[90m",
	[LogLevel.Debug]: "\x1b[36m",
	[LogLevel.Info]: "\x1b[32m",
	[LogLevel.Warn]: "\x1b[33m",
	[LogLevel.Error]: "\x1b[31m",
}

const mapLevelToName = {
	[LogLevel.Trace]: "TRACE",
	[LogLevel.Debug]: "DEBUG",
	[LogLevel.Info]: "INFO",
	[LogLevel.Warn]: "WARN",
	[LogLevel.Error]: "ERROR",
}

const clearColor = "\x1b[0m"

class Logger {


	private name = "MainLogger"

	constructor(name?: string) {
		if (name) {
			this.name = name
		}
	}

	private insertName(message: string): string {
		const name = this.insertColor(`[${this.name}]`, LogLevel.Warn)
		return `${name} ${message}`
	}

	private insertColor(message: string, level: LogLevel = LogLevel.Info): string {
		const color = mapLevelToANSIColor[level]
		return `${color}${message}${clearColor}`
	}

	private insertLevel(message: string, level: LogLevel = LogLevel.Info): string {
		const levelName = mapLevelToName[level]
		return `${levelName}: ${message}`
	}

	private buildMessage(message: string, level: LogLevel = LogLevel.Info, args: any[] = []): string {

		const withLevel = this.insertLevel(message, level)
		const withColor = this.insertColor(withLevel, level)
		const withName = this.insertName(withColor)

		return withName
	}


	log(message: string) {
		console.log(this.buildMessage(message, LogLevel.Info))
	}


	debug(message: string) {
		console.debug(this.buildMessage(message, LogLevel.Debug))
	}


	trace(message: string) {
		console.trace(this.buildMessage(message, LogLevel.Trace))
	}


	error(message: string) {
		console.error(this.buildMessage(message, LogLevel.Error))
	}


	warn(message: string) {
		console.warn(this.buildMessage(message, LogLevel.Warn))
	}
}


const defaultLogger = new Logger()

export { Logger, defaultLogger }
