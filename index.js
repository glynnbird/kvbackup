const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CF_AUTH_TOKEN = process.env.CLOUDFLARE_AUTH_TOKEN
const CF_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID
const CF_API_URL = 'https://api.cloudflare.com/client/v4/accounts'

if (!CF_ACCOUNT_ID || !CF_AUTH_TOKEN || !CF_NAMESPACE_ID) {
  console.error('Missing env variables')
  process.exit(1)
}

// get a list of all keys for this namespace
const listAllKeys = async () => {
  // curl -H"Authorization: Bearer $CF_AUTH_TOKEN" "$CF_API_URL/$CF_ACCOUNT_ID/storage/kv/namespaces/$CF_NAMESPACE_ID/keys?limit=1000" 
  const params = new URLSearchParams({ limit: 1000 })
  const url = `${CF_API_URL}/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/keys?` + params
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CF_AUTH_TOKEN}`
    }
  })
  const j = await response.json()
  return j.result
}

// get a single key's value
const getKey = async (id) => {
  // curl -H"Authorization: Bearer $CF_AUTH_TOKEN" "$CF_API_URL/$CF_ACCOUNT_ID/storage/kv/namespaces/$CF_NAMESPACE_ID/values/$ID"
  const url = `${CF_API_URL}/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values/${id}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CF_AUTH_TOKEN}`
    }
  })
  const j = await response.json()
  return j
}

// get a list of single keys value
const getKeys = async (ids) => {
  // curl -H"Authorization: Bearer $CF_AUTH_TOKEN" "$CF_API_URL/$CF_ACCOUNT_ID/storage/kv/namespaces/$CF_NAMESPACE_ID/values/$ID"
  const url = `${CF_API_URL}/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/bulk/get`
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify({ keys: ids, withMetadata: true, type: 'json' }),
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${CF_AUTH_TOKEN}`
    }
  })
  const j = await response.json()
  let retval = ''
  
  // return a list of JSON, one key/value per line
  for(let k of Object.keys(j.result.values)) {
    retval += JSON.stringify({
      id: k,
      metadata: j.result.values[k].metadata,
      doc: j.result.values[k].value
    }) + '\n'
  }
  return retval
}

// entry point
const main = async () => {
  // get a list of up to 1000 keys in this namespace
  const keys = await listAllKeys()
  const numKeys = keys.length
  let count = 0

  // get batches of 100 keys
  do {
    // get the first batch of keys
    const keyBatch = keys.splice(0, Math.min(100, keys.length)).map((k) => { return k.name })

    // fetch the keys listed in keyBatch
    const res = await getKeys(keyBatch)
    console.log(res)

    // status
    count += keyBatch.length
    process.stderr.write(`  ${count}/${numKeys}      \r`)

  } while(keys.length > 0)

  // all done
  console.error('Backed up', numKeys, 'KV values')
}

main()
