import { Logger } from './logger'

const fs = require('fs')
const path = require('path')

export class FileMonitor {

    watchingLocation = ''
    monitoring = false
    logger = new Logger('FileMonitor')
    options = {
        interval: 2000,
        file: true,
        directory: false,
        recursive: true,
        root: true,
        temp: false,
    }

    constructor(location, options) {
        if (options) {
            this.options = { ...this.options, ...options }
        }
        this.watchingLocation = location
    }

    onFileChange(eventtype, filename) {
        this.logger.info(`detected file changed with no handle. ${eventtype}, ${filename}`)
    }

    watch() {
        if (this.monitoring) return
        if (!fs.existsSync(this.watchingLocation)) {
            this.logger.warn(`watching folder does not exist, ${this.watchingLocation}, recheck in ${this.options.interval} ms` )
            setTimeout(() => { this.watch() }, this.options.interval);
            return
        }
        try {
            const watcher = fs.watch(this.watchingLocation, { recursive: this.options.recursive }, (eventtype, filename) => {
                
                try {
                    let trigger = false
                    const basename = path.basename(filename)
                    if (!this.options.temp && (basename.startsWith('~') || basename.endsWith('~'))) {
                        this.logger.info(`skip temporary file ${filename}`)
                        return
                    }
                    const stat = fs.statSync(`${this.watchingLocation}/${filename}`)
                    if (this.options.file && stat.isFile()) {
                        trigger = true
                    } else if (this.options.directory && stat.isDirectory()) {
                        trigger = true
                    }
                    if (trigger) {
                        try {
                            if (this.options.root) {
                                filename = `${this.watchingLocation}/${filename}`
                            }
                            this.onFileChange(eventtype, filename)
                        } catch(e) {
                            this.logger.error(`unhandled exception while calling onFileChange. ${e}`)
                        }
                    }
                } catch (e) {
                    this.logger.error(`unable to stat the changed file at ${filename}. ${e}`)
                }

               
                // if (eventtype == 'change') {
                //     const source = `${folder}/${filename}`
                //     if (fs.statSync(source).isFile()) {
                //         console.log(`changes detected on ${filename}, copying to classes...`)
                //         targets.forEach(x => {
                //             const target = `${x}/${filename}`
                //             const targetdir = path.dirname(target)
                //             fs.mkdirSync(targetdir, {recursive: true})
                //             fs.copyFileSync(source, target)
                //             console.log(`copied from ${source} to ${target}`)
                //         })
                //     }
                // }
            });
            this.logger.info(`we are watching the source ${this.watchingLocation}`)
            watcher.on('error', (e) => {
                this.logger.error(`watching error detected. ${e}`)
            })
            watcher.on('close', () => {
                this.monitoring = false
                this.logger.warn(`watching closed and will be restated in ${this.options.interval} ms`)
                setTimeout(() => { this.watch() }, this.options.interval)
            })
            this.monitoring = true
        } catch (e) {
            this.monitoring = false
            console.log(`unable to watch folder due to ${e}, will be restarted in ${this.options.interval} ms`)
            setTimeout(() => { this.watch() }, this.options.interval)
        } 
    }

}