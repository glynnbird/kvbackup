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

// entry point
const main = async () => {
  // get a list of up to 1000 keys in this namespace
  const keys = await listAllKeys()
  const numKeys = keys.length
  let count = 0

  // // loop through all the keys
  for (const key of keys) {

    // fetch each key to get its value
    const obj = {
      id: key.name,
      metadata: key.metadata
    }
    obj.doc = await getKey(key.name)

    // output
    console.log(JSON.stringify(obj))

    // progress meter
    count++
    process.stderr.write(`  ${count}/${numKeys}      \r`)
  }

  // all done
  console.error('Backed up', numKeys, 'KV values')
}

main()
