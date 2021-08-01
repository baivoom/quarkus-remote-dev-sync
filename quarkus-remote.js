import { SourceMonitor } from './source-monitor'

const { SlowBuffer } = require('buffer');
const fs = require('fs');
const path = require('path');

const from = ""
const folder = './build/quarkus-app-classes'
const targets = [
    './build/classes/java/main',
    './build/classes/kotlin/main',
]


const sources = new SourceMonitor('./src/main')



function SetOnReady() {
    console.log("trying to watch" + folder)
    if (!fs.existsSync(folder)) {
        console.log("watching folder does not exist.  " + folder)
        setTimeout(SetOnReady, 2000);
        return
    }
    try {
        const watcher = fs.watch('./build/quarkus-app-classes', { recursive: true }, (eventtype, filename) => {
            if (eventtype == 'change') {
                const source = `${folder}/${filename}`
                if (fs.statSync(source).isFile()) {
                    console.log(`changes detected on ${filename}, copying to classes...`)
                    targets.forEach(x => {
                        const target = `${x}/${filename}`
                        const targetdir = path.dirname(target)
                        fs.mkdirSync(targetdir, {recursive: true})
                        fs.copyFileSync(source, target)
                        console.log(`copied from ${source} to ${target}`)
                    })
                }
            }
        });
        console.log(`we are watching the source ${folder}`)
        watcher.on('error', (e) => {
            console.log('watching error detected. ' + e)
        })
        watcher.on('close', () => {
            console.log('watching closed and will be restated in 2 seconds')
            setTimeout(SetOnReady, 2000)
        })
    } catch (e) {
        console.log(`unable to watch folder due to ${e}, will be restarted in 2 seconds`)
        setTimeout(SetOnReady, 2000)
    } 
}

process.setUncaughtExceptionCaptureCallback((e) => {
    console.log(e)
    SetOnReady()
})


//SetOnReady()













