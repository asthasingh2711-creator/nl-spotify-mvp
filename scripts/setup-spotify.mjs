#!/usr/bin/env node
/**
 * Securely save Spotify credentials to .env.local (never committed to git).
 * Run in your terminal — credentials are not sent to chat or any server.
 */
import { createInterface } from 'node:readline'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env.local')

function readExisting() {
  if (!existsSync(envPath)) return {}
  const vars = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) vars[m[1]] = m[2]
  }
  return vars
}

function writeEnv(vars) {
  const lines = [
    '# Spotify Web API — do not commit this file',
    `SPOTIFY_CLIENT_ID=${vars.SPOTIFY_CLIENT_ID ?? ''}`,
    `SPOTIFY_CLIENT_SECRET=${vars.SPOTIFY_CLIENT_SECRET ?? ''}`,
  ]
  if (vars.OPENAI_API_KEY) lines.push(`OPENAI_API_KEY=${vars.OPENAI_API_KEY}`)
  if (vars.OPENAI_MODEL) lines.push(`OPENAI_MODEL=${vars.OPENAI_MODEL}`)
  if (vars.NEXT_PUBLIC_APP_URL) lines.push(`NEXT_PUBLIC_APP_URL=${vars.NEXT_PUBLIC_APP_URL}`)
  writeFileSync(envPath, lines.join('\n') + '\n', { mode: 0o600 })
}

function ask(rl, question, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(question, (answer) => resolve(answer.trim()))
      return
    }
    process.stdout.write(question)
    const stdin = process.stdin
    const wasRaw = stdin.isRaw
    if (!stdin.isTTY) {
      rl.question('', (answer) => resolve(answer.trim()))
      return
    }
    stdin.setRawMode?.(true)
    stdin.resume()
    let value = ''
    const onData = (chunk) => {
      const c = chunk.toString()
      if (c === '\n' || c === '\r' || c === '\u0004') {
        stdin.setRawMode?.(wasRaw ?? false)
        stdin.pause()
        stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(value.trim())
      } else if (c === '\u007f' || c === '\b') {
        value = value.slice(0, -1)
      } else if (c === '\u0003') {
        process.exit(1)
      } else {
        value += c
      }
    }
    stdin.on('data', onData)
  })
}

async function main() {
  console.log('\nSpotify credentials setup')
  console.log('Paste from developer.spotify.com/dashboard → your app → Settings')
  console.log('(Input stays in your terminal — not sent to chat.)\n')

  const existing = readExisting()
  const rl = createInterface({ input: process.stdin, output: process.stdout })

  const clientId = await ask(rl, 'Client ID: ')
  if (!clientId) {
    console.error('Client ID is required.')
    rl.close()
    process.exit(1)
  }

  const clientSecret = await ask(rl, 'Client Secret (hidden): ', true)
  if (!clientSecret) {
    console.error('Client Secret is required.')
    rl.close()
    process.exit(1)
  }

  rl.close()

  writeEnv({
    ...existing,
    SPOTIFY_CLIENT_ID: clientId,
    SPOTIFY_CLIENT_SECRET: clientSecret,
    NEXT_PUBLIC_APP_URL: existing.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  })

  console.log('\n✓ Saved to .env.local (git-ignored)')
  console.log('Restart the dev server: npm run dev:clean\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
