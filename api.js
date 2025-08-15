const CF_API_URL = 'https://api.cloudflare.com/client/v4/accounts'

// get a list of all keys for this namespace
export async function listAllKeys(opts) {
  const retval = []
  let allDone = false
  let cursor = ''
  do {

    // fetch a batch of keys
    // curl -H"Authorization: Bearer $CF_AUTH_TOKEN" "$CF_API_URL/$CF_ACCOUNT_ID/storage/kv/namespaces/$CF_NAMESPACE_ID/keys?limit=1000" 
    const paramsObj = { limit: 1000 }
    if (cursor) {
      paramsObj.cursor = cursor
    }
    const params = new URLSearchParams(paramsObj)
    const url = `${CF_API_URL}/${opts.account}/storage/kv/namespaces/${opts.namespace}/keys?` + params
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${opts.token}`
      }
    })
    const j = await response.json()

    // add keys to our return value
    if (j.result && j.result.length > 0) {
      retval.push(...j.result)
    }

    // decide whether to iterate
    if (j.result_info && j.result_info.cursor) {
      cursor = j.result_info.cursor
    } else {
      allDone = true
    }

    // show progress
    console.error('Fetching keys list', retval.length)

  } while (!allDone)

  return retval
}

// get a list of single keys value
export async function getKeys(ids, opts) {
  // curl -H"Authorization: Bearer $CF_AUTH_TOKEN" -X POST -d '' "$CF_API_URL/$CF_ACCOUNT_ID/storage/kv/namespaces/$CF_NAMESPACE_ID/bulk/get"
  const url = `${CF_API_URL}/${opts.account}/storage/kv/namespaces/${opts.namespace}/bulk/get`
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify({ keys: ids, withMetadata: true }),
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${opts.token}`
    }
  })
  const j = await response.json()
  let retval = ''
  
  // return a list of JSON, one key/value per line
  for(let k of Object.keys(j.result.values)) {
    if (j.result.values[k]) {
      retval += JSON.stringify({
        key: k,
        metadata: j.result.values[k].metadata,
        value: j.result.values[k].value
      }) + '\n'
    } else {
      console.error('Error detected on key', k)
    }
  }
  return retval
}
