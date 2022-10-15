import pino from "pino";

const logger = pino({
    transport: {
      pipeline: [{
        // Use target: 'pino/file' to write to stdout
        // without any change.
        target: 'pino-pretty'
      }]
    }
  })

export default logger;