import { Logger } from './logger'


const fs = require('fs')
const fg = require('fast-glob')

export class SourceMonitor {

    
    constructor(location) {
        this.location = location
        this.logger = new Logger('SourceMonitor')
        this.scan()
    }

    scan() {
        const sources = fg.sync([`${this.location}/**/*.kt`, `${this.location}/**/*.java`])
        sources.forEach(x => {
            this.logger.info(x)
        })
    }

    monitor() {

        this.logger.info("trying to watch " + this.location)

        if (!fs.existsSync(folder)) {
            console.log("watching folder does not exist.  " + folder)
            setTimeout(SetOnReady, 2000);
            return
        }

    }

    isKotlin(location) {

    }

    isJava(location) {

    }

}