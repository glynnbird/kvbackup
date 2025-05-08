#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { restore } from '../index.mjs'
import { readFile } from 'fs/promises';

// load the npm package meta
const app = JSON.parse(await readFile('./package.json'))

// boilerplate syntax string
const syntax = 
`Syntax:
--account/-a            (CLOUDFLARE_ACCOUNT_ID)     Cloudflare Account ID          (required)
--token/-t              (CLOUDFLARE_AUTH_TOKEN)     Cloudflare Auth token          (required)
--namespace/-n          (CLOUDFLARE_NAMESPACE_ID)   Cloudflare KV Namespace ID     (required)
--version/v                                         Show app version               (default: false)
`

// environment variables
const account = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const token = process.env.CLOUDFLARE_AUTH_TOKEN || ''
const namespace = process.env.CLOUDFLARE_NAMESPACE_ID || ''

// command line params
const argv = process.argv.slice(2)

// cli options for parseArgs
const options = {
  account: {
    type: 'string',
    short: 'a',
    default: account
  },
  token: {
    type: 'string',
    short: 't',
    default: token
  },
  namespace: {
    type: 'string',
    short: 'n',
    default: namespace
  },
  version: {
    type: 'boolean',
    short: 'v',
    default: false
  },
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  }
}

// parse command-line options
const { values } = parseArgs({ argv, options })

// version mode
if (values.version) {
  console.log(`${app.name} ${app.version}`)
  process.exit(0)
}

// help mode
if (values.help) {
  console.log(syntax)
  process.exit(0)
}

// must supply URL & database
if (!values.account || !values.namespace || !values.token) {
  console.error(syntax, 'Error: You must supply an account/namespace/token')
  process.exit(1)
}

// start the snapshot
const main = async () => {
  await restore(values)
}
main()
