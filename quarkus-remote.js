import { Logger } from './logger';
import { FileMonitor } from './monitor';

const path = require('path')
const fs = require('fs')

const folder = './build/quarkus-app-classes'
const delfrom = './build/quarkus-app/dev/app'


const kotlin = './build/classes/kotlin/main'
const java = './build/classes/java/main'



export class QuarkusMonitor extends FileMonitor {

    logger = new Logger('QuarkusMonitor')


    constructor(sources) {
        super('./build/quarkus-app-classes', { root: false })
        this.sources = sources
    }

    onFileChange(eventtype, filename) {
        if (eventtype == 'change') {
            const source = `${folder}/${filename}`
            this.logger.info(`changes detected on ${filename}, copying to classes...`)
            let root = null
            if (this.sources.isKotlin(filename)) {
                root = kotlin
            } else if (this.sources.isJava(filename)) {
                root = java
            }
            if (root) {
                
                const target = `${root}/${filename}`
                const targetdir = path.dirname(target)
                fs.mkdirSync(targetdir, {recursive: true})
                fs.copyFileSync(source, target)
                this.logger.info(`copied from ${source} to ${target}`)

                // try {
                //     fs.rm(`${delfrom}/${filename}`, { force: true })
                // } catch(e) {
                //     this.logger.error(`unable to delete the cache dev file. ${delfrom}/${filename}. ${e}`)
                // }
                this.logger.info(`trying to delete cached file at ${delfrom}/${filename}`)
            } else {
                this.logger.info(`skipped no recorded source at ${source}`)
            }
        }
    }
}











