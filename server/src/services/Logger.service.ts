import pino from 'pino';

export interface ILogger {
    info(message: string, meta?: object): void;
    warn(message: string, meta?: object): void;
    error(message: string, meta?: object): void;
}

export class PinoLogger implements ILogger {
    public logger: pino.Logger;

    constructor() {
        this.logger = pino({ level: 'info' });
    }

    info(message: string, meta?: object) {
        this.logger.info(meta, message);
    }

    warn(message: string, meta?: object) {
        this.logger.warn(meta, message);
    }

    error(message: string, meta?: object) {
        this.logger.error(meta, message);
    }
}