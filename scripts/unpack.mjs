import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const bundleDir = path.join(root, 'bundle')
const parts = fs.readdirSync(bundleDir)
  .filter((name) => /^part-\d+\.txt$/.test(name))
  .sort()

if (!parts.length) throw new Error('NesilEv source bundle not found')

const encoded = parts
  .map((name) => fs.readFileSync(path.join(bundleDir, name), 'utf8').trim())
  .join('')

const archive = path.join(root, '.nesilev-source.tgz')
fs.writeFileSync(archive, Buffer.from(encoded, 'base64'))
execFileSync('tar', ['-xzf', archive, '-C', root], { stdio: 'inherit' })

fs.writeFileSync(
  path.join(root, '.env.production'),
  [
    'NEXT_PUBLIC_SUPABASE_URL=https://eyiflkmadiaurzzwring.supabase.co',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_LvPeOTy8awYKTUQtsrKVIw_YvbCJBJ0',
    '',
  ].join('\n')
)

console.log('NesilEv source restored; starting production build')
execFileSync(path.join(root, 'node_modules', '.bin', 'next'), ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: 'https://eyiflkmadiaurzzwring.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_LvPeOTy8awYKTUQtsrKVIw_YvbCJBJ0',
  },
})
