
export enum ResourceType {
  STELLAR_DUST = 'stellar_dust',
  QUANTUM_FLUID = 'quantum_fluid',
  VOID_CRYSTALS = 'void_crystals',
  ASTRAL_BLOOM = 'astral_bloom',
  ENTROPY_DUST = 'entropy_dust',
  ABYSS_CORE = 'abyss_core',
  STAR_POLLEN = 'star_pollen',
  HARMONY_SEED = 'harmony_seed',
  PARADOX_DUST = 'paradox_dust',
  CHRONO_SHARDS = 'chrono_shards',
  PRISM_SHARDS = 'prism_shards',
  CRYSTAL_ORE = 'crystal_ore',
  RESONANCE_STONE = 'resonance_stone',
  SWARM_CELLS = 'swarm_cells',
  BROOD_SPORES = 'brood_spores',
  HIVE_RESIN = 'hive_resin',
  LIFE_FLUID = 'life_fluid',
  BIO_WOOD = 'bio_wood',
  BLOOM_FIBERS = 'bloom_fibers',
  RECURSION_NODES = 'recursion_nodes',
  FRACTAL_SAP = 'fractal_sap',
  MOTHER_CELLS = 'mother_cells'
}

export type ResourceFamily = 'void' | 'astral' | 'quantum' | 'crystal' | 'swarm' | 'organic' | 'hybrid';

export interface ResourceMetadata {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'cosmic';
  spawnWeight: number;
  production: number;
  consumption: number;
  value: number;
  tags: string[];
  usedIn: string[];
  synergy: {
    with: string[];
    effect: string;
  };
}

export interface UnlockCriteria {
  metaLevel?: number;
  victories?: number;
  galaxies?: number;
  resources?: { resource: ResourceType; amount: number }[];
}

export interface Talent {
  id: string;
  name: string;
  family: ResourceFamily;
  tier: number;
  description: string;
  cost: { resource: ResourceType; amount: number }[];
  requires: string[];
  position: { x: number; y: number };
  iconName: string;
}

export interface Profession {
  id: string;
  name: string;
  family: ResourceFamily;
  role: 'gatherer' | 'refiner' | 'crafter' | 'ritualist' | 'technician';
  specialization?: string;
  level: number;
  xp: number;
  maxXp: number;
  bonusType: 'production' | 'combat' | 'discovery' | 'utility';
  bonusValue: number;
  avatarColor: string;
  traits: string[];
  skills: string[];
  tools: string[];
  affinities: ResourceType[];
  modules: string[];
  unlockCriteria?: UnlockCriteria;
}

export interface GameClass {
  id: string;
  label: string;
  archetype: string;
  primaryFamily: ResourceFamily;
  allowedProfessions: string[];
  bonuses: {
    production: number;
    combat: number;
    discovery: number;
  };
  ultimatePerk: {
    name: string;
    description: string;
  };
}

export type FormationId = 'NEUTRAL' | 'VANGUARD' | 'AEGIS' | 'RECON';

export interface Formation {
  id: FormationId;
  name: string;
  description: string;
  powerMult: number;
  defenseMult: number;
  speedMult: number;
}

export interface Galaxy {
  id: string;
  name: string;
  size: number;
  density: number;
  anomalies: number;
  threatLevel: number;
  isEncounterCleared: boolean;
  routes: { to: string; weight: number }[];
  discovered: boolean;
  biome: string;
  flavorResources?: ResourceType[];
  coords: { x: number; y: number };
}

export interface Fleet {
  power: number;
  defense: number;
  speed: number;
  ships: number;
  activeFormation: FormationId;
  specialistSlots: (Profession | null)[];
  autoRepairEnabled: boolean;
  isDamaged: boolean;
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  galaxyName: string;
  threatLevel: number;
  fleetPower: number;
  fleetDefense: number;
  result: 'victory' | 'defeat';
  rewardDust?: number;
  winChance: number;
}

export interface GameState {
  resources: Record<string, number>;
  inventory: Record<string, number>;
  galaxies: Galaxy[];
  seed: number;
  discoveryProgress: number;
  activeTab: string;
  fleet: Fleet;
  unlockedTalents: string[];
  unlockedRoles: string[];
  ownedSpecialists: Profession[];
  availableSpecialists: Profession[];
  activeSynergies: string[];
  combatLogs: CombatLogEntry[];
  selectedClassId?: string;
  logs: string[];
  metaLevel: number;
  metaXp: number;
  metaMaxXp: number;
  unlockedRituals: string[];
  activeRitualId: string | null;
  ritualTimer: number;
  fleetUpgrades: Record<string, number>;
  milestones: {
    totalVictories: number;
    totalDustEarned: number;
    galaxiesDiscovered: number;
    unlockedMilestoneTraits: string[];
  };
}

export interface Ritual {
  id: string;
  name: string;
  category: 'VOID' | 'ASTRAL' | 'QUANTUM' | 'SWARM' | 'CRYSTAL';
  cost: { resource: ResourceType; amount: number }[];
  description: string;
  duration: number;
  bonus: { type: string; value: number };
}
