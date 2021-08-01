import { QuarkusMonitor } from './quarkus-remote'
import { SourceMonitor } from './source-monitor'

const sources = new SourceMonitor('./src/main')


const quarkus = new QuarkusMonitor(sources)

quarkus.watch()



