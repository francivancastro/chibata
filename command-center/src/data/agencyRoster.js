export const agencySource = {
  name: 'Agency Agents',
  url: 'https://github.com/msitarzewski/agency-agents',
  commit: 'd3f71c4bb8922d3eea7576237a870dd59b3cdd52',
  license: 'MIT'
}

// Capability profiles enrich observed Maestri identities; they never create presence or work state.
export const agencyProfiles = {
  Codex: {
    slug: 'engineering-multi-agent-systems-architect',
    title: 'Multi-Agent Systems Architect',
    division: 'Engineering',
    specialty: 'topologia, contexto, governança e recuperação'
  },
  Cipher: {
    slug: 'design-ui-designer',
    title: 'UI Designer',
    division: 'Design',
    specialty: 'design systems, interfaces e acabamento visual'
  },
  Forge: {
    slug: 'engineering-frontend-developer',
    title: 'Frontend Developer',
    division: 'Engineering',
    specialty: 'Vue, interfaces web e performance'
  },
  Atlas: {
    slug: 'product-product-manager',
    title: 'Product Manager',
    division: 'Product',
    specialty: 'prioridades, requisitos e critérios de aceite'
  },
  Sage: {
    slug: 'design-design-ux-researcher',
    title: 'UX Researcher',
    division: 'Design',
    specialty: 'pesquisa, contexto e comportamento'
  },
  Lumen: {
    slug: 'design-design-ui-finish-gate-reviewer',
    title: 'UI Finish-Gate Reviewer',
    division: 'Design',
    specialty: 'auditoria visual e anti-interface genérica'
  }
}

export function enrichAgencyProfile(agent) {
  return { ...agent, agency_profile: agencyProfiles[agent?.name] || null, agency_source: agencySource }
}
