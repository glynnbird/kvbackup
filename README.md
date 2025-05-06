# kvbackup

A simple utility to backup KV metadata and values from Cloudflare's KV service.

It fetches up to 1000 keys from the specified KV namespace and fetches each key in turn.

Limitations:

- only 1000 keys are backed up.
- it is assumed that metadata and KV values are JSON.

## Running

Clone this repo. Set some environment variables:

```sh
export CLOUDFLARE_AUTH_TOKEN="MY_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="MY_ACCOUNT_ID"
export CLOUDFLARE_NAMESPACE_ID="MY_NAMESPACE_ID"
# backup this namespace to a file
npm run start > mybackup.jsonl
```

## Output

One line per KV entry:

```js
{"id":"mykvid","metadata":{"x":1},"doc":{"y":42}}
```
