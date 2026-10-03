import catalog from './agencyCatalog.json'

export const agencySource = {
  name: catalog.source_id,
  commit: catalog.source_commit,
  license: catalog.license,
  hash: catalog.source_hash,
  generatedAt: catalog.generated_at
}

// Maestri remains the source of runtime identity, state and evidence. This
// catalog only contributes descriptive metadata and never creates presence.
const profilesByName = new Map()
const ambiguousNames = new Set()
for (const profile of catalog.agents) {
  if (profilesByName.has(profile.name)) {
    ambiguousNames.add(profile.name)
    profilesByName.delete(profile.name)
    continue
  }
  profilesByName.set(profile.name, profile)
}

export function enrichAgencyProfile(agent) {
  const profile = agent?.name && !ambiguousNames.has(agent.name) ? profilesByName.get(agent.name) : null
  return {
    ...agent,
    agency_profile: profile ? {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      title: profile.name,
      description: profile.description,
      specialty: profile.description,
      division: profile.divisionLabel,
      division_id: profile.division,
      division_color: profile.divisionColor,
      icon: profile.icon,
      color: profile.color,
      emoji: profile.emoji,
      vibe: profile.vibe,
      services: profile.services
    } : null,
    agency_catalog_status: profile ? 'matched' : 'unmatched',
    agency_source: agencySource
  }
}
