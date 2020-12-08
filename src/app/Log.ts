import * as log4js from 'log4js';
import * as path from 'path';
import Config from './providers/config/Config';
import { inject, Container, injectable } from 'inversify';
import { TYPES } from './types';
import { container } from './inversify.config';

@injectable()
export class Log4jsLogger implements Logger {
    /**
     * @var logger The base logger object
     */
    private logger: any;

    /**
     * @var logFilePath Absolute path to the log file
     */
    private logFilePath: string;

    /**
     * Initialize the logger
     */
    constructor(@inject(TYPES.Config) private config: Config) {
        this.logFilePath = this.config.get('logFilePath');
        console.log('Logs @', this.logFilePath);
        log4js.addLayout('json', (config) => {
            return (logEvent) => { 
              return JSON.stringify({service: this.config.get('appName'), ...logEvent}) 
                      + config.separator; 
            }
        });
          
        log4js.configure({
            appenders: { 
                file: { 
                    type: 'file', 
                    layout: { type: 'json', separator: ',' },
                    filename: this.logFilePath
                }
            },
            categories: { default: { appenders: ['file'], level: 'debug' } }
        });
          
        this.logger = log4js.getLogger(); 
        // console.log("Log file at", this.logFilePath)
    }

    info(str: string, data?: any) {
        this.logger.info(str, data || '');
    }

    debug(str: string, data?: any) {
        this.config.get("nodeENV") === "development" && this.logger.debug(str, data || '')
    }

    error(str: string, data?: any) {
        // console.error('error', str)
        this.logger.error(str, data || '')
    }
}

@injectable()
export class STDOutLogger implements Logger {
    
    constructor(@inject(TYPES.Config) private config: Config) {
        console.log("ENV is", this.config.get("nodeENV"))
    }

    info(str: string, data?: any) {
        console.log('[INFO]\t', str, JSON.stringify(data) || '');
    }

    debug(str: string, data?: any) {
        this.config.get("nodeENV") === "development" && console.log('[DEBUG]\t', str, JSON.stringify(data) || '');
    }

    error(str: string, data?: any) {
        console.error('[ERROR]\t', str, JSON.stringify(data) || '');
    }
}

export interface Logger {
    info(str: string, data?: any)
    debug(str: string, data?: any)
    error(str: string, data?: any)
}

// export default container.get(TYPES.Logger);