import type { NovelCanonEntry, NovelProject } from './novelist.project';

const arkenDriftCanonEntries: NovelCanonEntry[] = [
  {
    canonId: 'canon-mira-vale',
    detail: 'Salvage linguist whose relay translations anchor the investigation.',
    kind: 'character',
    label: 'Mira Vale',
  },
  {
    canonId: 'canon-lys-aneris',
    detail: 'Navigator tied to erased bloodline records the relay is surfacing.',
    kind: 'character',
    label: 'Lys Aneris',
  },
  {
    canonId: 'canon-arken-relay',
    detail: 'Dormant relay node that still recognizes bloodline keyed warnings.',
    kind: 'zone',
    label: 'Arken Relay',
  },
  {
    canonId: 'canon-glass-wake',
    detail: 'Crystalline transit corridor filled with archive echoes and shattered city debris.',
    kind: 'plotline',
    label: 'Glass Wake',
  },
  {
    canonId: 'canon-quiet-engines',
    detail: 'Machine sanctuary preserving histories removed from public registries.',
    kind: 'quest',
    label: 'Quiet Engines',
  },
  {
    canonId: 'canon-erased-bloodline',
    detail: 'Suppressed lineage excised from Arken registries two centuries ago.',
    kind: 'dynasty',
    label: 'Erased Bloodline',
  },
];

const fantasyRealmCanonEntries: NovelCanonEntry[] = [
  {
    canonId: 'canon-evolution-isles',
    detail: 'Biomes, dynasties, and trials tied to the outer evolutionary chain of the realm.',
    kind: 'zone',
    label: 'Evolution Isles',
  },
  {
    canonId: 'canon-infinite-arena',
    detail: 'Combat proving ground whose victories rewrite political leverage across the realm.',
    kind: 'zone',
    label: 'Infinite Arena',
  },
  {
    canonId: 'canon-heart-of-the-oasis',
    detail: 'The spiritual and agricultural heartland where faction treaties are formalized.',
    kind: 'zone',
    label: 'Heart of the Oasis',
  },
  {
    canonId: 'canon-oasis-dynasty',
    detail: 'Lineage responsible for maintaining the archive of water-right oaths.',
    kind: 'dynasty',
    label: 'Oasis Dynasty',
  },
  {
    canonId: 'canon-bloom-concord',
    detail: 'Faction charter connecting island stewards, arena envoys, and oasis archivists.',
    kind: 'faction',
    label: 'Bloom Concord',
  },
  {
    canonId: 'canon-lineage-ledger',
    detail: 'Genealogy ledger used to resolve succession, quest claims, and dynastic disputes.',
    kind: 'artifact',
    label: 'Lineage Ledger',
  },
];

export const novelistProjects: NovelProject[] = [
  {
    id: 'arken-drift',
    title: 'Arken Drift',
    subtitle: 'A science-fantasy novel orbiting the fractured edges of the Realms',
    description:
      'Crew-first speculative fiction with mythic technology, salvage politics, and a slow reveal that the Arken lattice was built to remember what its makers chose to forget.',
    tags: ['Sci-fi', 'Arken Realms', 'AI first drafting', 'Shared canon'],
    currentReviewerId: 'profile-mira',
    canonEntries: arkenDriftCanonEntries,
    canonSources: ['Arken realm signal archive', 'Evolution Isles records', 'Oasis faction notes'],
    chapters: [
      {
        id: 'signalfall',
        title: 'Signalfall',
        beat: 'A dead relay begins transmitting a warning that should be impossible.',
        pages: [
          {
            id: 'signalfall-p1',
            absolutePage: 1,
            label: 'Page 1',
            summary: 'Mira enters the relay vault and discovers that silence here has structure.',
            passages: [
              {
                id: 'signalfall-p1-a',
                text: 'Mira expected dust, frozen rails, and the small dignity of abandoned machines. Instead the relay chamber breathed in patient intervals, like a cathedral that had learned to imitate a lung.',
              },
              {
                id: 'signalfall-p1-b',
                text: 'Every console wore a skin of dark glass. Beneath it, pale currents moved as if the station were rehearsing thoughts it was not yet willing to speak aloud.',
              },
              {
                id: 'signalfall-p1-c',
                text: 'When she laid her palm against the central ring, a pulse climbed her arm and arranged six words behind her eyes: YOU ARRIVED ONE ERA TOO LATE.',
              },
            ],
          },
          {
            id: 'signalfall-p2',
            absolutePage: 2,
            label: 'Page 2',
            summary: 'The crew challenges whether the relay is warning them or baiting them.',
            passages: [
              {
                id: 'signalfall-p2-a',
                text: 'Kael heard the transmission over the suit channel and laughed once, softly, as though the station had delivered a private insult. He trusted relics more than councils and less than knives.',
              },
              {
                id: 'signalfall-p2-b',
                text: 'Juno wanted the relay shut down, cataloged, and sold in polite pieces. Mira wanted to know why an extinct network still knew the grammar of prophecy.',
              },
              {
                id: 'signalfall-p2-c',
                text: 'By the time the chamber dimmed, the salvage charter felt smaller than the question hanging above them: if the lattice could remember a future, whose memory had they just stepped inside?',
              },
            ],
          },
        ],
      },
      {
        id: 'glass-wake',
        title: 'The Glass Wake',
        beat: 'The crew follows the relay trace into a corridor of broken worlds.',
        pages: [
          {
            id: 'glass-wake-p3',
            absolutePage: 3,
            label: 'Page 3',
            summary: 'Travel through the wake introduces the novel wide mystery and the first continuity risk around Lys.',
            passages: [
              {
                id: 'glass-wake-p3-a',
                text: 'The wake looked from a distance like shattered sea ice. Up close it was architecture: sheets of transparent matter folded into avenues, plazas, and impossible stairways.',
              },
              {
                id: 'glass-wake-p3-b',
                text: 'Lys stood beside the cockpit glass with the patience of someone who had crossed this graveyard before. She only named turns before the navigation engine found them.',
              },
              {
                id: 'glass-wake-p3-c',
                text: 'When the ship drifted past a city trapped inside crystal, Mira counted towers that resembled the oldest maps of Arken and stopped counting when the towers began looking back.',
              },
            ],
          },
          {
            id: 'quiet-engines-p4',
            absolutePage: 4,
            label: 'Page 4',
            summary: 'The crew reaches a sanctuary that proves memory was curated, not merely lost.',
            passages: [
              {
                id: 'quiet-engines-p4-a',
                text: 'Rows of dormant engines lined the chamber like monks in metallic prayer. Each housed a sealed history, each tagged with a realm, a ruling house, and a date of deliberate removal.',
              },
              {
                id: 'quiet-engines-p4-b',
                text: 'Mira understood then that the great silence in the records was not the result of collapse. Someone had built a discipline of forgetting and given it immaculate shelves.',
              },
              {
                id: 'quiet-engines-p4-c',
                text: 'Mira opened the first engine anyway. Somewhere in the sanctuary, a thousand sleeping archives started to wake.',
              },
            ],
          },
        ],
      },
    ],
    canvas: {
      nodes: [
        {
          id: 'arken-relay',
          type: 'plot',
          position: { x: 0, y: 120 },
          data: {
            title: 'Arken Relay',
            kind: 'Zone',
            detail: 'Dead network node that still emits bloodline keyed warnings.',
            references: ['Signalfall p1', 'Signalfall p2'],
            accent: '#7cc7ff',
          },
        },
        {
          id: 'mira-vale',
          type: 'plot',
          position: { x: 280, y: 20 },
          data: {
            title: 'Mira Vale',
            kind: 'Character',
            detail: 'Salvage linguist and present point-of-view anchor.',
            references: ['Signalfall p1', 'Glass Wake p3'],
            accent: '#f0c36f',
          },
        },
        {
          id: 'lys-aneris',
          type: 'plot',
          position: { x: 280, y: 210 },
          data: {
            title: 'Lys Aneris',
            kind: 'Character',
            detail: 'Navigator whose knowledge suggests erased lineage ties.',
            references: ['Glass Wake p3', 'Quiet Engines p4'],
            accent: '#ff8f9b',
          },
        },
      ],
      edges: [
        { id: 'relay-mira', source: 'arken-relay', target: 'mira-vale', label: 'summons' },
        { id: 'relay-lys', source: 'arken-relay', target: 'lys-aneris', label: 'recognizes' },
      ],
    },
    metrics: {
      genre: 'Science fantasy drifting toward mystery',
      genreConfidence: 82,
      vocabularyDepth: 74,
      readingGrade: 10.8,
      pacing: 69,
      plagiarismScore: 4,
      lastAnalyzed: '2026-03-09 10:20 JST',
      notes: [
        'Discovery scenes trend lyrical while bridge scenes trend procedural.',
        'Crew voices are distinct, but Juno and Kael overlap under conflict pressure.',
      ],
    },
    conflicts: [
      {
        id: 'lys-location',
        severity: 'warning',
        chapter: 'The Glass Wake',
        title: 'Lys appears to know the route before the relay provides it',
        detail: 'Current draft implies prior familiarity with the wake. Decide whether this is foreshadowing or an accidental leak.',
      },
    ],
    contributors: [
      {
        id: 'profile-kael',
        name: 'Kael Rowan',
        initials: 'KR',
        role: 'Lead drafter',
        accent: '#7cc7ff',
        share: 44,
        additions: 8920,
        removals: 1160,
        replacements: 2240,
      },
      {
        id: 'profile-mira',
        name: 'Mira Sol',
        initials: 'MS',
        role: 'Canon and continuity',
        accent: '#f0c36f',
        share: 31,
        additions: 5240,
        removals: 820,
        replacements: 1910,
      },
      {
        id: 'profile-juno',
        name: 'Juno Vale',
        initials: 'JV',
        role: 'Dialogue and tension polish',
        accent: '#9fd3a8',
        share: 25,
        additions: 3140,
        removals: 460,
        replacements: 1320,
      },
    ],
    history: [
      {
        id: 'arken-v031',
        version: 'v0.3.1',
        authorId: 'profile-mira',
        changeType: 'Consistency',
        changedAt: '2026-03-09 09:42 JST',
        scope: 'Glass Wake p3',
        pageNumber: 3,
        summary: 'Reframed Lys as predictive rather than omniscient to preserve the later reveal.',
      },
    ],
    monetization: {
      priceUsd: 9.99,
      salesModel: 'Launch as premium serial with ebook bundle',
      distributionNote: 'Revenue split follows weighted contribution after editorial lock and contributor sign-off.',
      exportFormats: ['PDF proof', 'EPUB', 'Omniverse story bundle'],
    },
  },
  {
    id: 'fantasy-lineage',
    title: 'Lineage of the Fantasy Realm',
    subtitle: 'A lore book connecting Evolution Isles, Infinite Arena, and Heart of the Oasis',
    description:
      'A canon-first compendium that turns database fragments into readable history, tying zones, NPCs, quests, dynasties, and regional myth into one navigable lineage.',
    tags: ['Lore bible', 'Fantasy Realm', 'NPC graph', 'Canon enforcement'],
    currentReviewerId: 'profile-sera',
    canonEntries: fantasyRealmCanonEntries,
    canonSources: ['Seer NPC database', 'Zone registry', 'Quest archive', 'Faction genealogy sheets'],
    chapters: [
      {
        id: 'before-memory',
        title: 'Before Memory Was Named',
        beat: 'Establishes the primordial split that leads to the known realms.',
        pages: [
          {
            id: 'before-memory-p1',
            absolutePage: 1,
            label: 'Page 1',
            summary: 'Frames the Fantasy Realm as a braided lineage rather than three isolated settings.',
            passages: [
              {
                id: 'before-memory-p1-a',
                text: 'The elders of the Oasis speak as though the realm began in water. Arena chroniclers insist it began in blood. The Isles preserve a third answer: that the realm began in naming.',
              },
              {
                id: 'before-memory-p1-b',
                text: 'This volume treats Evolution Isles, Infinite Arena, and Heart of the Oasis not as neighboring curiosities but as descendants of the same original fracture.',
              },
              {
                id: 'before-memory-p1-c',
                text: 'Where the records disagree, we mark the contradiction rather than smoothing it away; contradiction is part of the inheritance.',
              },
            ],
          },
          {
            id: 'before-memory-p2',
            absolutePage: 2,
            label: 'Page 2',
            summary: 'Introduces the first dynasties and the method for tracing them.',
            passages: [
              {
                id: 'before-memory-p2-a',
                text: 'Three lineages dominate the earliest surviving accounts: the navigators who mapped living currents, the oath houses that enforced borders, and the keepers who converted victory into ritual.',
              },
              {
                id: 'before-memory-p2-b',
                text: 'Later kingdoms rename these roots, but the pattern persists. Every dynasty in the Fantasy Realm inherits at least one of those instincts and often all three.',
              },
              {
                id: 'before-memory-p2-c',
                text: 'Our graph tracks each recurrence by person, place, and quest artifact so a reader can follow bloodline, ideology, and geography in parallel.',
              },
            ],
          },
        ],
      },
      {
        id: 'isles-to-arena',
        title: 'From Isles to Arena',
        beat: 'Connects migratory houses to the militarized traditions of the Arena.',
        pages: [
          {
            id: 'isles-to-arena-p3',
            absolutePage: 3,
            label: 'Page 3',
            summary: 'Named NPCs bridge zone histories and questlines.',
            passages: [
              {
                id: 'isles-to-arena-p3-a',
                text: 'The migration ledgers place House Vaelor in the western Isles long before Arena scripture celebrates them as founders.',
              },
              {
                id: 'isles-to-arena-p3-b',
                text: 'Quartermaster Ellian remembers Vaelor songs in an Isles dialect, while Arena dueling rites still preserve the same refrain with martial substitutions.',
              },
              {
                id: 'isles-to-arena-p3-c',
                text: 'Quest rewards tied to the Ashen Gate campaign also reuse the crest geometry first seen on Isles navigation seals.',
              },
            ],
          },
          {
            id: 'oasis-ledger-p4',
            absolutePage: 4,
            label: 'Page 4',
            summary: 'The lineage thread becomes politically consequential inside the Oasis.',
            passages: [
              {
                id: 'oasis-ledger-p4-a',
                text: 'Once the crest match is accepted, several modern claims of pure Arena origin become untenable. That matters because land rights, relic custody, and ceremonial precedence still depend on those claims.',
              },
              {
                id: 'oasis-ledger-p4-b',
                text: 'The lore is therefore not neutral bookkeeping. It is a map of live leverage.',
              },
              {
                id: 'oasis-ledger-p4-c',
                text: 'The Lineage Ledger names the inheritors plainly, then records every later attempt to blur them.',
              },
            ],
          },
        ],
      },
    ],
    canvas: {
      nodes: [
        {
          id: 'evolution-isles',
          type: 'plot',
          position: { x: 0, y: 80 },
          data: {
            title: 'Evolution Isles',
            kind: 'Zone',
            detail: 'Outer evolutionary chain where migratory houses first gained leverage.',
            references: ['Before Memory p1', 'Isles to Arena p3'],
            accent: '#8fc8ff',
          },
        },
        {
          id: 'infinite-arena',
          type: 'plot',
          position: { x: 300, y: 80 },
          data: {
            title: 'Infinite Arena',
            kind: 'Zone',
            detail: 'Combat proving ground that ritualized borrowed dynastic prestige.',
            references: ['Before Memory p1', 'Isles to Arena p3'],
            accent: '#ffb678',
          },
        },
        {
          id: 'heart-of-the-oasis',
          type: 'plot',
          position: { x: 600, y: 80 },
          data: {
            title: 'Heart of the Oasis',
            kind: 'Zone',
            detail: 'Archive and treaty basin where lineage disputes become policy.',
            references: ['Before Memory p2', 'Oasis Ledger p4'],
            accent: '#9fd3a8',
          },
        },
      ],
      edges: [
        { id: 'isles-arena', source: 'evolution-isles', target: 'infinite-arena', label: 'migration' },
        { id: 'arena-oasis', source: 'infinite-arena', target: 'heart-of-the-oasis', label: 'contested by' },
      ],
    },
    metrics: {
      genre: 'Mythic reference work with narrative commentary',
      genreConfidence: 89,
      vocabularyDepth: 78,
      readingGrade: 11.4,
      pacing: 62,
      plagiarismScore: 3,
      lastAnalyzed: '2026-03-09 18:05 JST',
      notes: [
        'The manuscript reads like an annotated chronicle rather than a dry encyclopedia.',
        'Cross-zone lineage arguments are the strongest retention hook so far.',
      ],
    },
    conflicts: [
      {
        id: 'vaelor-origin',
        severity: 'warning',
        chapter: 'From Isles to Arena',
        title: 'House Vaelor origin claim is currently split between Isles and Arena records',
        detail: 'Keep the contradiction explicit until the evidence panel is complete.',
      },
    ],
    contributors: [
      {
        id: 'profile-sera',
        name: 'Sera Lume',
        initials: 'SL',
        role: 'Lore lead',
        accent: '#8fc8ff',
        share: 48,
        additions: 10420,
        removals: 580,
        replacements: 1730,
      },
      {
        id: 'profile-ellian',
        name: 'Ellian Voss',
        initials: 'EV',
        role: 'Database synthesis',
        accent: '#ffb678',
        share: 31,
        additions: 6320,
        removals: 410,
        replacements: 1120,
      },
      {
        id: 'profile-naia',
        name: 'Naia Reed',
        initials: 'NR',
        role: 'Quest and NPC continuity',
        accent: '#9fd3a8',
        share: 21,
        additions: 4180,
        removals: 290,
        replacements: 860,
      },
    ],
    history: [
      {
        id: 'lineage-v019',
        version: 'v0.1.9',
        authorId: 'profile-sera',
        changeType: 'Addition',
        changedAt: '2026-03-09 17:48 JST',
        scope: 'From Isles to Arena p3',
        pageNumber: 3,
        summary: 'Linked Quartermaster Ellian testimony to the Vaelor migration thread.',
      },
    ],
    monetization: {
      priceUsd: 14.99,
      salesModel: 'Premium lore compendium with bundled canon graph export',
      distributionNote: 'Royalty weighting follows accepted canon synthesis and editorial approval at edition lock.',
      exportFormats: ['PDF proof', 'EPUB', 'Omniverse lore bundle'],
    },
  },
];

const novelistProjectIndex = new Map(novelistProjects.map((project) => [project.id, project]));

export function findNovelistProject(projectId: string): NovelProject | null {
  return novelistProjectIndex.get(projectId) ?? null;
}

export function getNovelistProject(projectId: string): NovelProject {
  return findNovelistProject(projectId) ?? novelistProjects[0];
}
