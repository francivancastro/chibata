import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const divisionKeys = new Set(['academic', 'design', 'engineering', 'finance', 'game-development', 'gis', 'healthcare', 'marketing', 'paid-media', 'product', 'project-management', 'research', 'sales', 'security', 'spatial-computing', 'specialized', 'support', 'testing'])
const allowedFields = new Set(['name', 'description', 'color', 'emoji', 'vibe', 'services'])
const maxString = { name: 160, description: 1800, color: 80, emoji: 32, vibe: 1800, 'service.name': 160, 'service.tier': 80 }

function fail(message) { throw new Error(`CATALOG_INVALID: ${message}`) }
function scalar(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1)
  return trimmed
}
function clean(value, field) {
  if (typeof value !== 'string') fail(`${field} must be text`)
  const normalized = value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
  if (normalized.length > (maxString[field] || 600)) fail(`${field} exceeds ${maxString[field] || 600} characters`)
  return normalized
}
function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function safeHost(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) fail('service URL must be https without credentials/query/hash')
    return url.host
  } catch { fail('invalid service URL') }
}

function parseFrontmatter(markdown, file) {
  const lines = markdown.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') fail(`missing frontmatter: ${file}`)
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---')
  if (end < 0) fail(`unterminated frontmatter: ${file}`)
  const result = { services: [] }
  let service = null
  let activeField = null
  let ignoredField = false
  for (const line of lines.slice(1, end)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const root = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (root) {
      const [, key, value] = root
      if (!allowedFields.has(key)) {
        // Some source files contain executable-looking persona metadata such as
        // tools/integrations. Deliberately ignore that field and its indented
        // value; only the allowlist below can reach the public catalog.
        activeField = null
        ignoredField = true
        service = null
        continue
      }
      if (key === 'services') continue
      result[key] = scalar(value)
      activeField = key
      ignoredField = false
      service = null
      continue
    }
    const serviceStart = line.match(/^\s+-\s+name:\s*(.+)$/)
    if (serviceStart) { service = { name: scalar(serviceStart[1]) }; result.services.push(service); continue }
    const serviceField = line.match(/^\s{4}([A-Za-z][\w-]*):\s*(.*)$/)
    if (serviceField && service) {
      if (!['name', 'url', 'tier'].includes(serviceField[1])) fail(`unsupported service field ${serviceField[1]}: ${file}`)
      service[serviceField[1]] = scalar(serviceField[2])
      continue
    }
    if (ignoredField && /^\s+/.test(line)) continue
    const continuation = line.match(/^\s{2,}(.+)$/)
    if (continuation && activeField && typeof result[activeField] === 'string') {
      result[activeField] += ` ${scalar(continuation[1])}`
      continue
    }
    fail(`unsupported frontmatter syntax: ${file}`)
  }
  for (const field of ['name', 'description', 'color', 'emoji', 'vibe']) if (result[field] !== undefined) result[field] = clean(result[field], field)
  if (!result.name || !result.description) fail(`name and description are required: ${file}`)
  result.services = result.services.map(item => ({ name: clean(item.name || '', 'service.name'), tier: clean(item.tier || '', 'service.tier'), host: item.url ? safeHost(item.url) : '' }))
  return result
}

export async function generateCatalog(sourceInput, outputInput) {
  const source = await realpath(sourceInput)
  const sourceStat = await stat(source)
  if (!sourceStat.isDirectory()) fail('source must be a directory')
  const divisionsPath = path.join(source, 'divisions.json')
  const divisionsData = JSON.parse(await readFile(divisionsPath, 'utf8'))
  const divisions = divisionsData.divisions || {}
  const keys = Object.keys(divisions).sort()
  if (keys.length !== 18 || keys.some(key => !divisionKeys.has(key))) fail('divisions.json does not match approved taxonomy')
  const agents = []
  const seenIds = new Set()
  for (const division of keys) {
    const dir = path.join(source, division)
    const divisionStat = await lstat(dir)
    if (divisionStat.isSymbolicLink() || !divisionStat.isDirectory()) fail(`division must be a real directory: ${division}`)
    const allEntries = await readdir(dir, { withFileTypes: true })
    if (allEntries.some(entry => entry.isSymbolicLink())) fail(`symlink entries are not allowed: ${division}`)
    const entries = allEntries.filter(entry => entry.isFile() && entry.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const relative = path.join(division, entry.name)
      const metadata = parseFrontmatter(await readFile(path.join(dir, entry.name), 'utf8'), relative)
      const agentSlug = slug(metadata.name)
      if (!agentSlug) fail(`empty slug: ${relative}`)
      const id = `${division}:${agentSlug}`
      if (seenIds.has(id)) fail(`duplicate id: ${id}`)
      seenIds.add(id)
      agents.push({ id, slug: agentSlug, name: metadata.name, division, divisionLabel: divisions[division].label, divisionColor: divisions[division].color, icon: divisions[division].icon, ...metadata })
    }
  }
  const normalized = { schema_version: 1, source_id: 'github.com/msitarzewski/agency-agents', source_commit: 'd3f71c4bb8922d3eea7576237a870dd59b3cdd52', license: 'MIT', divisions: keys.map(key => ({ id: key, ...divisions[key] })), agents }
  const sourceHash = createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
  const output = { ...normalized, source_hash: sourceHash, generated_at: new Date().toISOString() }
  await mkdir(path.dirname(outputInput), { recursive: true })
  await writeFile(outputInput, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  return output
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  const args = process.argv.slice(2)
  let sourceInput
  let outputInput = path.resolve(process.cwd(), 'src/data/agencyCatalog.json')
  if (!args.length) sourceInput = process.env.AGENCY_AGENTS_SOURCE
  else if (args.length === 4 && args[0] === '--source' && args[2] === '--output') {
    sourceInput = args[1]
    outputInput = args[3]
  } else fail('usage: --source <approved-dir> --output <file>')
  if (!sourceInput) fail('set AGENCY_AGENTS_SOURCE or pass --source <approved-dir>')
  const result = await generateCatalog(sourceInput, outputInput)
  console.log(`Generated ${result.agents.length} agents across ${result.divisions.length} divisions (${result.source_hash})`)
}
