export class Logger {
    
    constructor(klass) {
        this.prefix = klass
    }

    warn(message) {
        this.log('WARN', `${this.prefix} => ${message}`)
    }

    error(message) {
        this.log('ERROR', `${this.prefix} => ${message}`)
    }

    info(message) {
        this.log('INFO', `${this.prefix} => ${message}`)
    }

    log(type, message) {
        console.log(`[${type}] ${message}`)
    }

}