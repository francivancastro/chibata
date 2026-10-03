import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { generateCatalog } from './generate-agent-catalog.mjs'

test('catalog generation emits metadata only and preserves stable ids', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'agency-catalog-'))
  const divisions = { divisions: Object.fromEntries(['academic', 'design', 'engineering', 'finance', 'game-development', 'gis', 'healthcare', 'marketing', 'paid-media', 'product', 'project-management', 'research', 'sales', 'security', 'spatial-computing', 'specialized', 'support', 'testing'].map(id => [id, { label: id, icon: 'Box', color: '#123456' }])) }
  await writeFile(path.join(root, 'divisions.json'), JSON.stringify(divisions))
  for (const division of Object.keys(divisions.divisions)) await (await import('node:fs/promises')).mkdir(path.join(root, division), { recursive: true })
  await writeFile(path.join(root, 'design', 'design-ui.md'), `---\nname: UI Designer\ndescription: Safe design metadata\ncolor: purple\nemoji: 🎨\nvibe: Precise\nservices:\n  - name: Catalogue\n    url: https://example.com/path\n    tier: free\n---\n# SECRET_BODY_MUST_NOT_EXPORT\nAPI_KEY=hidden\n`)
  const outputPath = path.join(root, 'out.json')
  const catalog = await generateCatalog(root, outputPath)
  assert.equal(catalog.agents[0].id, 'design:ui-designer')
  assert.equal(catalog.agents[0].services[0].host, 'example.com')
  assert.equal(JSON.stringify(catalog).includes('SECRET_BODY'), false)
  assert.equal(JSON.stringify(catalog).includes('API_KEY'), false)
  assert.equal(JSON.stringify(JSON.parse(await readFile(outputPath, 'utf8'))).includes('/path'), false)
})

test('catalog rejects service credentials and query strings', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'agency-catalog-invalid-'))
  const divisions = { divisions: Object.fromEntries(['academic', 'design', 'engineering', 'finance', 'game-development', 'gis', 'healthcare', 'marketing', 'paid-media', 'product', 'project-management', 'research', 'sales', 'security', 'spatial-computing', 'specialized', 'support', 'testing'].map(id => [id, { label: id, icon: 'Box', color: '#123456' }])) }
  await writeFile(path.join(root, 'divisions.json'), JSON.stringify(divisions))
  for (const division of Object.keys(divisions.divisions)) await (await import('node:fs/promises')).mkdir(path.join(root, division), { recursive: true })
  await writeFile(path.join(root, 'design', 'bad.md'), '---\nname: Bad\ndescription: Bad\nservices:\n  - name: Bad\n    url: https://user:pass@example.com/?token=x\n---\n')
  await assert.rejects(() => generateCatalog(root, path.join(root, 'out.json')), /CATALOG_INVALID/)
})
