# kvbackup

A simple command-line utility and library to backup and restore KV metadata and values from Cloudflare's KV service.

- `kvbackup` - It fetches all the keys in batches of 1000, then fetches each key's value/metadata in batches of 100.
- `kvrestore` - writes key/value/metadata back to KV in batches of 100.

## Installation

Install using npm or your favourite package manager:

```sh
npm install -g kvbackup
```

## Performing a backup

Set some environment variables:

```sh
# some environment variables with the auth token and Cloudflare account id
# to work with. We can pass CLOUDFLARE_NAMESPACE_ID here too, but we can
# mix and match environment variables with CLI params
export CLOUDFLARE_AUTH_TOKEN="MY_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="MY_ACCOUNT_ID"
```

Then run a backup for a single KV namespace:

```sh
# backup this namespace to a file
kvbackup --namespace abc123 > mybackup.jsonl
```

## Restore

Restore is the opposite: pipe your backed-up file into `kvrestore`:

```sh
cat mybackup.jsonl | kvrestore --namespace def456
```

## Format of the backup file

One line per KV entry, each line containing a `key`, the `metadata` object an the `value` string:

```js
{"key":"mykey1","metadata":{"x":1},"value":"{\"y\":42}"}
{"key":"mykey2","metadata":{"x":2},"value":"{\"y\":43}"}
```

## Environment variables (and CLI parameters):

- `CLOUDFLARE_AUTH_TOKEN` (`--token/-t`) - set up an auth token in https://dash.cloudflare.com/profile/api-tokens. It must have permissions to "edit KV Workers Storage".
- `CLOUDFLARE_ACCOUNT_ID` (`--account/-a`) - the id of the Cloudflare account we are working with. This can be found in your browser's URL bar when visiting: https://dash.cloudflare.com
- `CLOUDFLARE_NAMESPACE_ID` (`--namespace/-n`) - the id of the KV Namespace to backup or restore. 

## Using programmatically

### backup

```js
import { backup } from 'kvbackup'

const opts = {
  namespace: 'mynamespace',
  account: 'abc123',
  token: 'xyz',
  ws: creatWriteStream('./mybackup.jsonl'),
}
await backup(opts)
```


### restore

```js
import { restore } from 'kvbackup'

const opts = {
  rs: creatReadStream('./mybackup.jsonl', { encoding: 'utf8' }),
  namespace: 'mynamespace',
  account: 'abc123',
  token: 'xyz'
}
await restore(opts)
```
