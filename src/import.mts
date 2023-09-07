//@ts-ignore - added in node 20.6
// this is the argument for --import, which does the initial main-thread
// work, and then registers the loader without globalPreload
import { register } from 'node:module'
import { MessageChannel } from 'node:worker_threads'
import { getProcessInfo } from './get-process-info.js'
import { saveLineLengths } from './line-lengths.js'
import { getImportMetaURL } from './get-import-meta-url.js'

const { port1, port2 } = new MessageChannel()

// must be called eagerly here.
// this does all the registration as well.
const processInfo = getProcessInfo()
port1.on('message', ({ filename, content }) => {
  processInfo.files.push(filename)
  saveLineLengths(filename, content)
})

port1.unref()
port2.unref()

register(getImportMetaURL(`./loader.mjs`), {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
})
