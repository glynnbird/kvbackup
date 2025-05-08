
import { pipeline } from 'node:stream/promises'
import { liner, batcher, apiWriter } from './transformers.mjs'
import { listAllKeys, getKeys } from "./api.mjs"

// restore a kv namespace
export async function restore (opts) {
  // pour data from stdin
  // - break it into individual lines
  // - batch in to arrays of 100 objects
  // - write each batch to the KV bulk write API
  // - status messages to stdout
  await pipeline(
    process.stdin,
    liner(),
    batcher(),
    apiWriter(opts),
    process.stdout)
}

// backup a kv namespace
export async function backup (opts) {
  // get a list of up to 1000 keys in this namespace
  const keys = await listAllKeys(opts)
  const numKeys = keys.length
  let count = 0

  // get batches of 100 keys
  do {
    // get the first batch of keys
    const keyBatch = keys.splice(0, Math.min(100, keys.length)).map((k) => { return k.name })

    // fetch the keys listed in keyBatch
    const res = await getKeys(keyBatch, opts)
    console.log(res)

    // status
    count += keyBatch.length
    process.stderr.write(`  KV  ${count}/${numKeys}      \r`)

  } while(keys.length > 0)

  // all done
  console.error('Backed up', numKeys, 'KV values')
}
