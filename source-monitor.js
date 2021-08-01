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

    scan() {

        const kotlin = `${this.location}/kotlin`
        const kts = fg.sync([`${kotlin}/**/*.kt`], { dot: false})
        kts.forEach(x => {
            const k = x.replace(`${kotlin}/`, '').replace(/[\\]/g, '/').replace(/\.kt/, '.class')
            this.files[k] = true
        })

        const java = `${this.location}/java`
        const jss = fg.sync([`${java}/**/*.java`], { dot: false})
        jss.forEach(x => {
            const k = x.replace(`${java}/`, '').replace(/[\\]/g, '/').replace(/\.java/, '.class')
            this.files[k] = false
        })

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