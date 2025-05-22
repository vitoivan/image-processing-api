import pinohttp from 'pino-http'
import { Logger } from '../../common/utils/logger'

const loggerMiddleware = pinohttp({ logger: new Logger("HTTP").logger, autoLogging: true })


export {
	loggerMiddleware
}
