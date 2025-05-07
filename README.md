# kvbackup

A simple utility to backup and restore KV metadata and values from Cloudflare's KV service.

It fetches up to 1000 keys from the specified KV namespace and fetches each key in turn.

Limitations:

- only 1000 keys are backed up.

## Backup

Clone this repo. Set some environment variables:

```sh
export CLOUDFLARE_AUTH_TOKEN="MY_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="MY_ACCOUNT_ID"
export CLOUDFLARE_NAMESPACE_ID="MY_NAMESPACE_ID"
# backup this namespace to a file
node backup.mjs > mybackup.jsonl
```

## Restore

Restore is the opposite: pipe your backed-up file into `restore.mjs`:

```sh
export CLOUDFLARE_NAMESPACE_ID="MY_NAMESPACE_ID"
cat mybackup.jsonl | node restore.mjs
```

## Output of backup file

One line per KV entry:

```js
{"key":"mykey1","metadata":{"x":1},"value":"{\"y\":42}"}
{"key":"mykey2","metadata":{"x":2},"value":"{\"y\":43}"}
```
