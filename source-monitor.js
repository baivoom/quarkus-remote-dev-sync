import { Logger } from './logger'
import { FileMonitor } from './monitor'


const fs = require('fs')
const fg = require('fast-glob')

export class SourceMonitor extends FileMonitor {

    
    files = Object.create(null)
    monitoring = false


    constructor(location) {
        super(location)
        this.location = location
        this.logger = new Logger('SourceMonitor')
        this.scan()
        this.watch()
    }

    internalScan(dir) {
        const files = fg.sync([`${dir}/**/*.kt`, `${dir}/**/*.java`], { dot: false})
        for (const file of files) {
            const iskotlin = file.endsWith('.kt')
            const name = file.replace(dir, '').replace(/[\\]/g, '/').replace(/\.kt$/, '.class').replace(/\.java$/, '.class').replace(/^\/*/, '')
            this.files[name] = iskotlin
        }
    }

    scan() {
        this.internalScan(`${this.location}/kotlin`)
        this.internalScan(`${this.location}/java`)
        
        for(const file in this.files) {
            this.logger.info(`source: ${file}, kotlin: ${this.files[file]}`)
        }
    }

    onFileChange(eventtype, filename) {
        filename = filename.replace(/[\\]/g, '/')
        filename = filename.replace(this.location, '')
        filename = filename.replace(/^\/*/, '')
        let added = ''
        const index = filename.indexOf("/")
        filename = filename.substr(index + 1)
        if (filename.endsWith('.kt')) {
            added = filename.replace(/\.kt$/, '.class')
            this.files[added] = true
        } else if (filename.endsWith('.java')) {
            added = filename.replace(/\.java$/, '.class')
            this.files[added] = false
        }
        this.logger.info(`add new record '${added}', kotlin: ${this.files[added]}`)
    }

  
    isKotlin(location) {
        location = location.replace(/[\\]/g, '/')
        if (location in this.files) {
            return this.files[location]
        }
        this.logger.info(`no record detect for ${location}`)
        return false
    }

    isJava(location) {
        location = location.replace(/[\\]/g, '/')
        if (location in this.files) {
            return !this.files[location]
        }
        this.logger.info(`no record detect for ${location}`)
        return false
    }

}