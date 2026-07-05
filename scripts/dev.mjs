#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const port = process.env.PORT || '3000'

// Kill any stale dev server on our port
try {
  const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim()
  if (pids) {
    for (const pid of pids.split('\n')) {
      try { process.kill(Number(pid), 'SIGKILL') } catch {}
    }
    console.log(`Killed stale process(es) on port ${port}`)
  }
} catch {}

// Remove corrupted dev cache if present
const nextDir = join(root, '.next')
if (existsSync(nextDir)) {
  rmSync(join(nextDir, 'cache'), { recursive: true, force: true })
}

console.log(`Starting Next.js on http://localhost:${port}`)
spawn('npx', ['next', 'dev', '-p', port], {
  cwd: root,
  stdio: 'inherit',
})
