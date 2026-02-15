
import { ResourceType, Ritual, Formation, Profession, ResourceMetadata, Talent } from './types';
// Add missing icon imports for fleet upgrades
import { Shield, Rocket, Target } from 'lucide-react';

export const RESOURCE_METADATA: Record<string, ResourceMetadata> = {
  [ResourceType.STELLAR_DUST]: {
    rarity: "common", spawnWeight: 100, production: 1.0, consumption: 0, value: 1,
    tags: ["currency", "base", "stable"], usedIn: ["hiring", "upgrades"],
    synergy: { with: [], effect: "Standard multiversal exchange medium." }
  },
  [ResourceType.VOID_CRYSTALS]: {
    rarity: "epic", spawnWeight: 8, production: 0.3, consumption: 0.5, value: 120,
    tags: ["void", "crystal", "unstable"], usedIn: ["ritual:void_ascension"],
    synergy: { with: [ResourceType.ENTROPY_DUST, ResourceType.ABYSS_CORE], effect: "Resonates with entropy to breach reality." }
  },
  [ResourceType.ENTROPY_DUST]: {
    rarity: "uncommon", spawnWeight: 35, production: 0.9, consumption: 0.4, value: 35,
    tags: ["void", "entropy", "powder"], usedIn: ["ritual:entropy_surge"],
    synergy: { with: [ResourceType.VOID_CRYSTALS], effect: "Accelerates decay in stable systems." }
  },
  [ResourceType.ABYSS_CORE]: {
    rarity: "legendary", spawnWeight: 3, production: 0.05, consumption: 0.2, value: 300,
    tags: ["void", "core", "mythic"], usedIn: ["ritual:abyssal_awakening"],
    synergy: { with: [ResourceType.VOID_CRYSTALS], effect: "Heart of a dead star, pulsing with dark intent." }
  },
  [ResourceType.ASTRAL_BLOOM]: {
    rarity: "rare", spawnWeight: 18, production: 0.7, consumption: 0.5, value: 80,
    tags: ["astral", "organic"], usedIn: ["ritual:astral_bloom_rite"],
    synergy: { with: [ResourceType.STAR_POLLEN], effect: "Glows with the light of a thousand nebulae." }
  },
  [ResourceType.STAR_POLLEN]: {
    rarity: "uncommon", spawnWeight: 45, production: 1.1, consumption: 0.6, value: 15,
    tags: ["astral", "spore"], usedIn: ["astral_growth"],
    synergy: { with: [ResourceType.ASTRAL_BLOOM], effect: "Bio-luminescent drift that fuels astral expansion." }
  },
  [ResourceType.QUANTUM_FLUID]: {
    rarity: "rare", spawnWeight: 15, production: 0.5, consumption: 0.7, value: 100,
    tags: ["quantum", "liquid", "time"], usedIn: ["ritual:quantum_rewind"],
    synergy: { with: [ResourceType.CHRONO_SHARDS], effect: "A fluid that exists in multiple states simultaneously." }
  },
  [ResourceType.CHRONO_SHARDS]: {
    rarity: "rare", spawnWeight: 12, production: 0.4, consumption: 0.8, value: 90,
    tags: ["quantum", "time", "fragment"], usedIn: ["time_dilation"],
    synergy: { with: [ResourceType.QUANTUM_FLUID], effect: "Broken pieces of a clock that never existed." }
  },
  [ResourceType.PRISM_SHARDS]: {
    rarity: "uncommon", spawnWeight: 40, production: 0.8, consumption: 0.3, value: 25,
    tags: ["crystal", "refraction"], usedIn: ["hull_reinforcement"],
    synergy: { with: [ResourceType.VOID_CRYSTALS], effect: "Splits light into offensive frequency bands." }
  },
  [ResourceType.SWARM_CELLS]: {
    rarity: "rare", spawnWeight: 22, production: 1.2, consumption: 0.8, value: 50,
    tags: ["swarm", "biological"], usedIn: ["recursive_spawning"],
    synergy: { with: [ResourceType.BROOD_SPORES], effect: "Self-replicating units with hive-mind synchronization." }
  },
  [ResourceType.BROOD_SPORES]: {
    rarity: "uncommon", spawnWeight: 50, production: 1.5, consumption: 0.2, value: 12,
    tags: ["swarm", "biological"], usedIn: ["hatchery"],
    synergy: { with: [ResourceType.SWARM_CELLS], effect: "Small biological packets carrying the hive's DNA." }
  },
  [ResourceType.RECURSION_NODES]: {
    rarity: "epic", spawnWeight: 10, production: 0.2, consumption: 0.9, value: 150,
    tags: ["quantum", "digital", "loop"], usedIn: ["ai_overclocking"],
    synergy: { with: [ResourceType.QUANTUM_FLUID], effect: "Computational loops that never end, yet always resolve." }
  }
};

export const INITIAL_RESOURCES: Record<string, number> = {
  [ResourceType.STELLAR_DUST]: 100,
  [ResourceType.QUANTUM_FLUID]: 5,
  [ResourceType.VOID_CRYSTALS]: 2,
  [ResourceType.ASTRAL_BLOOM]: 1
};

export const PROFESSION_SPECIALIZATIONS: Record<string, { name: string, description: string, bonus: string }[]> = {
  'gatherer': [
    { name: 'Void Excavator', description: 'Maximum depth resource extraction.', bonus: '+25% Production' },
    { name: 'Matter Refiner', description: 'Extracts pure essence from dust.', bonus: '+15% Production, +5% Rarity Find' }
  ],
  'technician': [
    { name: 'Timeline Warden', description: 'Stabilizes local temporal drift.', bonus: '+25% Discovery' },
    { name: 'Neural Optimizer', description: 'Overclocks council bandwidth.', bonus: '+15% Discovery, +10% Global Yield' }
  ],
  'refiner': [
    { name: 'Aegis-Smith', description: 'Master of defensive plating.', bonus: '+25% Combat Defense' },
    { name: 'Prism Blade', description: 'Focuses energy into raw power.', bonus: '+25% Combat Power' }
  ],
  'ritualist': [
    { name: 'Void Whisperer', description: 'Deep connection to the Maw.', bonus: '+30% Ritual Efficiency' },
    { name: 'Bloom Weaver', description: 'Channels life through the fleet.', bonus: '+20% Fleet Health' }
  ],
  'crafter': [
    { name: 'Modular Architect', description: 'Builds versatile ship components.', bonus: '+20% Ship Efficiency' },
    { name: 'Relic Hunter', description: 'Restores ancient fractal tools.', bonus: '+10% All Stats' }
  ]
};

export const TALENT_TREE: Talent[] = [
  {
    id: 'fractal_root', name: 'Fractal Resonance', family: 'hybrid', tier: 1, 
    description: '+10% Dust from all sectors.', requires: [], position: { x: 50, y: 10 }, iconName: 'Hexagon',
    cost: [{ resource: ResourceType.STELLAR_DUST, amount: 500 }]
  },
  {
    id: 'void_t1', name: 'Void Extraction', family: 'void', tier: 2, 
    description: '+15% Void resource yields.', requires: ['fractal_root'], position: { x: 20, y: 30 }, iconName: 'ZapIcon',
    cost: [{ resource: ResourceType.VOID_CRYSTALS, amount: 5 }]
  },
  {
    id: 'void_t2', name: 'Shadow Siphon', family: 'void', tier: 3, 
    description: '+20% Combat Power in Void Biomes.', requires: ['void_t1'], position: { x: 10, y: 50 }, iconName: 'Sword',
    cost: [{ resource: ResourceType.VOID_CRYSTALS, amount: 25 }, { resource: ResourceType.ENTROPY_DUST, amount: 50 }]
  },
  {
    id: 'astral_t1', name: 'Gardens of Light', family: 'astral', tier: 2,
    description: '+20% Astral growth speed.', requires: ['fractal_root'], position: { x: 50, y: 35 }, iconName: 'Sprout',
    cost: [{ resource: ResourceType.ASTRAL_BLOOM, amount: 5 }]
  },
  {
    id: 'astral_t2', name: 'Nebula Weaving', family: 'astral', tier: 3,
    description: '+25% Dust yield from Astral sectors.', requires: ['astral_t1'], position: { x: 50, y: 60 }, iconName: 'Wind',
    cost: [{ resource: ResourceType.ASTRAL_BLOOM, amount: 50 }]
  },
  {
    id: 'quantum_t1', name: 'Temporal Drift', family: 'quantum', tier: 2,
    description: '+15% Discovery Progress speed.', requires: ['fractal_root'], position: { x: 80, y: 30 }, iconName: 'Timer',
    cost: [{ resource: ResourceType.QUANTUM_FLUID, amount: 10 }]
  },
  {
    id: 'quantum_t2', name: 'Parallel Logic', family: 'quantum', tier: 3,
    description: 'Specialists gain XP 25% faster.', requires: ['quantum_t1'], position: { x: 90, y: 50 }, iconName: 'ChipIcon',
    cost: [{ resource: ResourceType.QUANTUM_FLUID, amount: 50 }, { resource: ResourceType.RECURSION_NODES, amount: 5 }]
  }
];

export const FORMATIONS: Formation[] = [
  { id: 'NEUTRAL', name: 'Standard Orbit', description: 'Balanced energy distribution.', powerMult: 1, defenseMult: 1, speedMult: 1 },
  { id: 'VANGUARD', name: 'Attack Vanguard', description: 'Max weapons array.', powerMult: 1.5, defenseMult: 0.7, speedMult: 1 },
  { id: 'AEGIS', name: 'Defense Grid', description: 'Shield harmonics focus.', powerMult: 0.6, defenseMult: 1.8, speedMult: 0.8 },
  { id: 'RECON', name: 'Swift Recon', description: 'Warp jump optimization.', powerMult: 0.8, defenseMult: 0.8, speedMult: 1.6 }
];

export const RITUALS: Ritual[] = [
  { 
    id: 'void_ascension', 
    name: 'Void Ascension', 
    category: 'VOID', 
    cost: [{ resource: ResourceType.VOID_CRYSTALS, amount: 10 }], 
    description: '+50% Discovery Speed for 5 minutes.',
    duration: 300,
    bonus: { type: 'discovery', value: 0.5 }
  },
  { 
    id: 'astral_bloom_rite', 
    name: 'Astral Bloom Rite', 
    category: 'ASTRAL', 
    cost: [{ resource: ResourceType.ASTRAL_BLOOM, amount: 20 }], 
    description: '+25% Dust production for 5 minutes.',
    duration: 300,
    bonus: { type: 'production', value: 0.25 }
  },
  { 
    id: 'quantum_rewind', 
    name: 'Quantum Rewind', 
    category: 'QUANTUM', 
    cost: [{ resource: ResourceType.QUANTUM_FLUID, amount: 15 }], 
    description: 'Instant +2000 Dust.',
    duration: 0,
    bonus: { type: 'instant_dust', value: 2000 }
  }
];

export const FLEET_UPGRADES = [
  { 
    id: 'laser_battery', 
    name: 'Laser Battery', 
    icon: Target, 
    cost: [{ resource: ResourceType.STELLAR_DUST, amount: 10 }, { resource: ResourceType.VOID_CRYSTALS, amount: 1 }], 
    bonus: '+10% Combat Power' 
  },
  { 
    id: 'hull_plating', 
    name: 'Reinforced Hull', 
    icon: Shield, 
    cost: [{ resource: ResourceType.STELLAR_DUST, amount: 20 }, { resource: ResourceType.PRISM_SHARDS, amount: 5 }], 
    bonus: '+10% Fleet Defense' 
  },
  { 
    id: 'plasma_thrusters', 
    name: 'Plasma Thrusters', 
    icon: Rocket, 
    cost: [{ resource: ResourceType.STELLAR_DUST, amount: 30 }, { resource: ResourceType.QUANTUM_FLUID, amount: 2 }], 
    bonus: '+10% Discovery Speed' 
  }
];

export const BIOMES = ['Neon Void', 'Astral Bloom', 'Quantum Shard', 'Shattered Swarm', 'Crystal Bastion'];
export const GALAXY_DATA = { baseGalaxyCount: 20, maxSize: 100, maxDensity: 1, maxAnomalies: 4, maxRoutes: 3, discoverySpeed: 0.02 };
