import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ResourceType, GameState, Galaxy, Ritual, FormationId, Profession, ResourceMetadata, Talent, GameClass, UnlockCriteria, CombatLogEntry } from './types';
import { INITIAL_RESOURCES, GALAXY_DATA, RITUALS, BIOMES, FORMATIONS, RESOURCE_METADATA, TALENT_TREE, PROFESSION_SPECIALIZATIONS, FLEET_UPGRADES } from './constants';
import { initGalaxyData, getClasses, getProfessionTemplates } from './galaxyProfessions';
import { mulberry32, formatNumber } from './engine/utils';
import { generateNarrative } from './services/geminiService';
import { 
  Zap, Globe, Cpu, Shield, Crosshair, Activity, Database, Wind, Layers, ArrowRight, Target, Sword, ShieldCheck, 
  Rocket, Skull, Trophy, ChevronRight, Hexagon, Radar, Box, Package, Sparkles, Search, UserCheck, Users, 
  Briefcase, Wrench, AlertTriangle, ToggleLeft, ToggleRight, Flame, TrendingUp, Info, Link2, ZapOff, Dna,
  Workflow, GitBranch, Star, Plus, Unlock, Medal, GraduationCap, Microscope, Award, Fingerprint, Timer, Zap as ZapIcon,
  Hammer, Cog, Cpu as ChipIcon, Beaker, Sprout, Star as StarIcon, Heart, BookOpen, Layers as LayersIcon,
  TrendingDown, Scale, Coins, Network, MessageSquare, BatteryCharging, Power, Lock, History, X, UserPlus, Zap as EnergyIcon,
  Star as StarFull, BarChart3, Fingerprint as FingerprintIcon, BrainCircuit, GraduationCap as TrainingIcon,
  ClipboardCheck, HardHat, Pickaxe, Radio, Map as MapIcon, Crosshair as CrosshairIcon, Satellite, Telescope,
  Ghost, Sparkle, Wind as WindIcon, Command, Settings, Briefcase as RolesIcon, ChevronUp, ZapIcon as PowerIcon,
  TrendingUp as DeltaUp, TrendingDown as DeltaDown, Timer as Clock, BarChart4
} from 'lucide-react';

const Icons: Record<string, any> = {
  Hexagon, ZapIcon, Sword, Sprout, Wind, Timer, ChipIcon, StarIcon, Shield, LayersIcon
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    resources: { ...INITIAL_RESOURCES },
    inventory: {},
    galaxies: [],
    seed: Math.floor(Math.random() * 999999),
    discoveryProgress: 0,
    activeTab: 'map',
    fleet: { 
      power: 10, defense: 5, speed: 2, ships: 1, activeFormation: 'NEUTRAL', specialistSlots: [null, null, null],
      autoRepairEnabled: false, isDamaged: false
    },
    ownedSpecialists: [],
    availableSpecialists: [],
    activeSynergies: [],
    combatLogs: [],
    logs: ['AI System Engaged.', 'Establishing link to the Fractal Council.'],
    metaLevel: 1,
    metaXp: 0,
    metaMaxXp: 1000,
    unlockedRituals: [],
    activeRitualId: null,
    ritualTimer: 0,
    fleetUpgrades: {},
    unlockedTalents: [],
    unlockedRoles: ['gatherer', 'technician'],
    milestones: {
      totalVictories: 0,
      totalDustEarned: 0,
      galaxiesDiscovered: 1,
      unlockedMilestoneTraits: [],
    }
  });

  const [classes, setClasses] = useState<GameClass[]>([]);
  const [aiNarrative, setAiNarrative] = useState<string>("Scanning deep space frequencies...");
  const [selectedGalaxy, setSelectedGalaxy] = useState<Galaxy | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | null>(null);
  const [slotToAssign, setSlotToAssign] = useState<number | null>(null);
  const [showCommandStats, setShowCommandStats] = useState<boolean>(false);
  
  const [combatBoostTimer, setCombatBoostTimer] = useState<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  const logDebounce = useRef<boolean>(false);

  // Real-time delta tracking for expert manifest
  const [resourceDeltas, setResourceDeltas] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadData() {
      await initGalaxyData();
      const loadedClasses = getClasses();
      setClasses(loadedClasses);

      if (state.galaxies.length === 0) {
        const rng = mulberry32(state.seed);
        const initialGalaxies: Galaxy[] = Array.from({ length: GALAXY_DATA.baseGalaxyCount }).map((_, i) => {
          const angle = i * 0.8;
          const radius = 10 + (i * 4);
          const x = 50 + Math.cos(angle) * radius * 0.8;
          const y = 50 + Math.sin(angle) * radius * 0.8;
          
          return {
            id: `galaxy_${i}`,
            name: `${BIOMES[Math.floor(rng() * BIOMES.length)]} Sector ${i + 1}`,
            size: 15 + rng() * 85,
            density: 0.2 + rng() * 0.8,
            anomalies: Math.floor(rng() * 5),
            threatLevel: 1 + Math.floor(i * 2),
            isEncounterCleared: false,
            routes: [],
            discovered: i === 0,
            biome: BIOMES[Math.floor(rng() * BIOMES.length)],
            coords: { x, y }
          };
        });

        setState(prev => ({ ...prev, galaxies: initialGalaxies }));
      }
    }
    loadData();
  }, []);

  const addMetaXp = useCallback((amount: number) => {
    setState(prev => {
      let nextXp = prev.metaXp + amount;
      let nextLevel = prev.metaLevel;
      let nextMaxXp = prev.metaMaxXp;
      const logs = [...prev.logs];
      while (nextXp >= nextMaxXp) {
        nextXp -= nextMaxXp;
        nextLevel += 1;
        nextMaxXp = Math.floor(nextMaxXp * 1.5);
        logs.unshift(`[COMMAND] Rank Achieved: ${nextLevel}. Fractal throughput enhanced.`);
      }
      return { ...prev, metaLevel: nextLevel, metaXp: nextXp, metaMaxXp: nextMaxXp, logs: logs.slice(0, 50) };
    });
  }, []);

  const getMultipliers = useMemo(() => {
    let prod = 1.0;
    let combat = 1.0;
    let speed = 1.0;

    state.activeSynergies.forEach(syn => {
      if (syn.includes('void')) prod += 0.15;
      if (syn.includes('astral')) prod += 0.15;
      if (syn.includes('quantum')) speed += 0.15;
      if (syn.includes('crystal')) combat += 0.15;
    });

    state.unlockedTalents.forEach(tId => {
      if (tId === 'fractal_root') prod += 0.1;
      if (tId.includes('void')) prod += 0.1;
      if (tId.includes('quantum')) speed += 0.15;
    });

    state.fleet.specialistSlots.forEach(slot => {
      if (!slot) return;
      const val = (slot.bonusValue - 1) + (slot.level * 0.05);
      if (slot.bonusType === 'production') prod += val;
      if (slot.bonusType === 'combat') combat += val;
      if (slot.bonusType === 'discovery') speed += val;
      if (slot.specialization) { prod += 0.1; combat += 0.1; }
    });

    if (state.activeRitualId) {
      const ritual = RITUALS.find(r => r.id === state.activeRitualId);
      if (ritual) {
        if (ritual.bonus.type === 'discovery') speed += ritual.bonus.value;
        if (ritual.bonus.type === 'production') prod += ritual.bonus.value;
      }
    }

    (Object.entries(state.fleetUpgrades) as [string, number][]).forEach(([id, level]) => {
      if (id === 'hull_plating') combat += level * 0.1;
      if (id === 'plasma_thrusters') speed += level * 0.1;
      if (id === 'laser_battery') combat += level * 0.1;
    });

    if (combatBoostTimer > 0) combat *= 1.5;
    return { prod, combat, speed };
  }, [state.activeSynergies, state.unlockedTalents, state.fleet.specialistSlots, state.activeRitualId, state.fleetUpgrades, combatBoostTimer]);

  const effectiveFleet = useMemo(() => {
    const formation = FORMATIONS.find(f => f.id === state.fleet.activeFormation) || FORMATIONS[0];
    const { combat, speed } = getMultipliers;
    return {
      power: state.fleet.power * formation.powerMult * combat,
      defense: state.fleet.defense * formation.defenseMult * combat,
      speed: state.fleet.speed * formation.speedMult * speed
    };
  }, [state.fleet, getMultipliers]);

  const isProfessionUnlocked = useCallback((p: any) => {
    if (!p.unlockCriteria) return true;
    const { metaLevel, victories, galaxies, resources } = p.unlockCriteria;
    if (metaLevel !== undefined && state.metaLevel < metaLevel) return false;
    if (victories !== undefined && state.milestones.totalVictories < victories) return false;
    if (galaxies !== undefined && state.milestones.galaxiesDiscovered < galaxies) return false;
    if (resources !== undefined) {
      for (const req of resources) {
        if ((state.resources[req.resource] || 0) < req.amount) return false;
      }
    }
    return true;
  }, [state.metaLevel, state.milestones, state.resources]);

  const hireSpecialist = (p: any) => {
    const cost = 250;
    if (state.resources[ResourceType.STELLAR_DUST] >= cost && isProfessionUnlocked(p)) {
      const rng = mulberry32(state.seed + state.ownedSpecialists.length);
      const traits = [
        "Precise: +5% Production efficiency."
      ];

      const newS: Profession = { 
        ...p, 
        id: `spec_${Date.now()}_${Math.random()}`, 
        level: 1, 
        xp: 0, 
        maxXp: 120, 
        traits: traits
      };
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, [ResourceType.STELLAR_DUST]: prev.resources[ResourceType.STELLAR_DUST] - cost },
        ownedSpecialists: [...prev.ownedSpecialists, newS],
        logs: [`[RECRUITMENT] Specialist ${p.name} assigned to Command Hub.`, ...prev.logs].slice(0, 20)
      }));
    }
  };

  const trainSpecialist = (specialistId: string) => {
    const cost = 150;
    if (state.resources[ResourceType.STELLAR_DUST] >= cost) {
      setState(prev => {
        const nextResources = { ...prev.resources, [ResourceType.STELLAR_DUST]: prev.resources[ResourceType.STELLAR_DUST] - cost };
        const nextSpecialists = prev.ownedSpecialists.map(s => {
          if (s.id === specialistId) {
            let nextXp = s.xp + 40;
            let nextLevel = s.level;
            let nextMaxXp = s.maxXp;
            if (nextXp >= nextMaxXp) {
              nextXp -= nextMaxXp;
              nextLevel += 1;
              nextMaxXp = Math.floor(nextMaxXp * 1.3);
            }
            return { ...s, xp: nextXp, level: nextLevel, maxXp: nextMaxXp };
          }
          return s;
        });
        return {
          ...prev,
          resources: nextResources,
          ownedSpecialists: nextSpecialists
        };
      });
    }
  };

  const buyFleetUpgrade = (upgrade: any) => {
    const canAfford = upgrade.cost.every((c: any) => (state.resources[c.resource] || 0) >= c.amount);
    if (canAfford) {
      setState(prev => {
        const nextResources = { ...prev.resources };
        upgrade.cost.forEach((c: any) => {
          nextResources[c.resource] -= c.amount;
        });
        const currentLevel = prev.fleetUpgrades[upgrade.id] || 0;
        return {
          ...prev,
          resources: nextResources,
          fleetUpgrades: {
            ...prev.fleetUpgrades,
            [upgrade.id]: currentLevel + 1
          },
          logs: [`[UPGRADE] ${upgrade.name} enhanced to Rank ${currentLevel + 1}.`, ...prev.logs].slice(0, 20)
        };
      });
      addMetaXp(100);
    }
  };

  const toggleAutoRepair = () => {
    setState(prev => ({
      ...prev,
      fleet: { ...prev.fleet, autoRepairEnabled: !prev.fleet.autoRepairEnabled }
    }));
  };

  const assignSpecialistToSlot = (specialist: Profession, slotIndex: number) => {
    setState(prev => {
      const newSlots = [...prev.fleet.specialistSlots];
      newSlots[slotIndex] = specialist;
      return {
        ...prev,
        fleet: { ...prev.fleet, specialistSlots: newSlots },
        logs: [`[FLEET] Specialist ${specialist.name} deployed to Node ${slotIndex + 1}.`, ...prev.logs].slice(0, 20)
      };
    });
  };

  const unassignSpecialistFromSlot = (slotIndex: number) => {
    setState(prev => {
      const newSlots = [...prev.fleet.specialistSlots];
      newSlots[slotIndex] = null;
      return {
        ...prev,
        fleet: { ...prev.fleet, specialistSlots: newSlots }
      };
    });
  };

  const resolveCombat = useCallback((galaxy: Galaxy) => {
    const winChance = Math.min(0.95, Math.max(0.1, (effectiveFleet.power + effectiveFleet.defense) / (effectiveFleet.power + effectiveFleet.defense + galaxy.threatLevel)));
    const isSuccess = Math.random() < winChance;
    
    if (isSuccess) {
      const dustReward = Math.floor(galaxy.size * 20);
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, [ResourceType.STELLAR_DUST]: prev.resources[ResourceType.STELLAR_DUST] + dustReward },
        galaxies: prev.galaxies.map(g => g.id === galaxy.id ? { ...g, isEncounterCleared: true } : g),
        milestones: { ...prev.milestones, totalVictories: prev.milestones.totalVictories + 1 },
        logs: [`[SUCCESS] Sector ${galaxy.name} secured. Harvesting +${dustReward} Dust.`, ...prev.logs].slice(0, 20)
      }));
      addMetaXp(100 + galaxy.threatLevel * 50);
    } else {
      setState(prev => ({
        ...prev,
        fleet: { ...prev.fleet, isDamaged: !prev.fleet.autoRepairEnabled },
        logs: [`[FAILED] Strategic breach failed in ${galaxy.name}. Fleet retreated.`, ...prev.logs].slice(0, 20)
      }));
    }
  }, [effectiveFleet, addMetaXp]);

  // Game Loop
  useEffect(() => {
    const ticker = setInterval(() => {
      const delta = (Date.now() - lastTickRef.current) / 1000;
      lastTickRef.current = Date.now();

      setState(prev => {
        const { prod, speed } = getMultipliers;
        const activeCount = prev.galaxies.filter(g => g.discovered).length;
        
        const dustYield = (activeCount * 2.5 * prod) * delta;
        const crystalYield = (prev.milestones.totalVictories * 0.05 * prod) * delta;

        setResourceDeltas({
          [ResourceType.STELLAR_DUST]: dustYield / delta,
          [ResourceType.VOID_CRYSTALS]: crystalYield / delta,
        });

        const nextResources = {
          ...prev.resources,
          [ResourceType.STELLAR_DUST]: (prev.resources[ResourceType.STELLAR_DUST] || 0) + dustYield,
          [ResourceType.VOID_CRYSTALS]: (prev.resources[ResourceType.VOID_CRYSTALS] || 0) + crystalYield,
        };

        const discRate = GALAXY_DATA.discoverySpeed * speed * delta;
        let nextDiscovery = prev.discoveryProgress + discRate;
        const newGalaxies = [...prev.galaxies];
        if (nextDiscovery >= 1) {
          const nextIdx = newGalaxies.findIndex(g => !g.discovered);
          if (nextIdx !== -1) {
            newGalaxies[nextIdx].discovered = true;
            nextDiscovery = 0;
            prev.logs.unshift(`[SIGNAL] New Sector Located: ${newGalaxies[nextIdx].name}`);
          }
        }

        return {
          ...prev,
          resources: nextResources,
          discoveryProgress: nextDiscovery,
          galaxies: newGalaxies,
          logs: prev.logs.slice(0, 50)
        };
      });
    }, 100);
    return () => clearInterval(ticker);
  }, [getMultipliers]);

  const selectedSpecialist = useMemo(() => {
    return state.ownedSpecialists.find(s => s.id === selectedSpecialistId);
  }, [state.ownedSpecialists, selectedSpecialistId]);

  return (
    <div className="flex h-screen w-screen bg-[#02040a] relative overflow-hidden text-slate-200">
      <div className="scanline" />

      {/* Nav Sidebar */}
      <div className="w-80 border-r border-white/5 flex flex-col glass-panel z-50">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 group cursor-help">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 group-hover:rotate-45 transition-transform">
              <Hexagon className="text-cyan-400 animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="font-orbitron text-lg font-black tracking-widest uppercase">Fractal</h1>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">Matrix v2.5.1-Core</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'map', icon: MapIcon, label: 'Star Chart', color: 'text-cyan-400' },
            { id: 'professions', icon: Users, label: 'Personnel', color: 'text-amber-400' },
            { id: 'rituals', icon: Ghost, label: 'Sanctum', color: 'text-purple-400' },
            { id: 'talents', icon: Network, label: 'Neural Link', color: 'text-indigo-400' },
            { id: 'manifest', icon: BarChart4, label: 'Manifest', color: 'text-emerald-400' },
            { id: 'council', icon: Settings, label: 'Fleet Matrix', color: 'text-rose-400' },
            { id: 'shipyard', icon: Command, label: 'Shipyard', color: 'text-blue-400' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setState(s => ({ ...s, activeTab: tab.id }))}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${state.activeTab === tab.id ? 'bg-white/5 border-white/10 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
              <tab.icon size={18} className={state.activeTab === tab.id ? tab.color : 'text-slate-600'} />
              <span className="font-bold text-xs uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
        <header className="h-20 border-b border-white/5 glass-panel flex items-center px-10 justify-between">
          <div className="flex gap-8">
            {[
              { id: ResourceType.STELLAR_DUST, icon: Zap, label: 'Dust', color: 'text-amber-400' },
              { id: ResourceType.VOID_CRYSTALS, icon: Layers, label: 'Crystals', color: 'text-purple-400' }
            ].map(res => (
              <div key={res.id} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${res.color}`}><res.icon size={16}/></div>
                <div>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{res.label}</p>
                  <p className="text-sm font-orbitron text-white">{formatNumber(state.resources[res.id] || 0)}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowCommandStats(true)} className="flex items-center gap-4 text-right group">
            <div className="flex-1">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Command Rank</p>
              <p className="text-[10px] font-orbitron text-amber-500">M.LVL {state.metaLevel}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center font-black text-amber-500">
              {state.metaLevel}
            </div>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {/* MAP TAB */}
          {state.activeTab === 'map' && (
            <div className="h-full relative bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden">
              {state.galaxies.map(g => (
                <button key={g.id} onClick={() => g.discovered && setSelectedGalaxy(g)}
                  style={{ left: `${g.coords.x}%`, top: `${g.coords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${g.discovered ? (g.isEncounterCleared ? 'bg-cyan-500/20 border-cyan-500 shadow-glow' : 'bg-red-500/20 border-red-500 animate-pulse') : 'bg-slate-900 border-slate-800 opacity-20'}`}>
                  {g.discovered ? (g.isEncounterCleared ? <Globe size={14}/> : <Skull size={14}/>) : <Lock size={10}/>}
                </button>
              ))}
            </div>
          )}

          {/* PERSONNEL TAB */}
          {state.activeTab === 'professions' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.ownedSpecialists.map(s => (
                  <div key={s.id} onClick={() => setSelectedSpecialistId(s.id)}
                    className="glass-panel p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${s.avatarColor} flex items-center justify-center font-bold text-lg`}>{s.name[0]}</div>
                      <div>
                        <h4 className="font-bold text-white">{s.name}</h4>
                        <p className="text-[10px] text-amber-500 font-black uppercase">{s.role} Rank {s.level}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-12">
                <h3 className="text-xl font-orbitron font-black text-white uppercase mb-8 flex items-center gap-4"><Microscope/> Recruitment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {getProfessionTemplates().map(p => {
                    const unlocked = isProfessionUnlocked(p);
                    return (
                      <div key={p.id} onClick={() => unlocked && hireSpecialist(p)}
                        className={`glass-panel p-6 rounded-[2rem] border transition-all flex flex-col ${unlocked ? 'border-white/10 hover:border-cyan-500/50 cursor-pointer' : 'opacity-40 grayscale grayscale-100 cursor-not-allowed'}`}>
                        <div className={`w-12 h-12 rounded-xl ${p.avatarColor} mb-4 flex items-center justify-center font-bold`}>{p.name[0]}</div>
                        <h4 className="font-bold text-white mb-1">{p.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase mb-4">{p.role}</p>
                        
                        {unlocked && (
                          <div className="space-y-2 mb-6">
                            <p className="text-[9px] font-black uppercase text-slate-400">Tactical Gear:</p>
                            <div className="flex flex-wrap gap-1">
                              {p.tools.map(t => (
                                <span key={t} className="px-2 py-0.5 bg-black/40 rounded text-[8px] text-slate-500 border border-white/5">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-amber-500">250 Dust</span>
                          <ChevronRight size={14}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SHIPYARD TAB */}
          {state.activeTab === 'shipyard' && (
             <div className="space-y-8">
                <h2 className="text-3xl font-orbitron font-black text-white uppercase">Fleet Engineering</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {FLEET_UPGRADES.map(upgrade => {
                      const level = state.fleetUpgrades[upgrade.id] || 0;
                      const canAfford = upgrade.cost.every(c => (state.resources[c.resource] || 0) >= c.amount);
                      return (
                         <div key={upgrade.id} className="glass-panel p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                               <upgrade.icon size={28}/>
                            </div>
                            <div className="flex-1">
                               <h4 className="font-bold text-white">{upgrade.name}</h4>
                               <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Rank {level}</p>
                               <p className="text-xs text-slate-500">{upgrade.bonus}</p>
                            </div>
                            <button onClick={() => buyFleetUpgrade(upgrade)} disabled={!canAfford} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase ${canAfford ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}>Upgrade</button>
                         </div>
                      );
                   })}
                </div>
             </div>
          )}
        </main>
      </div>

      {/* SPECIALIST DOSSIER MODAL */}
      {selectedSpecialist && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-12 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-4xl w-full glass-panel rounded-[4rem] border border-amber-500/20 overflow-hidden flex h-[70vh]">
            <div className="w-80 border-r border-white/5 bg-black/40 p-10 flex flex-col items-center">
              <div className={`w-32 h-32 rounded-[2rem] ${selectedSpecialist.avatarColor} flex items-center justify-center font-orbitron text-4xl font-black mb-8`}>{selectedSpecialist.name[0]}</div>
              <h3 className="text-2xl font-orbitron font-black text-white text-center mb-2">{selectedSpecialist.name}</h3>
              <p className="text-[10px] text-amber-500 font-black uppercase text-center mb-auto">{selectedSpecialist.role} Rank {selectedSpecialist.level}</p>
              <button onClick={() => setSelectedSpecialistId(null)} className="w-full py-4 bg-white/5 text-slate-500 rounded-2xl hover:text-white transition-all uppercase text-[10px] font-black">Close File</button>
            </div>
            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="space-y-6">
                  <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-4">Tactical Equipment <div className="h-px flex-1 bg-white/5"/></h4>
                  <div className="space-y-3">
                    {selectedSpecialist.tools.map((tool, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Wrench size={16}/></div>
                        <span className="text-xs font-bold text-slate-300">{tool}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="space-y-6">
                  <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-4">Operational Skills <div className="h-px flex-1 bg-white/5"/></h4>
                  <div className="space-y-3">
                    {selectedSpecialist.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <ChevronUp size={16} className="text-emerald-500"/>
                        <span className="text-xs font-bold text-slate-300">{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALAXY DIALOG */}
      {selectedGalaxy && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-12 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="max-w-2xl w-full glass-panel rounded-[4rem] border border-cyan-500/30 overflow-hidden">
              <div className="p-12 text-center space-y-8">
                 <h2 className="text-5xl font-orbitron font-black text-white uppercase">{selectedGalaxy.name}</h2>
                 <p className="text-slate-400">Sector analysis suggests presence of significant resources. Threat level: {selectedGalaxy.threatLevel}.</p>
                 <div className="flex gap-4">
                    <button onClick={() => { resolveCombat(selectedGalaxy); setSelectedGalaxy(null); }} className="flex-1 py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-red-500 transition-all">Engage Breach</button>
                    <button onClick={() => setSelectedGalaxy(null)} className="flex-1 py-6 bg-white/5 text-slate-500 rounded-3xl font-black uppercase tracking-widest hover:text-white transition-all">Recall Array</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;