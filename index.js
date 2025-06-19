
import { pipeline } from 'node:stream/promises'
import { liner, batcher, apiWriter } from './transformers.js'
import { listAllKeys, getKeys } from "./api.js"

// restore a kv namespace
export async function restore (opts) {
  const rs = opts.rs || process.stdin
  const ws = opts.ws || process.stdout
  // pour data from stdin
  // - break it into individual lines
  // - batch in to arrays of 100 objects
  // - write each batch to the KV bulk write API
  // - status messages to stdout
  await pipeline(
    rs,
    liner(),
    batcher(),
    apiWriter(opts),
    ws)
}

// backup a kv namespace
export async function backup (opts) {
  // get a list of up to 1000 keys in this namespace
  const keys = await listAllKeys(opts)
  const numKeys = keys.length
  let count = 0
  const ws = opts.ws || process.stdout

  // get batches of 100 keys
  do {
    // get the first batch of keys
    const keyBatch = keys.splice(0, Math.min(100, keys.length)).map((k) => { return k.name })

    // fetch the keys listed in keyBatch
    const res = await getKeys(keyBatch, opts)
    ws.write(res)

    // status
    count += keyBatch.length
    process.stderr.write(`  KV  ${count}/${numKeys}      \r`)

  } while(keys.length > 0)

  // flush the stream
  ws.end()

  // all done
  console.error('Backed up', numKeys, 'KV values')
}
