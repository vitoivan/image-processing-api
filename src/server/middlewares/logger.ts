import pinohttp from 'pino-http'

const loggerMiddleware = pinohttp({
	autoLogging: true,
	transport: {
		target: 'pino-pretty',
	},
})


export {
	loggerMiddleware
}
