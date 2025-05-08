import { Transform } from 'node:stream'

const CF_API_URL = 'https://api.cloudflare.com/client/v4/accounts'

// the size of the of batches writes
const WRITE_BATCH_SIZE = 100

// transform streamed string into lines, emit one line of text
// to the next transformer.
export function liner() {
  return new Transform({
    objectMode: true,
    transform: function (chunk, encoding, done) {
      let data = chunk.toString('utf8')
      if (this._lastLineData) {
        data = this._lastLineData + data
        this._lastLineData = null
      }
      const lines = data.split(/\s*\n/)
      this._lastLineData = lines.splice(lines.length - 1, 1)[0]
      lines.forEach(this.push.bind(this))
      done()
    },
    flush: function (done) {
      this.push(this._lastLineData)
      this._lastLineData = null
      done()
    }
  })
}

// take each line of text, parse it as JSON (as long as it is not empty)
// and emit batches of 100 objects - the last batch might be smaller.
export function batcher() {
  const batch = []
  return new Transform({
    objectMode: true,
    transform: function (obj, _, done) {
      // push the change into our batch array
      if (obj) {
        // turn the string into an object
        obj = JSON.parse(obj)
        batch.push(obj)

        // if we have at least a full batch
        if (batch.length >= WRITE_BATCH_SIZE) {
          // send a full batch to the next thing in the pipeline
          this.push(batch.splice(0, WRITE_BATCH_SIZE))
        }
      } 
      done()
    },
    flush: function (done) {
      // handle the any remaining buffered data
      if (batch.length > 0) {
        // send anything left as a final batch
        this.push(batch)
      }
      done()
    }
  })
}

// write each batch to the Cloudflare bulk API
export function apiWriter(opts) {
  let total = 0
  // create stream transformer
  return new Transform({
    objectMode: true,
    transform: function (batch, encoding, done) {
      try {
        if (batch && batch.length > 0) {
          // write the kv items to the Cloudflare API
          const url = `${CF_API_URL}/${opts.account}/storage/kv/namespaces/${opts.namespace}/bulk`
          total += batch.length
          this.push(total + '\n')
          fetch(url, {
            method: 'put',
            body: JSON.stringify(batch),
            headers: {
              'Content-type': 'application/json',
              Authorization: `Bearer ${opts.token}`
            }
          }).then(function(res) {
            console.log('HTTP response', res.status)
            done()
          })
        }
      } catch (e) {
        console.log(e)
        done()
      }
    },
    flush: function (done) {
      done()
    }
  })
}
