// ═══════════════════════════════════════════════════════════
//  GAME DATA
// ═══════════════════════════════════════════════════════════

const UI_COLORS = {
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.1)',
  success: '#4ade80',
  successBg: 'rgba(74,222,128,0.1)',
  fail: '#f87171',
  info: '#60a5fa',
  warning: '#facc15',
  gray: '#9ca3af',
  accent: '#e8c84a',
  blue: '#4a90e8'
};

const CATEGORIES = ['Karting', 'F4', 'Formula Regional', 'F3', 'F2', 'F1'];

// [3_stars, 4_stars, 5_stars] for each junior category (0: Karting, 1: F4, 2: FR, 3: F3, 4: F2)
const SEAT_COSTS = [
  [65000, 75000, 90000],        // Karting
  [100000, 125000, 150000],     // F4
  [200000, 250000, 300000],     // FR
  [400000, 500000, 600000],     // F3
  [800000, 1000000, 1200000],   // F2
];

function getSeatCost(catIdx, teamStars, hasAcademy) {
  if (catIdx >= 5) return 0; // F1 is free (paid via salary instead)
  const si = clamp((teamStars || 3) - 3, 0, 2);
  const baseCost = (SEAT_COSTS[catIdx] || SEAT_COSTS[4])[si];
  const discount = hasAcademy ? 0.5 : 1.0;
  return Math.round(baseCost * discount);
}

function getTeamRequirements(stars, catIndex) {
  const baseRep = [0, 100, 250, 400, 700, 1200][catIndex] || 1200;
  const baseOvr = [40, 45, 50, 55, 65, 75][catIndex] || 75;
  const repStep = [40, 80, 100, 150, 200, 200][catIndex] || 200;
  const ovrStep = [3, 4, 4, 5, 5, 5][catIndex] || 5;
  
  const agentModOvr = G.upgrades.includes('agent') ? -2 : 0;
  const agentModRep = G.upgrades.includes('agent') ? 0.9 : 1;
  const academyModOvr = G.academy ? -3 : 0;
  const academyModRep = G.academy ? 0.8 : 1;

  if (stars === 5) return { rep: (baseRep + repStep * 2) * agentModRep * academyModRep, ovr: baseOvr + ovrStep * 2 + agentModOvr + academyModOvr };
  if (stars === 4) return { rep: (baseRep + repStep) * agentModRep * academyModRep, ovr: baseOvr + ovrStep + agentModOvr + academyModOvr };
  if (stars === 3) return { rep: baseRep * agentModRep * academyModRep, ovr: baseOvr + agentModOvr + academyModOvr };
  if (stars === 2) return { rep: Math.max(0, baseRep - repStep) * agentModRep * academyModRep, ovr: Math.max(0, baseOvr - ovrStep) + agentModOvr + academyModOvr };
  return { rep: Math.max(0, baseRep - repStep * 2) * agentModRep * academyModRep, ovr: Math.max(0, baseOvr - ovrStep * 2) + agentModOvr + academyModOvr };
}

function generateOfferPool(cat, ovr, allTeams) {
  if (G.blacklistedTeams && G.blacklistedTeams.length) {
    allTeams = allTeams.filter(t => !G.blacklistedTeams.includes(t.name));
  }

  let offerPool = allTeams.filter(t => {
    if (G.academyPromisedTeam === t.name) return true;
    if (G._nemesisSeatTarget === t.name) return true;

    if (cat === 'F1') {
      const allBans = [...(G.academyBans || []), ...(G.academyTempBans || [])];
      if (allBans.length > 0) {
        for (const banId of allBans) {
          const bannedAc = ACADEMIES.find(a => a.id === banId);
          if (bannedAc && bannedAc.f1Teams.includes(t.name)) return false;
        }
      }
    }
    const reqs = getTeamRequirements(t.stars, G.catIndex);
    return G.reputation >= reqs.rep && ovr >= reqs.ovr;
  });

  if (offerPool.length === 0) {
    const minStars = Math.min(...allTeams.map(t => t.stars));
    offerPool = allTeams.filter(t => t.stars === minStars);
  }

  let isLockedShadowMarket = false;
  if (cat === 'F1' && G._shadowSecretTeam) {
    const secretTeam = TEAMS['F1'].find(t => t.name === G._shadowSecretTeam);
    if (secretTeam) {
      offerPool = [secretTeam];
      isLockedShadowMarket = true;
    }
  }

  let isAcademyLocked = false;
  if (!isLockedShadowMarket && cat === 'F1' && G.academy) {
    const academy = ACADEMIES.find(a => a.id === G.academy);
    if (academy) {
      offerPool = offerPool.filter(t => academy.f1Teams.includes(t.name));
      isAcademyLocked = true;
    }
  }

  const wasInF1 = G.lastResult && G.lastResult.cat === 'F1';
  if (!isLockedShadowMarket && cat === 'F1' && wasInF1) {
    const prevChamp = (G.lastResult && G.lastResult.cat === 'F1') ? G.lastResult.champ : 20;
    const hasH2HWins = G.f1ContractH2HWins === undefined ? true : G.f1ContractH2HWins > 0;
    const wonH2H = (G.f1ContractH2HWins || 0) > (G.f1ContractH2HLosses || 0);
    const myCurrentStars = G.team ? (G.team.stars || 3) : 3;
    const currentTeamInPool = allTeams.find(t => G.team && t.name === G.team.name);
    const renewalChampReq = G.team ? (G.team.stars >= 5 ? 8 : G.team.stars >= 4 ? 12 : G.team.stars >= 3 ? 18 : 20) : 20;
    
    const forceRenewal = currentTeamInPool && prevChamp <= renewalChampReq && hasH2HWins;
    if (forceRenewal && !offerPool.find(t => t.name === G.team.name)) {
      offerPool.push(currentTeamInPool);
    }

    offerPool = offerPool.filter(t => {
      if (G._nemesisSeatTarget === t.name) return true;
      if (G.team && t.name === G.team.name) return forceRenewal || (prevChamp <= 15 && hasH2HWins);
      if (wonH2H && t.stars === myCurrentStars + 1) return true;
      if (t.stars === 5) return prevChamp <= 8;
      if (t.stars === 4) return prevChamp <= 12;
      if (t.stars === 3) return prevChamp <= 18;
      return true;
    });

    offerPool = shuffle(offerPool);
    let finalOffers = [];

    if (G._nemesisSeatTarget) {
      const nemesisTargetTeam = offerPool.find(t => t.name === G._nemesisSeatTarget);
      if (nemesisTargetTeam) {
        finalOffers.push(nemesisTargetTeam);
        offerPool = offerPool.filter(t => t.name !== G._nemesisSeatTarget);
      }
    }

    const renewalTeam = offerPool.find(t => G.team && t.name === G.team.name);
    if (renewalTeam) {
      finalOffers.push(renewalTeam);
      offerPool = offerPool.filter(t => t.name !== renewalTeam.name);
    }

    if (wonH2H && myCurrentStars < 5) {
      const upgradeTeam = offerPool.find(t => t.stars > myCurrentStars);
      if (upgradeTeam) {
        finalOffers.push(upgradeTeam);
        offerPool = offerPool.filter(t => t.name !== upgradeTeam.name);
      }
    }

    const needed = Math.max(4 - finalOffers.length, 0);
    finalOffers.push(...offerPool.slice(0, needed));
    offerPool = finalOffers;
  } else {
    offerPool = shuffle(offerPool);
    const selectedOffers = [];
    ['desarrollo', 'equilibrado', 'ganar'].forEach(focusType => {
      const teamOfFocus = offerPool.find(t => t.focus === focusType);
      if (teamOfFocus) selectedOffers.push(teamOfFocus);
    });
    while (selectedOffers.length < 3 && selectedOffers.length < offerPool.length) {
      const extraTeam = offerPool.find(t => !selectedOffers.includes(t));
      if (extraTeam) selectedOffers.push(extraTeam);
      else break;
    }
    offerPool = selectedOffers;
  }

  return { offerPool, isLockedShadowMarket, isAcademyLocked };
}

const NATIONALITIES = [
  { flag: '🇦🇷', name: 'Argentina' }, { flag: '🇧🇷', name: 'Brasil' },
  { flag: '🇲🇽', name: 'México' }, { flag: '🇺🇸', name: 'Estados Unidos' }, { flag: '🇬🇧', name: 'Reino Unido' }, { flag: '🇩🇪', name: 'Alemania' },
  { flag: '🇫🇷', name: 'Francia' }, { flag: '🇮🇹', name: 'Italia' },
  { flag: '🇪🇸', name: 'España' }, { flag: '🇳🇱', name: 'Países Bajos' },
  { flag: '🇲🇨', name: 'Mónaco' }, { flag: '🇯🇵', name: 'Japón' },
  { flag: '🇦🇺', name: 'Australia' }, { flag: '🇳🇿', name: 'Nueva Zelanda' },
  { flag: '🇫🇮', name: 'Finlandia' }, { flag: '🇨🇦', name: 'Canadá' },
  { flag: '🇹🇭', name: 'Tailandia' }, { flag: '🇵🇾', name: 'Paraguay' },
  { flag: '🇧🇬', name: 'Bulgaria' }, { flag: '🇸🇪', name: 'Suecia' },
  { flag: '🇵🇱', name: 'Polonia' }, { flag: '🇨🇴', name: 'Colombia' },
  { flag: '🇳🇴', name: 'Noruega' }, { flag: '🇮🇪', name: 'Irlanda' },
  { flag: '🇮🇳', name: 'India' }, { flag: '🇩🇰', name: 'Dinamarca' },
  { flag: '🇸🇬', name: 'Singapur' }, { flag: '🇰🇷', name: 'Corea del Sur' },
  { flag: '🇱🇰', name: 'Sri Lanka' }, { flag: '🇨🇳', name: 'China' }
];

const TALENTS = [
  { id: 'speed', name: 'Velocista', desc: 'Máxima velocidad pura en clasificación y carrera', bonus: 'velocidad +10', stats: { speed: 10 } },
  { id: 'rain', name: 'Especialista en lluvia', desc: 'Domina como nadie en pistas mojadas', bonus: 'lluvia +10', stats: { rain: 10 } },
  { id: 'quali', name: 'Gran clasificador', desc: 'Siempre en el frente al largar', bonus: 'clasificación +10', stats: { quali: 10 } },
  { id: 'tyres', name: 'Conservador de gomas', desc: 'Sus neumáticos duran mucho más que el resto', bonus: 'gestión +10', stats: { tyres: 10 } },
  { id: 'overtake', name: 'Adelantador', desc: 'Maestro de los duelos rueda a rueda', bonus: 'adelantamientos +10', stats: { overtake: 10 } },
];

const ACADEMIES = [
  { id: 'ferrari', name: 'Ferrari', icon: 'assets/images/logos/logo Ferrari.png', f1Teams: ['Ferrari', 'Haas F1'] },
  { id: 'redbull', name: 'Red Bull', icon: 'assets/images/logos/logo red bull.png', f1Teams: ['Red Bull', 'Racing Bulls'] },
  { id: 'mercedes', name: 'Mercedes', icon: 'assets/images/logos/logo mercedes.png', f1Teams: ['Mercedes', 'Williams'] },
];

// focus: 'desarrollo' = more stat growth, worse results | 'ganar' = less growth, better results | 'equilibrado' = balanced
const TEAM_COLORS = {
  'Cadillac': '#f0f0f0',
  'Audi': '#830404ff',
  'Haas F1': '#e8002d',
  'Williams': '#00a3e0',
  'Racing Bulls': '#1b3fa0',
  'Alpine': '#0093cc',
  'Aston Martin': '#00665e',
  'McLaren': '#ff8000',
  'Mercedes': '#00d2be',
  'Ferrari': '#dc0000',
  'Red Bull': '#3671c6',
  'BYD': '#15b972ff',
  'Porsche': '#454545',
  'Toyota': '#eb0a1e',
  'Andretti': '#00509a',
  'Hyundai': '#002c5f'
};
const TEAMS = {
  'Karting': [
    { name: 'KartMaster', stars: 3, logo: null, focus: 'desarrollo' },
    { name: 'TopKart Racing', stars: 4, logo: null, focus: 'equilibrado' },
    { name: 'CRG Factory', stars: 5, logo: null, focus: 'ganar' },
    { name: 'Tony Kart', stars: 5, logo: null, focus: 'ganar' },
    { name: 'Kosmic Racing', stars: 4, logo: null, focus: 'equilibrado' },
    { name: 'Birel ART', stars: 5, logo: null, focus: 'ganar' },
    { name: 'Ricky Flynn Motorsport', stars: 3, logo: null, focus: 'desarrollo' },
    { name: 'Parolin', stars: 4, logo: null, focus: 'equilibrado' },
  ],
  'F4': [
    { name: 'Campos', stars: 3, logo: 'assets/images/logos/logo campos.png', focus: 'desarrollo' },
    { name: 'Van Amersfoort', stars: 4, logo: 'assets/images/logos/logo van amersfoort.png', focus: 'equilibrado' },
    { name: 'Prema', stars: 5, logo: 'assets/images/logos/logo prema.png', focus: 'ganar' },
    { name: 'US Racing', stars: 4, logo: 'assets/images/logos/logo us racing.png', focus: 'equilibrado' },
    { name: 'PHM Racing', stars: 3, logo: 'assets/images/logos/logo phm racing.png', focus: 'desarrollo' },
    { name: 'Jenzer Motorsport', stars: 3, logo: 'assets/images/logos/logo jenzer.png', focus: 'desarrollo' },
    { name: 'AKM Motorsport', stars: 3, logo: 'assets/images/logos/logo akm.png', focus: 'desarrollo' },
    { name: 'Hitech', stars: 5, logo: 'assets/images/logos/logo hitech.png', focus: 'ganar' },
  ],
  'Formula Regional': [
    { name: 'Trident', stars: 3, logo: 'assets/images/logos/logo trident.png', focus: 'desarrollo' },
    { name: 'ART Grand Prix', stars: 4, logo: 'assets/images/logos/logo art grand prix.png', focus: 'equilibrado' },
    { name: 'Prema', stars: 5, logo: 'assets/images/logos/logo prema.png', focus: 'ganar' },
    { name: 'R-ace GP', stars: 5, logo: 'assets/images/logos/logo r-ace.png', focus: 'ganar' },
    { name: 'MP Motorsport', stars: 4, logo: 'assets/images/logos/logo mp motorsports.png', focus: 'equilibrado' },
    { name: 'Van Amersfoort', stars: 4, logo: 'assets/images/logos/logo van amersfoort.png', focus: 'equilibrado' },
    { name: 'RPM', stars: 3, logo: 'assets/images/logos/logo rpm.png', focus: 'desarrollo' },
    { name: 'G4 Racing', stars: 3, logo: 'assets/images/logos/logo g4.png', focus: 'desarrollo' },
  ],
  'F3': [
    { name: 'Hitech', stars: 3, logo: 'assets/images/logos/logo hitech.png', focus: 'desarrollo' },
    { name: 'AIX Racing', stars: 4, logo: 'assets/images/logos/logo aix racing.png', focus: 'equilibrado' },
    { name: 'Prema', stars: 5, logo: 'assets/images/logos/logo prema.png', focus: 'ganar' },
    { name: 'Trident', stars: 5, logo: 'assets/images/logos/logo trident.png', focus: 'ganar' },
    { name: 'ART Grand Prix', stars: 4, logo: 'assets/images/logos/logo art grand prix.png', focus: 'equilibrado' },
    { name: 'MP Motorsport', stars: 4, logo: 'assets/images/logos/logo mp motorsports.png', focus: 'equilibrado' },
    { name: 'Campos', stars: 3, logo: 'assets/images/logos/logo campos.png', focus: 'desarrollo' },
    { name: 'Van Amersfoort', stars: 3, logo: 'assets/images/logos/logo van amersfoort.png', focus: 'desarrollo' },
    { name: 'Rodin Motorsport', stars: 4, logo: 'assets/images/logos/logo rodin.png', focus: 'equilibrado' },
    { name: 'Jenzer Motorsport', stars: 3, logo: 'assets/images/logos/logo jenzer.png', focus: 'desarrollo' },
  ],
  'F2': [
    { name: 'MP Motorsport', stars: 3, logo: 'assets/images/logos/logo mp motorsports.png', focus: 'desarrollo' },
    { name: 'Prema', stars: 4, logo: 'assets/images/logos/logo prema.png', focus: 'equilibrado' },
    { name: 'Invicta', stars: 5, logo: 'assets/images/logos/logo invicta.png', focus: 'ganar' },
    { name: 'ART Grand Prix', stars: 4, logo: 'assets/images/logos/logo art grand prix.png', focus: 'equilibrado' },
    { name: 'Rodin Motorsport', stars: 4, logo: 'assets/images/logos/logo rodin.png', focus: 'equilibrado' },
    { name: 'Hitech Pulse-Eight', stars: 4, logo: 'assets/images/logos/logo hitech.png', focus: 'equilibrado' },
    { name: 'DAMS', stars: 4, logo: 'assets/images/logos/logo dams.png', focus: 'equilibrado' },
    { name: 'Campos', stars: 3, logo: 'assets/images/logos/logo campos.png', focus: 'desarrollo' },
    { name: 'Trident', stars: 3, logo: 'assets/images/logos/logo trident.png', focus: 'desarrollo' },
    { name: 'Van Amersfoort', stars: 3, logo: 'assets/images/logos/logo van amersfoort.png', focus: 'desarrollo' },
    { name: 'AIX Racing', stars: 3, logo: 'assets/images/logos/logo aix racing.png', focus: 'desarrollo' },
  ],
  'F1': [
    { name: 'Cadillac', stars: 1, logo: 'assets/images/logos/logo cadillac.png' },
    { name: 'Audi', stars: 2, logo: 'assets/images/logos/logo audi.png' },
    { name: 'Haas F1', stars: 2, logo: 'assets/images/logos/logo haas.png' },
    { name: 'Williams', stars: 3, logo: 'assets/images/logos/logo williams.png' },
    { name: 'Racing Bulls', stars: 3, logo: 'assets/images/logos/logo racing bulls.png' },
    { name: 'Alpine', stars: 4, logo: 'assets/images/logos/logo alpine.png' },
    { name: 'Aston Martin', stars: 4, logo: 'assets/images/logos/logo aston martin.png' },
    { name: 'McLaren', stars: 4, logo: 'assets/images/logos/logo mclaren.png' },
    { name: 'Mercedes', stars: 5, logo: 'assets/images/logos/logo mercedes.png' },
    { name: 'Ferrari', stars: 5, logo: 'assets/images/logos/logo Ferrari.png' },
    { name: 'Red Bull', stars: 5, logo: 'assets/images/logos/logo red bull.png' },
  ],
};

const CAT_LOGOS = {
  'F4': 'assets/images/logos/logo F4.png',
  'Formula Regional': 'assets/images/logos/logo FR.png',
  'F1': 'assets/images/logos/logo F1.png',
  'F2': 'assets/images/logos/logo F2.png',
  'F3': 'assets/images/logos/logo F3.png',
};

const WIN_PROBS = ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'];

const ACTIVITIES_COMMON = [
  { name: 'Buscar el limite en pista', icon: '🚀', bonus: '+2 clasificación', stats: { quali: 2 }, rarity: 'common' },
  { name: 'Resistencia física', icon: '🏃', bonus: '+2 consistencia', stats: { tyres: 2 }, rarity: 'common' },
  { name: 'Practicar adelantamientos', icon: '🏎️', bonus: '+2 adelantamientos', stats: { overtake: 2 }, rarity: 'common' },
  { name: 'Trabajar con ingenieros', icon: '⚙️', bonus: '+1 clasif, +1 const', stats: { quali: 1, tyres: 1 }, rarity: 'common' },
  { name: 'Relajación y enfoque', icon: '🧘', bonus: '+2 velocidad', stats: { speed: 2 }, rarity: 'common' },
  { name: 'Analizar telemetría', icon: '📊', bonus: '+2 adelantamientos', stats: { overtake: 2 }, rarity: 'common' },
  { name: 'Prácticas en lluvia', icon: '🌧️', bonus: '+2 lluvia', stats: { rain: 2 }, rarity: 'common' },
  { name: 'Preparación integral', icon: '🏔️', bonus: '+1 en 3 stats', stats: { speed: 1, quali: 1, tyres: 1 }, rarity: 'common' },
  { name: 'Revisar vueltas anteriores', icon: '🎥', bonus: '+1 velocidad, +1 clasif', stats: { speed: 1, quali: 1 }, rarity: 'common' },
  { name: 'Briefing con el equipo', icon: '🎧', bonus: '+1 clasif, +1 lluvia', stats: { quali: 1, rain: 1 }, rarity: 'common' },
  { name: 'Trabajar en simulador', icon: '💻', bonus: '+1 clasificación, +1 gestión', stats: { quali: 1, tyres: 1 }, rarity: 'common' },
  { name: 'Análisis de rivales', icon: '🎯', bonus: '+1 adelantamientos, +1 clasificación', stats: { overtake: 1, quali: 1 }, rarity: 'common' },
];
const ACTIVITIES_RARE = [
  { name: 'Carrera de Karting invernal', icon: '❄️', bonus: '+4 lluvia, +1 gestión', stats: { rain: 4, tyres: 1 }, rarity: 'rare' },
  { name: 'Test aerodinámico en pista', icon: '🏎️', bonus: '+3 vel, +2 clasif', stats: { speed: 3, quali: 2 }, rarity: 'rare' },
  { name: 'Coaching mental deportivo', icon: '🧠', bonus: '+3 const, +2 adelant', stats: { tyres: 3, overtake: 2 }, rarity: 'rare' },
  { name: 'Curso avanzado de neumáticos', icon: '🛞', bonus: '+4 gestión, +1 const', stats: { tyres: 4, quali: 1 }, rarity: 'rare' },
  { name: 'Simulación de clasificación', icon: '⏱️', bonus: '+4 clasificación', stats: { quali: 4 }, rarity: 'rare' },
  { name: 'Análisis de los mejores sectores', icon: '📈', bonus: '+3 clasificación, +1 velocidad', stats: { quali: 3, speed: 1 }, rarity: 'rare' },
  { name: 'Test de conducción en lluvia', icon: '🌧️', bonus: '+5 lluvia', stats: { rain: 5 }, rarity: 'rare' },
];
const ACTIVITIES_LEGENDARY = [
  { name: '🌟 Mentoría con un Campeón', icon: '🏆', bonus: '+3 vel, +2 clas, +2 const, +2 adelant', stats: { speed: 3, quali: 2, tyres: 2, overtake: 2 }, rarity: 'legendary' },
  { name: '🌟 Masterclass extrema en lluvia', icon: '⛈️', bonus: '+7 lluvia, +2 vel', stats: { rain: 7, speed: 2 }, rarity: 'legendary' },
  { name: '🌟 Campamento de élite', icon: '⭐', bonus: '+4 vel, +4 clasif', stats: { speed: 4, quali: 4 }, rarity: 'legendary' },
  { name: '🌟 Hallazgo de setup perfecto', icon: '🔧', bonus: '+5 const, +3 adelant', stats: { tyres: 5, overtake: 3 }, rarity: 'legendary' },
  { name: '🌟 Test privado de Fórmula 1', icon: '🏎️', bonus: '+6 velocidad, +3 clasificación', stats: { speed: 6, quali: 3 }, rarity: 'legendary' },
  { name: '🌟 Día perfecto de simulador', icon: '🖥️', bonus: '+5 clasificación, +3 adelantamientos', stats: { quali: 5, overtake: 3 }, rarity: 'legendary' },
  { name: '🌟 Preparación de campeón', icon: '👑', bonus: '+3 en 3 stats', stats: { speed: 3, quali: 3, tyres: 3 }, rarity: 'legendary' },
];

const RANDOM_EVENTS = [
  {
    id: 'f2_academy_fp1',
    requireAcademy: true,
    minCat: 4,
    maxCat: 4,
    icon: '🏎️', title: 'Oportunidad de Oro', desc: '{{ACADEMY_NAME}} te ha ofrecido subirte a su coche de Fórmula 1 durante una sesión de Entrenamientos Libres 1 (FP1). Es tu primera vez en la máxima categoría frente a los jefes.', choices: [
      { text: 'Apretar al máximo', skillStat: 'speed', skillBonus: 2, skillFail: -2, repDelta: 30, repFailDelta: -20, hint: '🚀 Velocidad: Si sos rápido, deslumbrás.', successDesc: 'Sorprendiste a todos marcando tiempos increíbles para un novato. Los jefes de {{ACADEMY_NAME}} tomaron nota de tu talento puro.', failDesc: 'Te pasaste del límite y terminaste contra el muro. Destruiste el coche y los ingenieros de {{ACADEMY_NAME}} quedaron furiosos.' },
      { text: 'Dar buen feedback', skillStat: 'quali', skillBonus: 1, skillFail: -1, repDelta: 15, repFailDelta: -10, hint: '⏱️ Clasificación: Si entendés el coche, aportás datos útiles.', successDesc: 'Diste 30 vueltas impecables aportando datos clave para configurar el coche. Agradecieron tu madurez y frialdad.', failDesc: 'El salto a la F1 fue demasiado para vos. Te mareaste con los botones del volante y los datos que diste fueron inútiles.' }
    ]
  },
  {
    id: 'f2_academy_tpc',
    requireAcademy: true,
    minCat: 4,
    maxCat: 4,
    icon: '🏁', title: 'Test Privado (TPC)', desc: '{{ACADEMY_NAME}} organizó un test privado en un Fórmula 1 de hace dos años. Estás compitiendo directamente contra los otros jóvenes talentos del programa.', choices: [
      { text: 'Trabajar ritmo de carrera', skillStat: 'tyres', skillBonus: 2, skillFail: -2, repDelta: 20, repFailDelta: -15, hint: '🛞 Gestión: Si sos constante, demostras madurez.', successDesc: 'Fuiste el más constante en las tandas largas. Los ingenieros de {{ACADEMY_NAME}} aplaudieron tu gestión de los neumáticos.', failDesc: 'Destrozaste las gomas en pocas vueltas. Tus tiempos cayeron en picada y quedaste último entre los jóvenes de la academia.' },
      { text: 'Buscar la vuelta rápida', skillStat: 'quali', skillBonus: 2, skillFail: -2, repDelta: 25, repFailDelta: -15, hint: '⏱️ Clasificación: Encontrar el limite del coche.', successDesc: 'Destrozaste el cronómetro y le ganaste al resto de los jóvenes de {{ACADEMY_NAME}}. Dejaste claro quién es el líder.', failDesc: 'Quisiste ir tan rápido que cometiste errores en todas tus vueltas lanzadas. Los otros pilotos de {{ACADEMY_NAME}} marcaron mejores tiempos.' }
    ]
  },
  {
    icon: '🤕', title: 'Lesión en entrenamiento', desc: 'Te lastimaste la muñeca. La temporada arranca complicada.', choices: [
      { text: 'Pagar la mejor operación (-$50,000)', stat: 'tyres', delta: 1, money: -50000, hint: 'Te recuperás impecable y volvés con más resistencia (+1 Gestión).', fixedDesc: 'El cirujano hizo un trabajo impecable. Semanas de rehabilitación intensa, pero volviste a la pista más fuerte que antes. Los meses de recuperación te hicieron entender tu cuerpo de otra manera.' },
      { text: 'Aguantar con dolor y correr igual', stat: 'quali', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 1, skillFail: -3, hint: '🛞 Gestión: si sos resistente, te fortalecerás. Si no, recaés y perdés stats.', successDesc: 'Carrera tras carrera, la adrenalina tapó el dolor. Sin darte cuenta, tu cuerpo se adaptó y saliste de la temporada más curtido que nunca.', failDesc: 'La muñeca no aguantó. A mitad de temporada tuviste que bajarte del auto tres fines de semana. El doctor fue tajante: "Esto podría haberte costado la carrera entera."' },
    ]
  },
  {
    icon: '🛞', title: 'El neumático experimental', desc: 'Pirelli trae un compuesto experimental para probar durante los libres. Nadie sabe exactamente cómo se comportará en tandas largas.', choices: [
      { text: 'Probarlo durante una tanda larga', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 5, skillFail: -2, hint: '🛞 Gestión: cuanto mejor entiendas la degradación, más podés sacar del compuesto.', successDesc: 'Encontraste la ventana perfecta del neumático. Tus datos fueron tan precisos que el equipo pudo diseñar una estrategia alrededor del compuesto.', failDesc: 'El neumático se degradó muchísimo antes de lo esperado. Tu tanda terminó siendo poco útil y el equipo perdió una oportunidad de recopilar datos.' },
      { text: 'No arriesgar y usar el compuesto conocido', stat: 'quali', delta: 1, money: 0, hint: 'Resultado fijo: trabajás con algo que ya conocés (+1 Clasificación).', fixedDesc: 'Mientras los demás experimentaban, vos perfeccionaste el setup conocido. No descubriste nada revolucionario, pero tu auto quedó perfectamente equilibrado.' }
    ]
  },
  { icon: '🧪', title: 'Setup experimental', desc: 'Tu ingeniero propone un setup completamente diferente al que venís usando. Los datos del simulador son prometedores, pero nadie lo probó en carrera.', choices: [
      { text: 'Confiar en los ingenieros', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 6, skillFail: -2, hint: '🏎️ Clasificación: el setup puede darte una gran ventaja a una vuelta.', successDesc: 'El setup era exactamente lo que necesitabas. El auto cobró vida en clasificación y encontraste varias décimas que nadie esperaba.', failDesc: 'Los datos del simulador engañaron. El auto era impredecible y tu confianza desapareció durante el fin de semana.' },
      { text: 'Mantener el setup conocido', stat: 'tyres', delta: 1, money: 0, hint: '🛞 +1 Gestión por apostar a la consistencia.', fixedDesc: 'No necesitabas inventar nada. Conocías perfectamente el comportamiento del auto y eso te permitió completar el fin de semana sin sorpresas.' }
    ]
  },
  {
    icon: '🌧️', title: 'Temporada de lluvia', desc: 'Esta categoría tuvo un año muy húmedo. La lluvia fue constante.', choices: [
      { text: 'Apostar por tu manejo en mojado', stat: 'rain', delta: 0, money: 0, skillStat: 'rain', skillBonus: 5, skillFail: -1, hint: '⛈ Lluvia es clave aquí', successDesc: 'El agua era tu elemento. En Macao, en la primera vuelta bajo la lluvia, adelantaste cuatro autos de una sola frenada. Los medios empezaron a llamarte "el técnico del mojado".', failDesc: 'Acuaplaning en la primera vuelta de Macau, choque en Brasil. El mojado te jugó en contra toda la temporada.' },
      { text: 'Ser conservador y cuidar las gomas', stat: 'tyres', delta: 3, money: 0, hint: 'Gestión de gomas te da resultado fijo', fixedDesc: 'No brillaste bajo la lluvia, pero nunca tiraste un punto. Mientras otros se daban vuelta en curvas mojadas, vos sumabas posiciones simplemente estando ahí al final.' },
    ]
  },
  {
    icon: '💥', title: 'Choque con tu compañero', desc: 'Ambos terminaron afuera. La prensa y el equipo buscan culpables.', choices: [
      { text: 'Asumir la culpa y proteger la armonía', stat: 'tyres', delta: 2, money: 0, hint: 'El equipo valora tu madurez, mejorando la moral y el ritmo.', fixedDesc: 'Tu gesto desarma la tensión. El ingeniero jefe te agradece en privado. En las semanas siguientes, el equipo trabajó más unido que nunca y el auto mejoró notablemente.' },
      { text: 'Atacarlo frente a los micrófonos', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 4, skillFail: -2, hint: '🏎 Clasificación: si sos más rápido que él, salís favorecido. Si no, quedás mal.', successDesc: 'La telemetría te dio la razón. Los datos mostraban claramente que él se cerró. La prensa y el equipo coincidieron: fue culpa de él. Tu credito dentro del garaje subió.', failDesc: 'Los datos te jugaron en contra. El equipo vio los videos y el ingeniero te llamó al despacho. Semanas tensas, sin apoyo del box. El ambiente nunca volvió a ser el mismo.' },
    ]
  },
  {
    icon: '🎬', title: 'Evento de exhibición extremo', desc: 'Te invitan a correr en rally el fin de semana libre por muchísima plata.', choices: [
      { text: 'Rechazar para enfocarte en el campeonato', stat: 'speed', delta: 1, money: 0, hint: 'Menos distracciones, te enfocás en tu velocidad (+1 Velocidad).', fixedDesc: 'Mientras todos descansaban, vos pasaste el fin de semana en el simulador. Encontraste medio segundo por vuelta en el sector 2 de Montecarlo. Ese fin de semana libre fue lo mejor que te pudo pasar.' },
      { text: 'Aceptar el riesgo ($250,000)', stat: 'rain', delta: 0, money: 250000, skillStat: 'rain', skillBonus: 3, skillFail: -2, hint: '⛈ Lluvia: dominar el rally mejora tu control, fallar te deja adolorido.', successDesc: 'Las pistas de tierra y el barro te enseñaron a sentir el auto de otra manera. Llegaste al primer GP postpausa con los reflejos afiladísimos y el control en condiciones límite disparado.', failDesc: 'Rodaste en la segunda especial. Golpe en el hombro, tres días de médicos y el equipo furioso. Llegaste al siguiente GP sin entrenarte y se notó en la pista.' },
    ]
  },
  {
    icon: '🔧', title: 'Prueba del nuevo paquete aerodinámico', desc: 'Estás en los entrenamientos libres. El equipo acaba de montar una mejora extrema.', radioMsg: '"Acá el ing. Bianchi. Instalamos el paquete nuevo. Es un paso enorme pero los datos del túnel de viento a veces mienten. ¿Querés hacer tandas largas a velocidad constante para calibrar sensores, o apretás a fondo para ver el límite real?"', choices: [
      { text: 'Tandas largas para calibrar sensores', stat: 'speed', delta: 2, money: 0, hint: 'Velocidad: el trabajo duro y constante rinde sus frutos.', fixedDesc: 'Giraste 30 vueltas siendo un reloj suizo. Entregaste un feedback perfecto y el equipo logró calibrar el auto para tener un ritmo de carrera demoledor.' },
      { text: 'Apretar a fondo para buscar el límite', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 5, skillFail: -1, hint: '🏄 Clasificación: buscar el límite a una vuelta sin chocar.', successDesc: 'No hacías caso a los números: tu conexión con el auto era instintiva. Apretaste a fondo, marcaste el mejor tiempo de la sesión y el ingeniero quedó boquiabierto. En qualy fuiste intocable.', failDesc: 'Apretaste demasiado sin conocer los límites del nuevo paquete aerodinámico. Trompo en la curva rápida y directo contra el muro. El equipo pasó toda la noche reparando y clasificaste pésimo.' },
    ]
  },
  {
    icon: '🤝', title: 'Compañero de equipo muy fuerte', desc: 'Tu compañero está en un momento increíble de su carrera.', choices: [
      { text: 'Aprender de él observando su estilo', stat: 'overtake', delta: 0, money: 0, skillStat: 'overtake', skillBonus: 5, skillFail: -1, hint: '⚔ Adelantamientos: mejor tu técnica, más aprendés.', successDesc: 'Estudiaste sus telemetrías hasta el hartazgo. Un jueves en Baréin notaste cómo frenaba tarde en la curva 4 y se salía más rápido. Copiaste la técnica y te cambió la temporada entera.', failDesc: 'Intentar imitar su estilo te confundió más que ayudarte. Saliste de los boxes tratando de frenar como él y terminaste perdiendo tu propio ritmo natural. Mala idea.' },
      { text: 'Concentrarte en tu propio ritmo', stat: 'tyres', delta: 3, money: 0, hint: 'Gestión fija sin variación.', fixedDesc: 'Mientras él brillaba en clasificación, vos eras una máquina de sumar puntos. Llevar el auto al límite justo, ni más ni menos, te dio una consistencia que al final del año se vió en la tabla.' },
    ]
  },
  {
    icon: '💰', title: 'Oferta de patrocinador', desc: 'Una marca importante quiere asociarse con vos.', choices: [
      { text: 'Aceptar el contrato', stat: 'speed', delta: -1, money: 250000, hint: 'Ganás plata, pero perdés un poco de foco (-1 Velocidad).', fixedDesc: 'Presentaciones en Dubai, cenas de gala en Mónaco, sesiones de fotos en Japón. Fantástico para la billetera, pero llegaste a varios GP con el jet lag encima y se notó en la pista.' },
      { text: 'Rechazar y enfocarte', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 4, skillFail: -1, hint: '🚀 Velocidad: demostrás hambre de gloria.', successDesc: 'Dijiste que no a la pasta. El equipo lo notó. Cuando el director te vio llegar el domingo con cara de ganador, movió la estrategia para darte prioridad en boxes. Te lo devolvió con creces.', failDesc: 'Rechazaste el sponsor y no pudiste compensarlo en pista. Internamente quedó la sensación de que podrías haber agarrado la plata sin que cambiara mucho.' },
    ]
  },
  {
    icon: '😤', title: 'Conflicto con el jefe de equipo', desc: 'El director del equipo cuestiona tus decisiones en pista.', choices: [
      { text: 'Ceder y adaptar tu estilo', stat: 'tyres', delta: 2, money: 0, hint: 'Resultado fijo, mejora la gestión.', fixedDesc: 'Tragaste orgullo y seguiste las instrucciones del muro. Para tu sorpresa, los nuevos mapas de motor y la estrategia conservadora que te impusieron resultaron en la gestión de gomas más largas de tu carrera.' },
      { text: 'Defenderte con resultados', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 4, skillFail: -2, hint: '🚀 Velocidad: te avala si tu ritmo es real.', successDesc: 'El cronometro fue tu abogado. Dos qualys muy buenass seguidas cerraron la boca de todo el mundo. En la reunión del lunes, el director te estrecho la mano. No hubo más preguntas.', failDesc: 'Los resultados no te acompañaron en el momento menos oportuno. El director convocó una reunión de urgencia, y el resto del año sentiste la presión de saber que estaban mirando cada metro que corrías.' },
    ]
  },
  {
    icon: '🛠️', title: 'Avería mecánica en el peor momento', desc: 'El motor falló antes de la carrera.', radioMsg: '"Piloto, hay una avería grave en el motor. Necesitamos parar. Decís vos: ¿pagamos a los mecánicos horas extras esta noche para arreglarlo o pasamos página y nos enfocamos en la siguiente carrera?"', choices: [
      { text: 'Pagar horas extras a mecánicos (-$30,000)', stat: 'quali', delta: 0, money: -30000, skillStat: 'quali', skillBonus: 5, skillFail: -1, hint: '🏄 Clasificación: liderás la reconstrucción del setup.', successDesc: 'Toda la noche en el box, pizzas frías y telemetría hasta el amanecer. Cuando el auto volvió a la pista era otro. Los mecánicos te dieron un aplauso cuando saliste del garage.', failDesc: 'Los mecánicos trabajaron, pero la comunicación falló. Nuevos problemas y los de antes todavía sin resolver. Una pesadilla logística.' },
      { text: 'Aceptar la mala suerte', stat: 'speed', delta: 1, money: 0, hint: 'Te enfocás en la próxima carrera (+1 Velocidad).', fixedDesc: 'Tiraste el casco al garaje y te fuiste al hotel. En la carrera siguiente, con una mente limpia, lograste el mejor tiempo de tu vuelta de clasificación de la temporada. A veces, soltar es la única salida.' },
    ]
  },
  {
    icon: '📸', title: 'Entrevista polémica', desc: 'Hiciste un comentario que generó revuelo en los medios.', choices: [
      { text: 'Mantener la postura', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 3, skillFail: -2, hint: '🚀 Velocidad: si tus resultados te respaldan, salís ganando.', successDesc: 'El GP siguiente te dio la razón. Lograste un resultado brillante y en la conferencia de prensa te preguntaron por la polémica. Respondiste con calma: "Dejen que la pista hable por mí". Silencio total en la sala.', failDesc: 'El fin de semana siguiente fue horrible. Saliste décimo, rodaste en la carrera y los periodistas te cargaron con todo. Sin resultados, tus palabras fueron solo ruido.' },
      { text: 'Suavizar el mensaje', stat: 'tyres', delta: 2, money: 0, hint: 'Resultado fijo, calmás las aguas.', fixedDesc: 'La clásica disculpa corporativa. "Mis palabras fueron malinterpretadas." La polémica murió a las 48 horas y pudiste enfocarte en el auto. A veces el silencio tiene su valor.' },
    ]
  },
  {
    icon: '🏋️', title: 'Preparación de pretemporada', desc: 'Tenés un mes libre. ¿Cómo lo usás?', choices: [
      { text: 'Entrenamiento físico', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 5, skillFail: 0, hint: '🛞 Gestión: cuerpo fuerte, poco riesgo de fallar.', successDesc: 'Ciclismo en los Alpes, nado en el océano, trabajo de cuello y core. Llegaste al primer test de pretemporada sin una gota de grasa de más. La vuelta 60 se sintió igual que la 1.', failDesc: 'Entrenaste fuerte pero te exigiste demasiado. Una contractura a fines de enero te obligó a parar dos semanas. Llegaste al primer test con la espalda entumecida.' },
      { text: 'Simulador y análisis de datos', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 5, skillFail: 0, hint: '🏎 Clasificación: el simulador amplifica tu técnica', successDesc: 'Horas y horas en el simulador pagaron. Llegaste al primer test sabiendo de memoria los puntos de frenada de los 24 circuitos del calendario. Tu ingeniero no podía creer el nivel de detalle de tu feedback desde el primer día.', failDesc: 'Demasiado tiempo en el simulador y poco en la pista real. Cuando llegaste a Bahréin para el primer test, el asfalto real se sintió extraño. Tardaste dos días en adaptarte.' },
    ]
  },
  {
    icon: '🌍', title: 'Carrera fuera de Europa', desc: 'Esta temporada hay fecha en un circuito callejero de Asia. Calor extremo y mucho tráfico.', choices: [
      { text: 'Atacar desde el principio', stat: 'overtake', delta: 0, money: 0, skillStat: 'overtake', skillBonus: 4, skillFail: -1, hint: '⚔ Adelantamientos: en calles, el duelo lo define esa habilidad', successDesc: 'Vuelta 1, curva 3, adelantaste a tres pilotos de golpe por el interior. Las calles de Yakarta estaban de tu lado. La multitud enloqueció. Los ingenieros de radio gritaron solos.', failDesc: 'Ataque demasiado ambicioso en la primera vuelta. Tocás un guardarrail metálico y el alerón delantero al suelo. Parada de emergencia y carrera arruinada antes de llegar a la primera chicana.' },
      { text: 'Priorizar la gestión de temperatura', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 4, skillFail: -1, hint: '🛞 Gestión: el calor destruye gomas, manejá eso', successDesc: 'A 40°C de asfalto, las gomas de todos se degradaban rápido. Vos las cuidaste como si fueran de cristal. En la última vuelta, los que atacaron al principio rodaban como ladrillo. Vos pasabas uno por uno.', failDesc: 'El calor fue más de lo esperado. A pesar de tu ritmo conservador, las gomas cedieron igual y terminaste con un underperformance frustrante. Asia se cobró su precio.' },
    ]
  },
  {
    icon: '🏆', title: 'Invitación a test de fábrica', desc: 'Un fabricante de motores te invita a sus instalaciones para un test privado de desarrollo.', choices: [
      { text: 'Dar feedback técnico detallado', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 6, skillFail: -1, hint: '🏎 Clasificación: tu análisis técnico vale si lo entendés', successDesc: 'Pasás dos días entero en la fábrica, pizarras, ingenieros y datos. Tu análisis del comportamiento del motor en frenada fue tan preciso que el director de desarrollo pidió que lo incluyeran en el informe oficial.', failDesc: 'Tu feedback fue vago y los ingenieros no pudieron trabajar con él. La sesión fue un desastre logístico y te fuiste con la sensación de haber desperdiciado dos días.' },
      { text: 'Apretar fuerte y demostrar velocidad', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 6, skillFail: -1, hint: '🚀 Velocidad: más rápido sos, más los impresionás', successDesc: 'Chronos imposibles. Batiste el récord del banco de pruebas en tres configuraciones distintas. El CEO de la empresa estaba en el box y te llamó personalmente al día siguiente para felicitarte.', failDesc: 'El motor estaba programado para test, no para atacar. Forzaste demasiado, tuviste una rotura de transmisión en la vuelta 14 y el test terminó antes. Nadie estaba contento.' },
    ]
  },
  {
    icon: '😰', title: 'Presión del equipo por resultados', desc: 'Los directivos quieren resultados ya. El ambiente interno es tenso.', choices: [
      { text: 'Arriesgar más en clasificación', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 4, skillFail: -2, hint: '🏎 Clasificación: si clasificás bien, la presión baja', successDesc: 'Vuelta milagrosa. Sector 1 récord, Sector 2 récord, Sector 3 al límite. La pole fue tuya. La reunión del lunes se canceló. Los directivos no tuvieron nada más que decir.', failDesc: 'El toque en la Q3 bajo presión. El auto al muro, clasificación arruinada y los directivos aún más exigentes. Un fin de semana que querrías borrar de la memoria.' },
      { text: 'Mantener la cabeza fría y ser consistente', stat: 'tyres', delta: 3, money: 0, hint: 'Resultado fijo, menos drama', fixedDesc: 'Cero desgaste emocional. Mientras el resto del garaje andaba nervioso, vos salías a la pista con una frialdad brutal. Vuelta a vuelta, sumaste puntos. Al final del año, esa consistencia fue tu mejor argumento.' },
    ]
  },
  {
    id: 'pendrive',
    icon: '🕵️', title: 'El ingeniero con el pendrive', desc: 'Un ingeniero de aerodinámica de {{RIVAL_TEAM}} te intercepta en el paddock, furioso con su equipo. Lleva un pendrive con datos técnicos confidenciales. "No quiero nada a cambio", te dice. "Solo que ganen los que se lo merecen."', choices: [
      { text: 'Rechazarlo y reportarlo a la dirección de carrera', stat: 'speed', delta: 2, money: 0, hint: 'Resultado fijo. Tu reputación dentro del paddock sube enormemente (+2 Velocidad por respeto ganado).', fixedDesc: 'Le devolviste el pendrive y lo reportaste en secreto a los comisarios. La noticia se filtró igual. El paddock entero te miró diferente ese fin de semana. "El único piloto honesto del paddock", tituló un periodista. Los ingenieros de tu propio equipo empezaron a trabajar con más orgullo.' },
      { text: 'Aceptar los datos y pasarlos a tu equipo', stat: 'speed', delta: 0, money: 0, skillStat: 'overtake', skillBonus: 6, skillFail: -4, hint: '⚔ Adelantamientos: si ganás con ventaja técnica, brillás. Si te descubren, caída brutal.', successDesc: 'Los datos de {{RIVAL_TEAM}} eran oro puro. Tu equipo copió tres soluciones aerodinámicas clave que nadie entendía cómo funcionaban. Pasaste la temporada con el mejor auto de la parrilla sin que nadie supiera por qué. La FIA nunca lo investigó.', failDesc: 'Un periodista técnico notó que el fondo plano de tu auto tenía elementos idénticos a los de {{RIVAL_TEAM}}. La FIA abrió una investigación. Aunque no pudieron probar nada definitivamente, la nube de sospecha te siguió todo el año. Tu nombre quedó manchado.' },
    ]
  },
  {
    id: 'monaco',
    icon: '🏙️', title: 'Gran Premio de Mónaco', desc: 'El GP más especial del año. Las calles del Principado perdonan cero. Clasificación lo es todo: en Mónaco, adelantar en carrera es casi imposible. La vuelta de clasificación de tu vida puede definir el fin de semana entero.', choices: [
      { text: 'Ir al límite absoluto en la Q3', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 7, skillFail: -3, hint: '🏎 Clasificación: en Mónaco, largar adelante vale más que en cualquier otro lugar. Todo depende de ello.', successDesc: 'Piscine, Rascasse, Antenne. Cada sector fue al límite. Rozaste los guardarraíles toda la vuelta y encontraste tiempo donde parecía no haberlo. Cuando cruzaste la línea, habías conseguido una posición de salida mucho mejor de la esperada.', failDesc: 'La chicane de la piscina. Doscientos milímetros de guardarrail más adentro y el alerón estaba roto. Entraste a boxes, el auto quedó en el garaje. En Mónaco no hay segunda oportunidad.' },
      { text: 'Ser cauteloso y asegurar una buena vuelta', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 5, skillFail: 0, hint: '🛞 Gestión: una vuelta limpia en Mónaco siempre vale más que una arriesgada que termina en el muro.', successDesc: 'No buscaste el milagro en cada curva. Fuiste preciso, constante y mantuviste el auto lejos de los muros. La vuelta no fue espectacular, pero sí extremadamente sólida, y te permitió conseguir una buena posición para afrontar la carrera.', failDesc: 'Tu cautela fue excesiva y saliste décimo. En Mónaco, desde esa posición, las posibilidades de adelantar son prácticamente nulas. Completaste las vueltas de forma anodina. Una oportunidad perdida en el circuito más icónico del mundo.' },
    ]
  },
  {
    id: 'rookie',
    icon: '👶', title: 'El Rookie que lo cambia todo', desc: 'Tu equipo sube a un joven directo de F2. Es la promesa más grande en años y los medios no hablan de otra cosa. En la primera semana ya está dentro de 3 décimas tuyas en el simulador. La escudería quiere que "lo guíes". Vos sabés que es una amenaza directa.', choices: [
      { text: 'Compartir todo: reglajes, frenadas, telemetría', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 5, skillFail: 0, hint: '🏎 Clasificación: tu dominio técnico determina quién aprende de quién realmente.', successDesc: 'Le abriste los archivos de telemetría sin filtros. El pibe aprendió rápido, sí. Pero en ese proceso, vos también te miraste en el espejo y encontraste dos o tres décimas que ni sabías que tenías. El equipo terminó con el mejor resultado de constructores en años. Y todos saben quién era el líder.', failDesc: 'Le diste todo lo que sabías. Y él lo absorbió más rápido de lo que esperabas. Para la décima fecha ya te había ganado en clasificación dos veces. Los medios empezaron a hablar de "relevo generacional". Fue una decisión demasiado generosa.' },
      { text: 'Mantener distancia y proteger tus ventajas', stat: 'speed', delta: 3, money: 0, hint: 'Resultado fijo: sin complejidad. Tu ritmo personal mejora por la motivación de la competencia interna (+3 Velocidad).', fixedDesc: 'No le explicaste nada. Le dejaste encontrar sus propios límites. Y mientras él tropezaba con los muros de aprendizaje, vos te afilabas solo. La presión de tener a alguien así cerca te sacó lo mejor. Terminaste la temporada con las mejores estadísticas de tu carrera reciente.' },
    ]
  },
  {
    id: 'directiva',
    icon: '⚖️', title: 'Directiva técnica anti-vos', desc: 'Después de tres temporadas dominantes, la FIA publicó una directiva técnica que restringe específicamente el área donde tu equipo tenía la mayor ventaja aerodinámica. El paddock no lo dice, pero saben que está apuntada a vos. El reglamento cambia en tres semanas.', choices: [
      { text: 'Trabajar con los ingenieros para reinventar el concepto', stat: 'overtake', delta: 0, money: 0, skillStat: 'overtake', skillBonus: 5, skillFail: -2, hint: '⚔ Adelantamientos: tu adaptabilidad al caos técnico es lo que importa.', successDesc: 'Tres semanas de insomnio en la fábrica. Probaste cinco configuraciones distintas. La noche antes de la fecha límite, encontraron la solución. No era lo mismo que antes, pero era ingenioso. La FIA aprobó el concepto sin problemas. La respuesta técnica que dieron tu equipo fue estudiada en universidades de ingeniería.', failDesc: 'El tiempo fue demasiado corto. Llegaron a la primera carrera con el fondo plano viejo y un ala delantera que no funcionaba bien con el nuevo reglamento. Perdiste dos décimas por vuelta de golpe. La ventaja que te dio el equipo se evaporó en semanas.' },
      { text: 'Protestar públicamente y presionar a la FIA', stat: 'speed', delta: 1, money: 0, hint: 'Resultado fijo: la directiva sigue igual, pero tu visibilidad y determinación aumentan (+1 Velocidad por foco ganado).', fixedDesc: 'Diste una conferencia de prensa explosiva. Dijiste en voz alta lo que todos pensaban: que la FIA penalizaba al que ganaba. Las redes sociales te hicieron viral. La directiva siguió adelante igual. Pero algo raro pasó: el escándalo te motivó tanto que en la siguiente carrera diste la mejor vuelta rápida de la temporada. A veces la rabia también es combustible.' },
    ]
  },
  {
    icon: '🧠', title: 'El bloqueo del Sector 3', desc: 'Después de un susto enorme a alta velocidad en la última curva de un circuito, algo cambió. Tu cabeza sabe que no pasó nada, pero tu pie derecho levanta el acelerador antes de tiempo cada vez que llegás a esa curva. Los ingenieros te preguntan por qué perdés tres décimas ahí. No tienen respuesta técnica.', choices: [
      { text: 'Trabajar con un psicólogo deportivo (-$40,000)', stat: 'speed', delta: 0, money: -40000, skillStat: 'speed', skillBonus: 5, skillFail: -1, hint: '🚀 Velocidad: tu mente puede liberarte o seguir frenándote. El trabajo mental es tan real como el técnico.', successDesc: 'Cuatro semanas de sesiones. Visualización, respiración, exposición gradual. El día que volviste a esa curva a fondo sin pensarlo, el ingeniero no dijo nada. Pero por radio se escuchó: "Vuelta récord del sector, P1." El bloqueo se había ido.', failDesc: 'El psicólogo trabajó, pero los resultados no llegaron a tiempo. Seguiste perdiendo esas décimas durante toda la temporada. El equipo movió el balance para compensar, pero nunca fue lo mismo. Algunas cicatrices llevan su tiempo.' },
      { text: 'Ignorarlo y forzar el límite en entrenamiento', stat: 'speed', delta: 0, money: 0, pureLuck: true, baseBonus: 0.5, skillBonus: 5, skillFail: -4, desc: 'Cara o cruz: o lo superás solo o lo empeorás.', successDesc: 'Frenaste más tarde cada sesión, día tras día. Vuelta 47 del tercer entrenamiento libre. El auto cruzó la curva a tope y algo se desbloqueó en tu cabeza. Era solo velocidad. Solo asfalto. El bloqueo desapareció como si nunca hubiera existido.', failDesc: 'Forzar fue un error. En el cuarto intento, el auto sobregiró y tocaste el muro con el ala trasera. El susto empeoró el bloqueo y lo extendiste a dos curvas rápidas más. Entraste en un círculo vicioso del que te costó meses salir.' },
    ]
  },
  {
    id: 'casino',
    icon: '🎰', title: 'Noche en el Casino de Mónaco', desc: 'Es la noche previa a la clasificación. Tus sponsors organizaron una cena de gala en el Casino de Mónaco. Todo el paddock está ahí. El ambiente es eléctrico, el champán corre y alguien pone fichas frente a vos.', choices: [
      { text: 'Tomarte una copa y retirarte temprano', stat: 'quali', delta: 2, money: 0, hint: 'Resultado fijo: mente fresca para la clasificación (+2 Clasificación).', fixedDesc: 'Una copa de prosecco, conversaciones cortas y a las 23:00 estabas en la cama. A las 10:00 del día siguiente, tu vuelta de clasificación fue la más limpia de todo el año. Mientras otros llegaron con los ojos hinchados, vos llegaste listo.' },
      { text: 'Quedarte hasta las 4am y apostar fuerte', stat: 'quali', delta: 0, money: 0, pureLuck: true, baseBonus: 0.4, skillBonus: -2, skillFail: -5, successMoney: 180000, failMoney: -120000, desc: 'Cara o cruz: podés ganar una fortuna o llegar destrozado a clasificar.', successDesc: 'Blackjack, ruleta, conversaciones con multimillonarios. Ganaste $180.000 en tres horas. Llegaste al circuito con ojeras pero eufórico. Esa energía caótica se tradujo en una vuelta de clasificación salvaje e inesperada. -2 Clasificación por el cansancio, pero $180.000 más en el bolsillo.', failDesc: 'Perdiste $120.000 y llegaste con cuatro horas de sueño. En la Q2, frenaste tarde en el túnel por un microsegundo de reacción lenta. El auto fue al muro. Clasificaste último entre los que pasaron. Una noche cara en todos los sentidos.' },
    ]
  },
  {
    id: 'fuga',
    icon: '📡', title: 'Fuga de datos internos del equipo', desc: 'Un periodista de un medio técnico publicó datos de telemetría que solo podían venir del interior de tu garaje. El equipo está en guerra interna buscando al culpable. La desconfianza lo envenenó todo: los mecánicos hablan poco, los ingenieros se miran de reojo.', choices: [
      { text: 'Ponerte al frente y unir al equipo', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 5, skillFail: -2, hint: '🏎 Clasificación: tu capacidad analítica y técnica es lo que te da autoridad real con los ingenieros.', successDesc: 'Convocaste una reunión informal en el comedor del motorhome. Sin managers, sin directivos. Solo el equipo. Dijiste todo lo que pensabas con claridad y sin señalar a nadie. Dos días después, alguien confesó en privado. El equipo lo procesó internamente. La cohesión volvió, más fuerte que antes.', failDesc: 'Intentaste mediar pero no tenías autoridad real para calmar una guerra interna tan grande. Las tensiones siguieron durante meses. Los ingenieros trabajaban en silos separados. El auto nunca tuvo el setup correcto porque nadie se ponía de acuerdo en nada.' },
      { text: 'Mantenerte al margen y enfocarte solo en el auto', stat: 'speed', delta: 2, money: 0, hint: 'Resultado fijo: mientras el caos rodea al equipo, vos vivís en tu burbuja (+2 Velocidad).', fixedDesc: 'No eras el director del equipo. No ibas a convertirte en mediador. Cerraste la puerta del motorhome, abriste la telemetría y te enfocaste en el setup del auto. El caos siguió afuera. Adentro de tu casco, había calma absoluta. Esa temporada fue una de las más consistentes de tu carrera.' },
    ]
  },
  {
    id: 'peer_choque',
    icon: '💥', title: 'Incidente al límite con {{PEER_NAME}}', desc: 'Vos y {{PEER_NAME}} vienen peleando la misma porción de pista. Llegando a la horquilla, él frena tardísimo y te empuja hacia afuera. Es tu rival generacional, no podés ceder un milímetro.', choices: [
      { text: 'Ir al roce y devolverle la gentileza en la siguiente curva', stat: 'speed', delta: 0, money: -25000, peerRelDelta: -20, pureLuck: true, baseBonus: 0.5, skillBonus: 4, skillFail: -3, successDesc: 'Le devolviste el auto en la siguiente frenada. Hubo toque, saltó fibra de carbono, pero lograste pasar. El público aplaudíó tu agresividad. Él se enfureció.', failDesc: 'Fuiste con demasiada furia. Le pegaste en el pontón lateral y rompiste tu suspensión delantera. Abandono inmediato y penalización.' },
      { text: 'Aflojar, cuidar el auto y quejarte por radio', stat: 'tyres', delta: 2, money: 0, peerRelDelta: -10, hint: 'Resultado fijo: salvás el auto pero la rivalidad se endurece (+2 Gestión).', fixedDesc: 'Levantaste el pie. Sabías que un toque ahí arruinaba la carrera. Llegaste al final y sumaste puntos. La relación con él ahora es hielo puro.' },
    ]
  },
  {
    id: 'peer_amigo',
    icon: '🤝', title: 'Alianza Estratégica con {{PEER_NAME}}', desc: 'En la Q3, en un circuito rapidísimo, vos y {{PEER_NAME}} salen juntos a la pista. Él te ofrece darse rebufo mutuamente para bajar los tiempos y clasificar mas adelante.', choices: [
      { text: 'Aceptar el trato y coordinar en pista', stat: 'quali', delta: 0, money: 0, peerRelDelta: +15, peerRelFailDelta: -15, skillStat: 'quali', skillBonus: 4, skillFail: -2, hint: '🏎 Clasificación: depende de tu capacidad técnica clavar los tiempos con el rebufo.', successDesc: 'Coordinación perfecta. Ambos bajaron tres décimas y clasificaron 3 puestos mas arriba. Al bajarse de los autos, chocaron los puños. Esto es respeto puro.', failDesc: 'Trataste de aprovechar el rebufo, pero frenaste tarde y bloqueaste los neumáticos. Le arruinaste la vuelta a él y perdiste la tuya. La tensión en boxes se corta con un cuchillo.' },
      { text: 'Declinar y enfocarte en tu propia vuelta', stat: 'speed', delta: 1, money: 0, peerRelDelta: -5, hint: 'Resultado fijo: preferís no arriesgar y competir solo (+1 Velocidad).', fixedDesc: 'Le respondiste que preferías aire limpio. La vuelta fue buena pero sin el extra del rebufo. Él se quedó un poco decepcionado.' },
    ]
  },
  {
    id: 'peer_numero1',
    icon: '📦', title: 'Prioridad de Desarrollo', desc: 'El equipo trajo una única mejora aerodinámica al circuito. Como {{PEER_NAME}} viene mejor en los puntos, los directivos deciden dársela a él.', choices: [
      { text: 'Aceptar el rol de escudero', stat: 'speed', delta: -1, money: 100000, repDelta: 30, peerRelDelta: +20, hint: 'Resultado fijo: perdés 1 Velocidad, pero ganás Reputación y Relación (+20).', fixedDesc: 'Aceptaste la decisión por el bien del equipo. Tu auto fue más lento este finde, pero todos valoraron tu madurez.' },
      { text: 'Armar un escándalo y exigir la pieza', stat: 'speed', delta: 1, money: -50000, repDelta: -50, peerRelDelta: -30, hint: 'Resultado fijo: te quedás la mejora (+1 Vel) pero destruís la relación y tu reputación.', fixedDesc: 'Te plantaste en la oficina del jefe y amenazaste con irte. Te dieron la mejora, volaste en pista, pero nadie te felicitó al bajar.' }
    ]
  },
  {
    id: 'peer_wall',
    icon: '🧱', title: 'El Muro en el Box', desc: 'La relación llegó a un punto tan bajo que el equipo levantó un panel en el medio del garaje para separarlos. Para colmo, sus mecánicos encontraron un setup mágico que se niegan a compartirte.', choices: [
      { text: 'Denunciar favoritismo a la prensa', stat: 'speed', delta: 1, money: 0, repDelta: -20, peerRelDelta: -30, hint: 'Resultado fijo: presionás y conseguís el setup (+1 Vel), pero quedás como un llorón y la relación no tiene retorno.', fixedDesc: 'Hiciste un escándalo. La presión mediática obligó al jefe de equipo a pasarte la telemetría. Volaste en pista, pero el ambiente en el garaje es súper tóxico.' },
      { text: 'Descifrarlo con tus propios ingenieros', stat: 'quali', delta: 0, money: 0, peerRelDelta: +5, skillStat: 'quali', skillBonus: 2, skillFail: -2, hint: '🏎 Clasificación: depende de tu capacidad analítica. Si fallás, perdés rendimiento.', successDesc: 'Te encerraste con tus mecánicos y lograron replicar el setup sin ayuda. Clasificaste por delante de él y bajaste del auto pidiéndole silencio a la cámara. Magia pura.', failDesc: 'Trabajar a ciegas fue un error. El auto quedó inmanejable y clasificaste lejísimos. Tu lado del garaje quedó en ridículo.' }
    ]
  },
  {
    icon: '📊', title: 'El dato que nadie vio', desc: 'Durante el análisis del viernes encontrás una anomalía en la telemetría. Es apenas una diferencia de temperatura en una curva, pero podría explicar por qué el auto pierde rendimiento al final de las vueltas.', choices: [
      { text: 'Investigar el dato a fondo', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 3, skillFail: -1, hint: '🏎️ Clasificación: si sabés interpretar los datos, podés encontrar una ventaja escondida.', successDesc: 'Te quedaste hasta entrada la madrugada revisando vuelta por vuelta. Encontraste que el diferencial estaba trabajando fuera de su ventana ideal en una curva específica. El equipo corrigió el problema y el auto ganó unas décimas que nadie esperaba.', failDesc: 'El dato terminó siendo ruido. Pasaste horas buscando una explicación que no existía y llegaste al sábado agotado. El equipo perdió tiempo y no consiguió ninguna mejora real.' },
      { text: 'Ignorarlo y seguir el plan', stat: 'tyres', delta: 1, money: 0, hint: '🛞 Resultado fijo: mantenés el plan conocido y mejorás tu consistencia.', fixedDesc: 'Decidiste no perseguir fantasmas. El equipo siguió con el programa habitual y vos te concentrás en cuidar el auto. No descubriste una revolución, pero completaste el fin de semana sin cometer errores.' }
    ]
  },
  {
    icon: '🌡️', title: 'El calor inesperado', desc: 'La temperatura del asfalto sube muchísimo respecto a lo previsto. Los neumáticos comienzan a degradarse más rápido de lo esperado.', choices: [
      { text: 'Adaptar tu estilo de conducción', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 3, skillFail: -1, hint: '🛞 Gestión: cuanto mejor controles el desgaste, más rápido podrás mantenerte.', successDesc: 'Cambiaste tu estilo curva por curva. Frenadas más suaves, menos deslizamiento y mucha más paciencia en las salidas. Tus neumáticos sobrevivieron varias vueltas más que los de tus rivales.', failDesc: 'Intentaste cambiar tu estilo pero no encontraste el equilibrio. Frenabas demasiado pronto en unas curvas y deslizabas demasiado en otras. Las gomas se destruyeron igualmente.' },
      { text: 'Buscar tiempo a pesar de la degradación', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 3, skillFail: -1, hint: '🚀 Velocidad: mantener el auto al límite con neumáticos degradados requiere mucho control.', successDesc: 'Encontraste el límite exacto entre atacar y destruir las gomas. El auto parecía moverse debajo tuyo, pero conseguías mantener el ritmo. El equipo quedó impresionado con la velocidad que conservaste.', failDesc: 'Intentaste llevar el auto como si los neumáticos estuvieran nuevos. Varias correcciones violentas terminaron sobrecalentando todavía más las gomas y tu ritmo cayó rápidamente.' }
    ]
  },
  {
    icon: '📈', title: 'El último intento', desc: 'Queda una sola vuelta de clasificación. El equipo te pide encontrar al menos dos décimas para entrar en la siguiente sesión.', choices: [
      { text: 'Buscar tiempo en las curvas rápidas', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 3, skillFail: -1, hint: '🚀 Velocidad: las curvas rápidas son donde más tiempo podés encontrar, pero también donde más fácil es equivocarse.', successDesc: 'Te animaste a llevar el auto un poco más allá. Cada curva fue perfecta y encontraste casi cuatro décimas. El equipo pasó a la siguiente sesión gracias a esa vuelta.', failDesc: 'El límite estaba demasiado cerca. Una corrección mínima en una curva rápida te hizo perder toda la vuelta. No hubo segunda oportunidad.' },
      { text: 'Buscar tiempo en las frenadas', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 3, skillFail: -1, hint: '🏎️ Clasificación: frenar exactamente en el límite puede darte las décimas que necesitás.', successDesc: 'Clavaste cada referencia. No parecías estar haciendo nada espectacular, pero frenaste medio metro más tarde en cada curva y la suma fue suficiente para avanzar.', failDesc: 'Una frenada demasiado tardía arruinó la vuelta. Bloqueaste los neumáticos y perdiste más tiempo del que intentabas recuperar.' }
    ]
  },
  {
    id: 'nemesis_tapon',
    icon: '🚫', title: 'El Tapón en Clasificación',
    desc: 'Venís en tu vuelta rápida cuando tu némesis, que ya cerró la suya, va lento por la línea ideal. Es deliberado. Te arruinó el tiempo.',
    nemesisOnly: true,
    choices: [
      { text: 'Reclamar a dirección de carrera', stat: 'quali', delta: 1, repDelta: -15, pers: 'aggressiveness', delta2: -10, hint: 'Resultado fijo: recuperás la posición si la FIA te escucha, pero la prensa te tilda de quejoso.', fixedDesc: 'Llamaste a la radio protestando. Los comisarios revisaron el caso y lo sancionaron con 3 puestos en la parrilla para la carrera. Ganaste la posición, pero todos en el paddock notaron que fuiste a llorarle a los jueces.' },
      { text: 'Bloquearlo en su siguiente intento', stat: 'speed', delta: 0, skillStat: 'overtake', skillBonus: 2, skillFail: -2, repDelta: 15, pers: 'aggressiveness', delta2: 20, hint: '⚔️ Riesgo de penalización, pero ganás la reputación de que no te dejás pisotear.', successDesc: 'Te quedaste en pista y cuando lo tuviste detrás, redujiste la velocidad exactamente en el peor momento para él. Le arruinaste la vuelta. El paddock vio la maniobra y algunos sonrieron.', failDesc: 'Intentaste el bloqueo pero los comisarios te vieron primero. Penalización en la grilla. Él clasificó por delante y disfrutó cada segundo.' }
    ]
  },
  {
    id: 'nemesis_reglajes',
    icon: '🗺️', title: 'El Mapa Prohibido',
    desc: 'Tu némesis encontró una correlación aerodinámica mágica en su lado del box. Sus ingenieros le prohíben compartirla con vos. La diferencia en pista es evidente.',
    nemesisTeammateOnly: true,
    choices: [
      { text: 'Acceder a la red interna del equipo', stat: 'quali', delta: 0, skillStat: 'quali', skillBonus: 3, skillFail: -2, money: 0, repDelta: 0, hint: '🔓 Classificación: si lo lográs, ganás una ventaja real. Si te descubren, el escándalo destruye tu reputación.', successDesc: 'Te las ingeniaste para acceder a los logs de telemetría de su lado. Encontraste el parámetro clave. Desde ese fin de semana, tu auto respondió distinto. Solo vos sabés por qué.', failDesc: 'El jefe de TI del equipo detectó el intento de acceso en minutos. El equipo te multó con el salario de un mes y prohibió que tus ingenieros toquen la red compartida.' },
      { text: 'Trabajar a ciegas con tus mecánicos', stat: 'speed', delta: 0, skillStat: 'speed', skillBonus: 3, skillFail: -1, hint: '🔧 Velocidad: si tu intuición técnica es buena, podés llegar a la misma solución por tu cuenta.', successDesc: 'Pasaste horas en el box con tus mecánicos, ajustando milímetros sin saber qué buscabas exactamente. De repente, el auto cargó diferente en la curva 3. Lo habías encontrado. El jefe de equipo anotó algo en su libreta.', failDesc: 'Trabajar sin referencia fue frustrante. Probaste veinte configuraciones y ninguna funcionó. Saliste a clasificar con el auto como lo recibiste. Él fue cuatro décimas más rápido.' }
    ]
  },
  {
    id: 'nemesis_academy_sim',
    icon: '💻', title: 'Duelo en el Simulador',
    desc: 'El director de tu academia organizó una sesión de simulador en la base. Tu némesis y vos deben probar las actualizaciones del F1 del equipo mayor. Hay mucha tensión.',
    requireAcademyNemesis: true,
    choices: [
      { text: 'Conducir al límite para humillarlo', stat: 'speed', delta: 1, repDelta: 10, pers: 'aggressiveness', delta2: 15, skillStat: 'quali', skillBonus: 1, skillFail: -1, hint: '✅ Ganás respeto si sos más rápido, pero podés chocar el simulador.', successDesc: 'Marcaste un tiempo medio segundo más rápido que él. El director de la academia sonrió. Tu némesis se fue sin saludar.', failDesc: 'Fuiste tan al límite que terminaste chocando el simulador virtual en la vuelta rápida. El equipo principal no quedó muy contento.' },
      { text: 'Probar configuraciones para el equipo', stat: 'team', delta: 1, repDelta: 15, pers: 'team', delta2: 20, hint: 'Resultado fijo: sumás muchos puntos con los jefes de la academia.', fixedDesc: 'Mientras él intentaba hacer la vuelta rápida, vos te dedicaste a dar feedback técnico útil. Los ingenieros del equipo de F1 anotaron tu nombre. Él ganó el cronómetro, vos te ganaste a los jefes.' }
    ]
  },
  {
    id: 'nemesis_academy_seat',
    icon: '🪑', title: 'El Asiento Prometido',
    desc: 'Rumores en el paddock: la academia solo tiene un asiento libre en F1 para el año que viene, y se lo van a dar al que termine mejor esta temporada entre tu némesis y vos.',
    requireAcademyNemesis: true,
    choices: [
      { text: '"Ese asiento es mío"', stat: 'quali', delta: 1, repDelta: 5, pers: 'aggressiveness', delta2: 20, hint: 'Aumentás tu confianza y agresividad de cara a la temporada.', fixedDesc: '"Que se busque lugar en otra categoría, porque el asiento de F1 ya tiene mi nombre." Tus declaraciones encendieron aún más el campeonato.' },
      { text: '"Que gane el mejor en pista"', stat: 'tyres', delta: 1, repDelta: 20, pers: 'media', delta2: 15, hint: 'Respuesta diplomática, sumás reputación.', fixedDesc: '"Los dos somos grandes pilotos y la academia tiene suerte de tenernos. Daremos el 100% y los jefes decidirán." Quedaste como un profesional absoluto ante la prensa.' }
    ]
  },
  {
    id: 'junior_rival_spark',
    icon: '🗯️', title: 'Roces de Paddock',
    desc: 'Un piloto destacado de tu misma categoría lleva un par de carreras cerrándote la línea de forma peligrosa. Hoy en el paddock hizo un comentario soberbio frente a todos.',
    minCat: 0,
    maxCat: 4, // Solo categorías formativas
    choices: [
      { text: 'Ignorarlo y hablar en la pista', stat: 'quali', delta: 1, repDelta: 10, hint: 'Resultado fijo: sumás reputación por tu madurez, pero no demostras agresividad.', fixedDesc: 'Seguiste de largo sin mirarlo. Los periodistas valoraron tu madurez y te enfocaste en tu ritmo de clasificación, pero él sigue sintiéndose superior.' },
      { text: 'Enfrentarlo públicamente', stat: 'speed', delta: 0, pers: 'aggressiveness', delta2: 25, repDelta: -10, nemesisSpark: true, hint: '🔥 +Agresividad masiva. Nace una gran rivalidad.', fixedDesc: 'Lo frenaste en seco adelante de las cámaras. Se dijeron de todo. Tu agresividad se disparó y el paddock ya eligió bandos. La próxima carrera va a ser una guerra.' }
    ]
  }
];


const MINIGAMES = [
  {
    id: 'midfield',
    icon: '🛡️', title: 'Defendiendo los puntos', desc: 'Estás décimo. Un auto más rápido viene detrás a falta de 3 vueltas.', choices: [
      { text: 'Defender cada curva agresivamente', skillStat: 'overtake', baseBonus: 0.2, statBonus: 0.35, noWinOnSuccess: true, desc: 'Adelantamientos: defender es igual a atacar.', successDesc: 'Le cerraste la puerta vuelta tras vuelta. Terminaste décimo y el garaje lo festejó como una victoria. ¡Sumaste puntos valiosos!', failDesc: 'Te pasó por afuera en la última vuelta. Perdiste el punto y terminaste 11mo. Así es la zona media.' },
      { text: 'Cuidar las gomas y traccionar mejor', skillStat: 'tyres', baseBonus: 0.35, statBonus: 0.2, noWinOnSuccess: true, desc: 'Gestión: salir rápido de las curvas lentas.', successDesc: 'Traccionaste perfecto en cada salida. Él tenía DRS pero no le alcanzó la recta para pasarte. Puntos a casa.', failDesc: 'Tus gomas cedieron en el último sector. Un pequeño derrape fue suficiente para que te pasara sin esfuerzo.' },
    ]
  },
  {
    id: 'midfield',
    icon: '⏱️', title: 'Heroicidad en Clasificación', desc: 'Llegaste a la Q2 de milagro. Las condiciones de pista mejoran rápido y te la jugás a pasar a Q3 con un auto inferior.', choices: [
      { text: 'Frenar más tarde en el tercer sector', skillStat: 'quali', baseBonus: 0.2, statBonus: 0.4, noWinOnSuccess: true, desc: 'Clasificación: riesgo puro para ganar décimas.', successDesc: '¡Magia pura! Pasaste a Q3 y largás noveno. Una locura en el box.', failDesc: 'Te pasaste de frenada y terminaste en la leca. Largás 15to.' },
      { text: 'Usar el mapa de motor más agresivo', pureLuck: true, baseBonus: 0.4, noWinOnSuccess: true, desc: 'Pura Suerte: exprimir el motor al máximo.', successDesc: 'El motor aguantó y el empuje extra te dejó décimo por dos milésimas. ¡A Q3!', failDesc: 'El motor dio un tirón feo y perdiste medio segundo. Quedaste eliminado y preocupado por la fiabilidad.' },
    ]
  },
  {
    id: 'midfield',
    icon: '🚨', title: 'Lotería del Safety Car', desc: 'Accidente fuerte adelante. Sale el Auto de Seguridad. Vos tenes gomas para seguir hasta el final.', choices: [
      { text: 'Parar igual y salir a atacar', skillStat: 'overtake', baseBonus: 0.25, statBonus: 0.35, noWinOnSuccess: true, desc: 'Adelantamientos: aprovechar gomas frescas en la relanzada.', successDesc: 'Saliste 8vo con gomas frescas. Te comiste a dos más en la relanzada. ¡Puntazos!', failDesc: 'Saliste bien pero te emocionaste en la relanzada y tocaste a otro auto. Alerón roto, a boxes de nuevo.' },
      { text: 'Quedarte afuera y aguantar hasta el final', skillStat: 'tyres', baseBonus: 0.3, statBonus: 0.3, noWinOnSuccess: true, desc: 'Gestión: aprovechar que los demas paran y ganar posiciones.', successDesc: 'Te quedaste afuera mientras todos paraban. Subiste hasta el 7mo y después defendiste como pudiste. ¡Puntos enormes!', failDesc: 'Te quedaste afuera y subiste posiciones, pero la diferencia de neumaticos era mucha. Cuando la carrera volvió a ritmo normal, te pasaron uno tras otro.' },
    ]
  },
  {
    id: 'midfield',
    icon: '🎲', title: 'Tirada de Dados Estratégica', desc: 'Estás estancado en el puesto 14. El ingeniero te propone ir a una parada menos que el resto.', choices: [
      { text: 'Cuidar gomas a niveles extremos', skillStat: 'tyres', baseBonus: 0.2, statBonus: 0.45, noWinOnSuccess: true, desc: 'Gestión: paciencia zen para que la táctica funcione.', successDesc: 'Paciencia zen. Llegaste al final con las telas pero 9no. El equipo te ovaciona por la radio.', failDesc: 'Imposible. Tuviste que parar igual y terminaste 16to.' },
      { text: 'Ignorar el plan y pedir blandas para volar', skillStat: 'speed', baseBonus: 0.2, statBonus: 0.4, noWinOnSuccess: true, desc: 'Velocidad: ir a fondo cortando por lo sano.', successDesc: 'Paraste, pusiste blandas y empezaste a volar. Pasaste a cuatro autos y entraste en los puntos en la última curva.', failDesc: 'Volaste un rato pero te estancaste. La estrategia agresiva no rindió.' },
    ]
  },
  {
    icon: '🏁', title: '¡Última vuelta por la victoria!', desc: 'Estás a 0.5 segundos del líder. Última vuelta. Decidí bien.', choices: [
      { text: 'Frenar tardísimo en la primera curva', skillStat: 'speed', baseBonus: 0.15, statBonus: 0.50, desc: 'Velocidad pura: el que más aprieta gana.', successDesc: 'Frenaste 20 metros más tarde que nadie. El auto patinaba pero se mantuvo. Lo metiste adentro y cruzaste la línea con 0.08 segundos de ventaja. Esa maniobra sale en todas las repeticiones de TV.', failDesc: 'El auto fue recto. Bloqueo de ruedas, pista afuera y el líder te pasó por izquierda. Tan cerca, y tan lejos.' },
      { text: 'Esperar la recta final y dar todo', skillStat: 'quali', baseBonus: 0.3, statBonus: 0.3, desc: 'Clasificación: sabés exactamente dónde atacar.', successDesc: 'Cerraste la DRS en la recta. El rebufo fue perfecto. En el punto de frenada exacto, te fuiste por dentro. Lo pasás limpio y llegaste primero sin tocar nada. Clásico.', failDesc: 'El hueco no se abrió. El líder defendíó su línea y no tuviste espacio. Cruzaste segundo a 0.14 segundos. Así es la Fórmula 1.' },
      { text: 'Arriesás por afuera en la chicana', skillStat: 'overtake', baseBonus: 0.1, statBonus: 0.55, desc: 'Adelantamiento supremo: el más arriesgado.', successDesc: 'Él no lo esperó por afuera. Te fuiste al límite del asfalto, casi tocando el pasto, y saliste más rápido de la chicana. Victoria de las que se recuerdan décadas.', failDesc: 'No había espacio suficiente. Tocaste su rueda trasera en el apex, perdiste el aile y cruzaste cuarto. Un riesgo que no salió bien.' },
    ]
  },
  {
    icon: '🌧️', title: 'Lluvia inesperada a 5 vueltas del final', desc: 'Pista mojándose. Todos están en slicks. Cada segundo cuenta.', radioMsg: '"Piloto, acá el muro. Pista mojándose rápido, 5 vueltas para el final. Necesito tu lectura: ¿entrás a cambiar o aguantás afuera? Decidí ya, no hay tiempo."', choices: [
      { text: 'Entrar a boxes para gomas de lluvia', skillStat: 'rain', baseBonus: 0.25, statBonus: 0.45, desc: 'Mojado es tu ambiente.', successDesc: 'El cambio fue rápido. Saliste en lluvia y en la primera vuelta afuera ya le habías sacado 4 segundos a los que se quedaron afuera. Remontaste cinco posiciones en tres vueltas.', failDesc: 'El pit fue lento y saliste en tráfico. Para cuando las gomas calentaron, la lluvia amáinó. Todos los que se quedaron afuera llegaron mejor que vos.' },
      { text: 'Seguir en pista y ajustar el frenado', skillStat: 'tyres', baseBonus: 0.2, statBonus: 0.4, desc: 'Gestionar slicks en agua es arte.', successDesc: 'Frenabas 40 metros antes que todos, pero cuánto antes era el secreto. Encontraste el ritmo exacto y mientras todos caían en slicks, vos sumabas posiciones sin pisar el mojado directo.', failDesc: 'La pista estaba demasiado mojada para aguantar. Perdiste el tren trasero en la curva 8 y tocaste el borde interior. Giraste en pista y perdiste cinco posiciones.' },
      { text: 'Comunicar en tiempo real con el muro', skillStat: 'quali', baseBonus: 0.3, statBonus: 0.2, desc: 'Tu lectura técnica puede salvar la carrera.', successDesc: 'Pediste datos al muro y le dijiste exactamente qué surgías. La decisión fue conjunta y fue la correcta. Terminaste cuarto ganando tres posiciones. Trabajo en equipo.', failDesc: 'El muro tardó demasiado en darte respuesta. Para cuando tomaste la decisión, los demás ya habían entrado o aguantado y vos quedaste en tierra de nadie.' },
    ]
  },
  {
    icon: '🔧', title: 'Problemas de frenos a mitad de carrera', desc: 'El pedal está yendo al fondo. ¿Qué hacés?', radioMsg: '"Piloto, tenemos un problema de presión en los frenos. El pedal está cediendo. Necesito que me digas exactamente qué sentís ahí adentro. ¿Cómo está la mordida? ¿Entramos o seguís?"', choices: [
      { text: 'Gestionar frenando más temprano', skillStat: 'tyres', baseBonus: 0.35, noWinOnSuccess: true, statBonus: 0.3, desc: 'Gestión te permite llegar al final.', successDesc: 'Adaptaste todos tus puntos de frenada. Pudiste terminar la carrera sin abandonar y sumaste buenos puntos.', failDesc: 'Frenaste antes, pero no alcanzó. En la vuelta 38 el pedal tocó el piso directo. La bandera de avería mecánica fue inevitable.' },
      { text: 'Atacar igual con frenadas minimizadas', skillStat: 'speed', baseBonus: 0.1, statBonus: 0.4, desc: 'Velocidad pura: ignorar el problema y apretar por la victoria.', successDesc: 'Convertiste el problema en arma. Sin usar los frenos convencionales, usabas el motor y las curvas lentas para frenar. Llegaste al final en un manejo impecablemente creativo.', failDesc: 'Vuelta 42, curva 1. El auto no paró. Fuiste derecho al box de escape. Retiro mécanico. El ingeniero prefirió no preguntar qué pensabas.' },
      { text: 'Entrar a boxes para ajuste rápido', skillStat: 'quali', baseBonus: 0.25, statBonus: 0.25, desc: 'Técnica: sabés qué pedirle al equipo.', successDesc: 'Describiste exactamente lo que sentías. El mecánico ajustó el bias trasero en 2 segundos. Saliste de boxes con un auto diferente y recuperaste cuatro posiciones en las últimas vueltas.', failDesc: 'El stop fue largo. El ajuste no era el que pedías y tuviste que entrar de vuelta una vuelta más adelante. Salió fuera de los puntos.' },
    ]
  },
  {
    icon: '⚔️', title: 'Duelo épico por la victoria', desc: 'Dos vueltas restantes. Tus rivales están pegados atrás tuyo.', choices: [
      { text: 'Defender agresivamente la posición', skillStat: 'overtake', baseBonus: 0.2, statBonus: 0.35, desc: 'Adelantamientos: defendé como sabés atacar.', successDesc: 'Mandaste a uno largo en la frenada y cerraste la puerta al siguiente. Te defendiste de cada ataque sin dejar un solo hueco. En el último sector, miraste por los espejos y los viste quedarse atrás. Defensa perfecta. Victoria tuya.', failDesc: 'Una defensa demasiado agresiva. Trompeaste y te pasaron varios. la victoria se convierte en cuarto lugar.' },
      { text: 'Confiar en el ritmo y ser limpio', skillStat: 'tyres', baseBonus: 0.35, statBonus: 0.2, desc: 'Gestión: gomas frescas ganan al final.', successDesc: 'No te moviste. Manejaste tu ritmo, dejaste que ellos desgastaran sus gomas presíonándote. En la última vuelta, sus ruedas ya no respondían. la victoria fue tuya sin dramas.', failDesc: 'Tus gomas tampoco aguantaron. Perdiste la defensa en la curva 12 del último sector. Demasiado justo al límite.' },
      { text: 'Abrir un hueco con frenada tardía', skillStat: 'speed', baseBonus: 0.15, statBonus: 0.45, desc: 'Velocidad: sorprender con pura potencia.', successDesc: 'Frenaste tardísimo en la curva más lenta y te tiraste por el hueco justo antes de que pudiera cerrarlo. Saliste de la curva con dos cuerpos de ventaja y, a partir de ahí, ya no te alcanzaron', failDesc: 'Frenaste demasiado tarde. Te fuiste largo, te pasaron por adentro. Perdiste la victoria en la penúltima vuelta.' },
    ]
  },
  {
    icon: '🏎️', title: 'Safety Car sale con 3 vueltas restantes', desc: 'El campo se agrupa. Momentazo para el final de carrera.', radioMsg: '"Piloto, Safety Car en pista, 3 vueltas para el final. El campo se cierra. Esto se decide en el restart — en cómo salgás vos. Dame tu plan ya."', choices: [
      { text: 'Atacar más fuerte que nadie al restart', skillStat: 'overtake', baseBonus: 0.2, statBonus: 0.45, desc: 'Los mejores adelantadores dominan restarts.', successDesc: 'En la línea del Safety Car, arrancaste antes que nadie. El de adelante no reaccionó y lo pasaste en la primera chicana. Desde ese punto, nadie te alcanzó.', failDesc: 'Adelantaste la línea del restart. La dirección de carrera te notificó: penalización de 5 segundos. El agarre del restart te costó el resultado.' },
      { text: 'Salir perfecto de la chicana de salida', skillStat: 'quali', baseBonus: 0.3, statBonus: 0.3, desc: 'Técnica de clasificación: la salida lo decide.', successDesc: 'Salió el SC y tomaste la mejor línea de salida que existía. Tres autos pasaron por fuera tuyo pero vos llevabas más velocidad en la salida de curva. Perdiste una y ganaste dos en el mismo movimiento.', failDesc: 'El de adelante apretó el freno antes de la línea. Tuviste que pegar un frenazo y perdiste todo el impulso. Los de atrás te pasaron como si estuvieras parado.' },
      { text: 'Defender la posición y aguantar', skillStat: 'tyres', baseBonus: 0.35, statBonus: 0.15, desc: 'Gestión: preservar gomas para resistir.', successDesc: 'Tres vueltas de ataque constante desde atrás. Pero tus gomas aguantaron. Cada vuelta que pasaba ellos se desesperaban más y vos más tranquilo. Bandera a cuadros, posición mantenida.', failDesc: 'Los tres últimos ataques erosionaron tus gomas. En la última vuelta no podías defender más. Pasaste quinto al cuarto, pero perdiste dos puestos en el último sector.' },
    ]
  },
  {
    icon: '⚽', title: '¿Entrar a cambiar gomas a mitad de carrera?', desc: 'Tu rival directo acaba de parar. Tenés gomas desgastadas pero estás adelante.', radioMsg: '"Piloto, el 47 ya entró a boxes. Vos seguís afuera con gomas que ya andan al límite. Te doy los datos: podés evitar su undercut o intentar el overcut. ¿Qué elegís?"', choices: [
      { text: 'Parar y evitar su undercut (gomas frescas)', skillStat: 'speed', baseBonus: 0.25, statBonus: 0.35, desc: 'Velocidad con gomas frescas = ventaja.', successDesc: 'El pit fue impecable. 2.3 segundos y afuera. Las gomas frescas te dieron 1.5 segundos por vuelta. Recuperaste la posición en cuatro vueltas y te alejaste.', failDesc: 'El pit fue lento: 4.8 segundos. Saliste detrás de él y tus gomas nuevas nunca calentaron bien en ese stint. Oportunidad perdida.' },
      { text: 'Quedarte afuera y aguantar (overcut)', skillStat: 'tyres', baseBonus: 0.2, statBonus: 0.4, desc: 'Gestionar gomas al límite requiere maestría.', successDesc: 'Vuelta a vuelta, exprimiós cada milímetro de goma. Cuando él salió de boxes, ya le habías sacado el tiempo suficiente para que su parada no sirviera. Ganaste la posición sin siquiera moverte del frente.', failDesc: 'Las gomas ya no respondían. En la vuelta 34 empezaste a perder más de un segundo por vuelta. Cuando finalmente paraste, saliste detrás de dos pilotos más.' },
      { text: 'Esperar unas vueltas y decidir con los datos', skillStat: 'quali', baseBonus: 0.3, statBonus: 0.25, desc: 'La técnica correcta en el momento correcto.', successDesc: 'Pediste los datos exactos: degradación de tu goma, velocidad del rival saliendo de boxes, y el tráfico. Con esa información, la decisión fue obvia. Y fue correcta.', failDesc: 'Los datos llegaron con un retraso de dos vueltas. Para cuando decidiste, la ventana de oportunidad ya se había cerrado y terminaste tomando la peor decisión posible.' },
    ]
  },
  {
    icon: '🌞', title: 'Carrera en circuito callejero, calor extremo', desc: 'Asfalto ardiente, muros cerca y tus rivales nerviosos.', choices: [
      { text: 'Atacar en las frenadas, donde más se gana', skillStat: 'overtake', baseBonus: 0.2, statBonus: 0.45, desc: 'Las calles premian al audaz.', successDesc: 'Primera frenada, dos adelantamientos. Cuarta vuelta, otro más. Las calles estrechas de Macao te favorecieron y terminaste con cuatro adelantamientos en carrera. El presentador no podía creerlo.', failDesc: 'Frenada demasiado ambiciosa en la chicana, tocaste el borde del muro exterior y el alerón delantero se rompió. Pit de emergencia y carrera terminada para los puntos.' },
      { text: 'Cuidar los neumáticos para el final', skillStat: 'tyres', baseBonus: 0.3, statBonus: 0.3, desc: 'El calor destruye gomas rápido.', successDesc: 'Mientras todos degradaban en el calor extremo, vos administrabas. En las últimas 10 vueltas pasaste cuatro autos que ya no podían girar. La paciencia fue tu velocidad.', failDesc: 'Las gomas no aguantaron ni con tu mejor cuidado. A 40°C de asfalto, no había quien las salvara. Terminaste igual que los que atacaron.' },
      { text: 'Clasificar bien y abrir ventaja inicial', skillStat: 'quali', baseBonus: 0.25, statBonus: 0.3, desc: 'En calles, la pole es oro.', successDesc: 'El primer sector fue tuyo. Con un segundo de ventaja en la primera vuelta, pudiste manejar tus propios tiempos y nunca tuviste que defender ni atacar. Gestionás una carrera perfecta desde adelante.', failDesc: 'La salida no fue perfecta y perdiste la ventaja de posición. En calles es casi imposible adelantar, así que lo que perdiste en la primera vuelta no lo recuperaste más.' },
    ]
  },
  {
    icon: '🎀', title: 'Oportunidad de adelantamiento', hidePct: true, desc: 'Tenés rebufo y llegás rapidísimo a la zona de frenada. El piloto de adelante duda.', choices: [
      { text: 'Tirarte por el interior (Derecha)', pureLuck: true, baseBonus: 0.40, desc: 'Apostar al interior ciegamente. Si te cierra la puerta, chocás.', successDesc: 'La puerta estaba apenas abierta. Te metiste igual. Tocó algo de fibra de carbono pero no lo suficiente. Saliste del interior primero y no hubo pelea.', failDesc: 'Te cerró la puerta. Golpe en el alerón, daño y los dos al pasto. La dirección de carrera no tardó en investigar.' },
      { text: 'Ir por el exterior (Izquierda)', pureLuck: true, baseBonus: 0.40, desc: 'Arriesgar por fuera. Podés quedarte sin pista o hacer una genialidad.', successDesc: 'Se quedó en el interior y te dejó el exterior libre. Con la velocidad que traías, saliste de la curva 1.5 segundos adelante. Genialidad pura.', failDesc: 'Te empujó hacia afuera del asfalto. Rodaste por la grava y cuando volviste estabas décimo. La radio del ingeniero estuvo en silencio varios segundos.' },
      { text: 'No arriesgar y frenar', pureLuck: true, baseBonus: 0.10, neutralFail: true, desc: 'Llegar sano en tu posición o esperar a que el de adelante se equivoque.', successDesc: 'Frenaste conservando el auto y el de adelante, por mirar los espejos, se pasó de largo en la curva. Heredaste la posición gratis.', failDesc: 'Frenaste a tiempo. No pasó nada, cruzaste la meta en la posición que estabas sin tomar riesgos.' },
    ]
  },
  {
    icon: '🎀', title: 'Ruleta de la fiabilidad (Pura Suerte)', desc: 'El motor se comporta raro.', radioMsg: '"Piloto, acá ing. Park. Tenemos alertas raras en el motor desde la vuelta 38. Todavía no sabemos qué es. ¿Querés que bajes modo o seguís apretando y vemos qué pasa?"', choices: [
      { text: 'Ignorar y seguir apretando', pureLuck: true, baseBonus: 0.50, desc: 'Cara o cruz: ganás ritmo o expotás el motor.', successDesc: 'Las alertas eran falsas. El motor aguantó las últimas vueltas y terminaste sin ningún problema. A veces hay que confiar en el auto.', failDesc: 'Vuelta 54. El motor expotó en la recta más larga. Columna de humo blanco. Retiro mécanico desde la primera curva. Las alertas no eran falsas.', onFailDnf: true },
      { text: 'Bajar la potencia y rezar', pureLuck: true, baseBonus: 0.90, noWinOnSuccess: true, desc: 'Muy probable que llegues, pero perdés chances de atacar.', successDesc: 'Llegaste. Sin el ritmo para atacar, pero llegaste. El motor pudo aguantar, puntos asegurados.', failDesc: 'Incluso en modo bajo consumo, el motor no aguantó. Se apagó solo en la vuelta 58. El motor iba a romperse sin importar nada.', onFailDnf: true },
    ]
  },
  {
    id: 'peer_ordenes',
    icon: '📻', title: '"Multi 21" - Órdenes de equipo', desc: 'Tu compañero de equipo viene muy pegado atrás con mejor ritmo.', radioMsg: '"Piloto, muro. Necesito que dejes pasar al {{PEER_NAME}}. Tiene mejor estrategia de gomas desde acá. Es decisión de equipo. Confirmá recepción."', choices: [
      { text: 'Acatar la orden y dejarlo pasar', pureLuck: true, baseBonus: 1.0, noWinOnSuccess: true, peerRelDelta: +15, repDelta: +20, wasEscudero: true, successDesc: 'Levantaste el pie en la recta. El equipo te agradeció y sumaste puntos vitales para los constructores. Eres un jugador de equipo.', failDesc: 'Levantaste el pie.' },
      { text: 'Ignorar la radio y apretar el ritmo', skillStat: 'overtake', statBonus: 0.8, baseBonus: 0.2, noWinOnSuccess: true, onFailDnf: 0.5, peerRelDelta: -30, repDelta: -40, failDesc: 'Lo ignoraste, pero él se tiró igual por adentro. ¡Toque entre compañeros! Los dos afuera. El jefe de equipo está furioso.', failSurviveDesc: 'Lo ignoraste, él intentó pasar pero aflojó a último momento. Conservaste la posición, pero el clima en boxes es cortante (-10 Relación, -10 Reputación).', successDesc: 'Fingiste que no escuchabas, bajaste los tiempos y te escapaste. El equipo no pudo decir nada al verte cruzar la meta primero.' }
    ]
  },
  {
    id: 'peer_brake_test',
    icon: '🛑', title: 'Brake Test Bajo Safety Car', desc: 'La tensión es máxima. Están detrás del Auto de Seguridad.', radioMsg: '"¡PILOTO, CUIDADO! {{PEER_NAME}} FRENÓ FUERTE AHORA MISMO DELANTE TUYO. ¡REACCIONÁ!"', choices: [
      { text: 'Volantazo ciego', pureLuck: true, baseBonus: 0.5, noWinOnSuccess: true, onFailDnf: true, repDelta: +10, failDesc: 'Pegaste el volantazo pero enganchaste su rueda trasera y terminaste contra el muro. Abandono absurdo.', successDesc: 'Tus reflejos salvaron el auto por milímetros. Pasaste por al lado y le hiciste un gesto a la cámara. ¡Reflejos de gato!' },
      { text: 'Frenar a fondo en línea recta', pureLuck: true, baseBonus: 0.5, noWinOnSuccess: true, onFailDnf: true, repDelta: +10, failDesc: 'No llegaste a frenar. Le destruiste el alerón trasero y rompiste tu suspensión. Los dos afuera.', successDesc: 'Clavaste los frenos y te detuviste a un milímetro de su caja de cambios. Hubo humo, pero no contacto.' }
    ]
  },
  {
    id: 'peer_double_stack',
    icon: '🌧️', title: 'Caos en los Boxes', desc: 'Empieza a llover fuerte a mitad de carrera. El equipo llama a {{PEER_NAME}} a boxes primero para poner intermedias.', radioMsg: '"Piloto, boxea {{PEER_NAME}} en esta vuelta, vos quedate en pista una vuelta mas. No podemos atender a los dos a la vez, repito, no entres a boxes."', choices: [
      { text: 'Acatar y sobrevivir con gomas de seco', skillStat: 'rain', statBonus: 0.8, baseBonus: 0.1, noWinOnSuccess: true, onFailDnf: true, repDelta: +10, peerRelDelta: +10, successDesc: 'Patinaste toda la vuelta pero lograste sobrevivir gracias a tu tacto bajo el agua. Perdiste mucho tiempo y la chance de ganar, pero el equipo apreció tu disciplina.', failDesc: 'Imposible. Tocaste la línea blanca, hiciste un trompo y terminaste en el muro. Carrera arruinada.' },
      { text: 'Tirarte a boxes forzando el Double Stack', pureLuck: true, baseBonus: 0.8, noWinOnSuccess: true, repDelta: -15, peerRelDelta: -10, successDesc: 'Te mandaste a boxes. Los mecánicos tuvieron que atenderte mientras tu compañero esperaba atrás perdiendo valiosos segundos. Le arruinaste la carrera a él, pero vos volaste. El garaje arde.', failDesc: 'Te metiste a la fuerza pero no tenían tus gomas listas. Perdiste 15 segundos y arruinaste la carrera de ambos. Papelón total.' }
    ]
  },
  {
    id: 'peer_turn_1',
    icon: '🚦', title: 'Primera vuelta, primera curva', desc: 'Clasificaron en la misma fila. Las luces se apagan y vos y {{PEER_NAME}} llegan emparejados a la Curva 1. Él tiene la cuerda por adentro.', radioMsg: '"Piloto, buena largada. Recuerden: corremos para el equipo, nada de estupideces en la curva 1."', choices: [
      { text: 'Aflojar y no arriesgar de mas', pureLuck: true, baseBonus: 0.95, noWinOnSuccess: true, repDelta: +15, peerRelDelta: +10, successDesc: 'Aflojaste lo justo para acomodarte detrás de él. El muro respiró aliviado. Sobrevivieron ambos a una largada caotica.', failDesc: 'Levantaste de más, patinaste en lo sucio y te pasaron dos autos por afuera. Al menos los autos volvieron sanos.' },
      { text: 'Estirar la frenada por fuera', skillStat: 'overtake', statBonus: 0.7, baseBonus: 0.1, noWinOnSuccess: true, onFailDnf: true, repDelta: -10, peerRelDelta: -10, successDesc: '¡Agresividad pura! Estiraste la frenada al límite por fuera, rozaste su neumático pero te quedaste con la posicion. Un adelantamiento de campeón que silenció al garaje. Quedaste mejor posicionado para el resto de la carrera.', failDesc: 'Cero margen. Sus ruedas se engancharon y saliste despedido hacia la leca, llevándotelo puesto. Los dos autos destruidos en la primera curva. Papelón histórico.' }
    ]
  },
  {
    id: 'peer_defense',
    icon: '🛡️', title: 'El Ministro de Defensa', desc: 'Tu compañero esta por delante tuyo. Vos venís segundo y detrás tenés un auto más rápido pisándote los talones.', radioMsg: '"Piloto, necesitamos que retengas al grupo de atrás. Repito, hacete ancho. {{PEER_NAME}} necesita 3 segundos de ventaja para asegurar los puntos."', choices: [
      { text: 'Defender como un león', skillStat: 'tyres', statBonus: 0.8, baseBonus: 0.1, noWinOnSuccess: true, repDelta: +20, peerRelDelta: +30, onFailDnf: 0.3, successDesc: 'Te convertiste en una muralla. Aguantaste los ataques arruinando tus propias gomas. Tu compañero termino mas adelante de lo esperado y te lo agradeció por radio. Héroe del equipo.', failDesc: 'Intentaste defender pero te quedaste sin gomas. Te pasaron a vos y terminaron cazando a tu compañero también. Un desastre para el equipo.' },
      { text: 'Ignorar y atacar a tu compañero', skillStat: 'overtake', statBonus: 0.8, baseBonus: 0.1, noWinOnSuccess: true, repDelta: -15, peerRelDelta: -30, successDesc: 'Respondiste "No soy el guardaespaldas de nadie". Pasaste a tu compañero y terminaste por delante de él. {{PEER_NAME}} terminó siendo rebasado por los demas y la escuderia sumó menos puntos de los que deberia.', failDesc: 'Intentaste atacar a tu compañero pero perdiste tracción. Te pasaron los de atrás y perdiste varias posiciones. El equipo te soltó la mano.' }
    ]
  },
  {
    icon: '💥',
    title: 'Contacto peleando la victoria',
    desc: 'Tu rival te tocó en la curva anterior. El auto parece seguir entero, pero algo no se siente igual.',
    choices: [
      { text: 'Seguir atacando como si nada', skillStat: 'speed', baseBonus: 0.15, statBonus: 0.55, desc: 'Velocidad: ignorar el daño y mantener el ritmo.', successDesc: 'El auto estaba mucho mejor de lo que parecía. Seguiste atacando y ganaste la carrera.', failDesc: 'El daño era peor de lo que pensabas. En la siguiente curva el auto se volvió impredecible y perdiste varias posiciones.' },
      { text: 'Adaptar la conducción al comportamiento del auto', skillStat: 'tyres', baseBonus: 0.25, statBonus: 0.45,desc: 'Gestión: adaptarte a un auto que ya no responde igual.', successDesc: 'Entendiste inmediatamente qué había cambiado. Modificaste tus trazadas y llevaste el auto al limite para ganar.', failDesc: 'Intentaste adaptarte pero nunca encontraste el nuevo límite. Cada curva era una lucha.' }
    ]
  },
    {
    icon: '🏎️',
    title: 'Tráfico en Clasificación',
    desc: 'Estás en tu vuelta rápida y encontrás tres autos lentos en el último sector.',
    choices: [
      { text: 'Pasarlos todos sin levantar', skillStat: 'quali', baseBonus: 0.1, noWinOnSuccess: true, statBonus: 0.65, desc: 'Clasificación: encontrar espacio sin perder la vuelta.', successDesc: 'Pasaste a los tres sin perder prácticamente nada. La vuelta quedó viva hasta la bandera.', failDesc: 'Uno de los autos se movió justo cuando pasabas. Tuviste que levantar y perdiste la vuelta.' },
      { text: 'Abortar la vuelta y preparar otra', pureLuck: true, baseBonus: 0.75, noWinOnSuccess: true, desc: 'Suerte: esperar que exista espacio en el siguiente intento.', successDesc: 'La siguiente vuelta estuvo completamente limpia. Pudiste atacar sin tráfico.', failDesc: 'Volviste a encontrarte tráfico. La clasificación terminó siendo una frustración.' }
    ]
  },
];




const INTERVIEWS = [
    {
      id: 'f1_academy_sign_filial',
      title: 'Llegada a la F1 de la mano de la academia',
      desc: '"Acabás de subir a la F1 gracias a tu academia, pero no te han puesto en su equipo principal. ¿Cómo te sentís al respecto?"',
      choices: [
        { text: '"Tengo que demostrar que merezco estar acá"', pers: 'team', delta: 15, hint: 'Agradecés la oportunidad.', fixedDesc: 'Aclaraste que estás muy agradecido con la academia por la confianza y que vas a darlo todo en este equipo para demostrar que estás listo.' },
        { text: '"Mi objetivo es llegar al equipo principal"', pers: 'aggressiveness', delta: 15, repDelta: 10, hint: 'Dejás claro que querés subir.', fixedDesc: 'Es un buen paso, pero no vine a la Fórmula 1 para conformarme. Quiero llegar al equipo principal.' },
        { text: '"Primero quiero aprender y disfrutar"', pers: 'media', delta: 15, hint: 'Mostrás una actitud tranquila.', fixedDesc: '"Es mi primera temporada en F1. Quiero aprender todo lo posible y aprovechar cada vuelta." Una respuesta prudente para un debutante.' }
      ]
    },
    {
      id: 'f1_academy_sign_main',
      title: 'Llegada directa a un equipo grande',
      desc: '"Tu salto a la F1 ha sido impresionante, debutando directamente en el equipo principal de tu academia. ¿Sentís la presión?"',
      choices: [
        { text: '"La academia sabe lo que hace"', pers: 'aggressiveness', delta: 15, repDelta: 15, hint: 'Demostrás personalidad.', fixedDesc: '"No hay presión. Si me pusieron acá directamente es porque saben lo que valgo y estoy listo para ganar", respondiste con total seguridad.' },
        { text: '"Es un desafío enorme"', pers: 'team', delta: 15, hint: 'Mostrás madurez.', fixedDesc: 'Explicaste que sentís una gran responsabilidad y respeto por la historia del equipo, pero que vas a trabajar duro para estar a la altura.' }
      ]
    },
    {
      id: 'f1_h2h_domination',
      title: 'Destruyendo a tu compañero',
      desc: '"Llevás varias temporadas pasándole por encima a tu compañero de equipo en el mundial. Muchos dicen que el segundo auto está de adorno. ¿Qué opinás?"',
      choices: [
        { text: '"Yo solo me enfoco en sacar el 100% del auto"', pers: 'aggressiveness', delta: 15, repDelta: 10, peerRelDelta: -20, hint: 'Menospreciás su rendimiento indirectamente.', fixedDesc: '"Si él no puede seguir el ritmo, ese no es mi problema. Yo exprimo el auto al máximo." La frialdad de tu respuesta dejó a todos mudos.' },
        { text: '"Él también aporta al equipo"', pers: 'team', delta: 20, peerRelDelta: 20, hint: 'Ayudás a mantener la paz en el garaje (+Equipo).', fixedDesc: '"Los campeonatos se construyen entre dos. Su trabajo con la puesta a punto es clave, aunque no se vea los domingos."' },
        { text: '"Me gustaría tener más competencia"', pers: 'aggressiveness', delta: 25, repDelta: 20, peerRelDelta: -35, hint: 'Destruís su moral completamente.', fixedDesc: '"Sinceramente, a veces me aburro. Ojalá el equipo me ponga a alguien que me exija más el año que viene." Tu compañero tiró los auriculares al escuchar la transmisión.' }
      ]
    },
    {
      id: 'f1_h2h_getting_destroyed',
      title: 'A la sombra de tu compañero',
      desc: '"Tu compañero te está ganando constantemente en el mundial y la prensa empieza a dudar de si merecés esa butaca. ¿Cómo manejás esta situación?"',
      choices: [
        { text: '"El auto está diseñado para él"', pers: 'media', delta: 25, peerRelDelta: -20, hint: 'Excusas que dividen al equipo (+Mediático, -Relación).', fixedDesc: '"Las mejoras siempre favorecen su estilo de conducción. Es muy difícil pelear así." El jefe de equipo no ocultó su enojo por tus declaraciones.' },
        { text: '"Tengo que mejorar, no hay excusas"', pers: 'team', delta: 20, peerRelDelta: 10, repDelta: 10, hint: 'Aceptás la culpa y mostrás madurez (+Equipo).', fixedDesc: '"Él está haciendo un trabajo fenomenal y yo tengo que subir mi nivel. Así de simple."' },
        { text: '"Que no se relaje, porque voy a volver"', pers: 'aggressiveness', delta: 20, peerRelDelta: -15, hint: 'Marcás territorio y jurás venganza (+Agresividad).', fixedDesc: '"Tuvo un par de buenas temporadas, pero esto es largo. El año que viene la historia va a ser muy diferente."' }
      ]
    },
    {
      id: 'f1_academy_leave',
      title: 'Ruptura con la academia',
      desc: '"Sorprendiste a todos al rechazar la vía de tu academia para subir a F1 y firmar por otro equipo. ¿Por qué tomaste esa decisión?"',
      choices: [
        { text: 'Buscaba mi propio camino', pers: 'media', delta: 20, repDelta: 15, hint: 'Sos dueño de tu destino.', fixedDesc: 'Aclaraste que querías ser dueño de tu propio destino y no depender de las decisiones de otros directivos para armar tu carrera.' },
        { text: 'Falta de oportunidades', pers: 'aggressiveness', delta: 15, hint: 'Criticás a tu antigua academia.', fixedDesc: 'Fuiste tajante: "Ellos no parecían tener apuro en darme un asiento, así que fui a donde sí valoran mi talento".' }
      ]
    },
    {
      id: 'f1_academy_dropped',
      title: 'La puerta que se cerró',
      desc: 'Después de llegar a la Fórmula 1 con el respaldo de la academia, tu contrato no fue renovado. Ahora continuarás tu carrera sin el apoyo del programa y la prensa quiere saber qué pasó.',
      choices: [
        { text: '"Les deseo lo mejor"', pers: 'team', delta: 15, hint: 'Te vas sin atacar a quienes te ayudaron.', fixedDesc: '"Me dieron una oportunidad que siempre voy a valorar. Ahora nuestros caminos se separan y les deseo lo mejor." Te despediste sin generar conflictos.' },
        { text: '"Ahora voy a demostrarles que se equivocaron"', pers: 'aggressiveness', delta: 25, hint: 'Convertís el rechazo en motivación.', fixedDesc: '"Tomaron su decisión. Yo voy a tomar la mía: demostrar en pista que se equivocaron." Tus declaraciones alimentaron una nueva narrativa alrededor de tu carrera.' },
        { text: '"Prefiero no hablar del tema"', pers: 'media', delta: 15, hint: 'Evitás hablar públicamente del conflicto.', fixedDesc: '"No quiero entrar en detalles. Estoy concentrado en lo que viene." Mantuviste silencio y evitaste una guerra pública.' }
      ]
    },
    {
      id: 'f1_academy_promoted_main',
      title: 'El esperado ascenso',
      desc: '"Después de unos años en la zona media, finalmente la academia te asciende al equipo principal. ¿Valió la pena la espera?"',
      choices: [
        { text: '"Esto es un sueño hecho realidad"', pers: 'team', delta: 20, hint: 'Mostrás gratitud hacia la academia.', fixedDesc: '"Cuando entré en la academia soñaba con este momento. Ellos confiaron en mí desde el principio y quiero devolverles esa confianza." Celebraste el ascenso junto al equipo.' },
        { text: '"Sabía que este momento iba a llegar"', pers: 'aggressiveness', delta: 20, hint: 'Mostrás confianza en tu propio talento.', fixedDesc: '"Siempre creí que tenía el nivel para estar acá. Ahora tengo la oportunidad de demostrarlo contra los mejores." Tu confianza generó titulares.' },
        { text: '"Me gané esta oportunidad"', pers: 'media', delta: 15, hint: 'Mostrás seguridad sin excederte.', fixedDesc: '"No fue un regalo. Trabajé mucho durante estos años y creo que mis resultados hablan por mí." Una respuesta firme y medida.' }
      ]
    },
    {
      id: 'f1_reg_change_better',
      title: 'El nuevo reglamento funcionó',
      desc: '¡El cambio de reglas le sentó perfecto a tu equipo! Han interpretado el reglamento mejor que nadie y ahora tienen un coche más rápido.',
      choices: [
        { text: 'Elogiar a los ingenieros', pers: 'team', delta: 25, hint: 'Los ingenieros son los héroes (+Equipo).', fixedDesc: '"El trabajo que hicieron en la fábrica durante el invierno fue fenomenal. El coche es un misil." Te ganaste a todo el equipo.' },
        { text: '"Yo les dije qué camino tomar"', pers: 'aggressiveness', delta: 15, pers2: 'team', delta2: -15, hint: 'Tomas crédito del desarrollo (+Agresividad, -Equipo).', fixedDesc: '"Mis indicaciones en el simulador fueron clave para el diseño aerodinámico." Cierta tensión con el director técnico.' }
      ]
    },
    {
      id: 'f1_reg_change_worse',
      title: 'El reglamento fue un golpe duro',
      desc: 'El equipo se equivocó en el diseño con las nuevas reglas. El coche ha perdido rendimiento comparado con el resto.',
      choices: [
        { text: 'Criticar públicamente el diseño', pers: 'aggressiveness', delta: 20, pers2: 'team', delta2: -25, hint: 'Fuego contra tu propio equipo (+Agresividad, -Equipo).', fixedDesc: '"El coche es inmanejable y perdimos meses de desarrollo." La directiva se enfureció contigo.' },
        { text: 'Llamar a la calma', pers: 'team', delta: 20, pers2: 'media', delta2: -10, hint: 'Proteges al equipo (+Equipo, -Medios).', fixedDesc: '"Es solo el inicio de una nueva era. Vamos a recuperarnos juntos." Eres el líder que el equipo necesitaba en las malas.' }
      ]
    },
    {
      id: 'f1_overpaid',
      title: 'El peso del contrato',
      desc: 'Sos uno de los pilotos mejor pagados de la Fórmula 1, pero tus resultados están lejos de justificar ese salario. ¿Sentís que estás obligado a demostrar que valés cada dólar?',
      choices: [
        { text: '“La presión es parte del trabajo, lo voy a revertir.”', pers: 'team', delta: 15, hint: 'Asumís la culpa y prometés mejoras (+Equipo).', fixedDesc: '"Este año no estuve a la altura, pero el equipo confía en mí y yo en ellos. Voy a devolverles esa confianza en la pista."' },
        { text: '“Mi historial justifica mi salario.”', pers: 'aggressiveness', delta: 20, pers2: 'team', delta2: -10, hint: 'Te defendés con tus logros del pasado (+Agresividad, -Equipo).', fixedDesc: '"No llegué a donde estoy por suerte. Una mala temporada no borra mi carrera. El auto también tiene que ayudar."' }
      ]
    },
    {
      id: 'f1_fallen_champion',
      title: 'Un campeón en caída',
      desc: 'Hace un año eras el campeón del mundo. Ahora estás luchando por entrar entre los primeros lugares. ¿Te preocupa que aquel título haya sido más mérito del auto que tuyo?',
      choices: [
        { text: '“El año pasado fuimos los mejores, este año sufrimos juntos.”', pers: 'team', delta: 15, hint: 'Evitás morder el anzuelo y protegés al equipo (+Equipo).', fixedDesc: '"La F1 es cíclica. Cuando ganamos fue gracias a todos, y ahora que nos cuesta, también saldremos adelante juntos."' },
        { text: '“Necesito las herramientas correctas.”', pers: 'aggressiveness', delta: 15, pers2: 'team', delta2: -15, hint: 'Echás la culpa implícitamente al rendimiento del auto (+Agresividad, -Equipo).', fixedDesc: '"El talento no desaparece de un año para el otro. Si me dan un auto para ganar, gano. Así de simple."' },
        { text: '“Los que dudan se van a arrepentir pronto.”', pers: 'media', delta: 15, hint: 'Respuesta desafiante a la prensa (+Mediático).', fixedDesc: '"Me encanta que me subestimen. Guarden esta entrevista para fin del año que viene."' }
      ]
    },
    {
      id: 'f1_carried_by_car',
      title: '¿El piloto o la máquina?',
      desc: 'Acabás de ganar el campeonato, pero el dominio de tu equipo fue tan absoluto que algunos dicen que cualquier piloto habría ganado con este auto. ¿Qué respondés a quienes creen que el coche hizo al campeón y no al revés?',
      choices: [
        { text: '“El auto es fantástico, pero manejarlo al límite es mérito mío.”', pers: 'aggressiveness', delta: 10, hint: 'Defendés tu talento sin desmerecer al auto (+Agresividad).', fixedDesc: '"Tener el mejor auto te da la oportunidad de ganar, pero los domingos hay que salir y hacerlo. Yo no vi a nadie más rápido que yo."' },
        { text: '“Es el resultado del trabajo de toda la fábrica.”', pers: 'team', delta: 20, hint: 'Le das todo el crédito a los ingenieros (+Equipo).', fixedDesc: '"Este título es 99% de la gente en la fábrica que diseñó esta obra de arte. Yo solo tuve el honor de llevarlo a la meta."' }
      ]
    },
    {
      id: 'f1_shadow_contract_good',
      title: 'La gran apuesta',
      desc: 'Muchos dudaron de tu decisión de abandonar tu equipo antes del cambio de reglamento. Hoy, con los resultados a la vista, parece que tenías razón. ¿Siempre supiste que este proyecto funcionaría?',
      choices: [
        { text: '“Siempre supe que este equipo tenía el potencial.”', pers: 'team', delta: 15, hint: 'Validás tu decisión y el trabajo del nuevo equipo (+Equipo).', fixedDesc: '"Había visto lo que estaban preparando en secreto y confié plenamente. Han hecho un trabajo extraordinario."' },
        { text: '“Los campeones sabemos leer el futuro.”', pers: 'media', delta: 15, hint: 'Respuesta presumida (+Mediático).', fixedDesc: '"Para ganar en la Fórmula 1 hay que saber dónde estar en el momento justo. Fue una jugada maestra."' }
      ]
    },
    {
      id: 'f1_shadow_contract_bad',
      title: 'Una apuesta fallida',
      desc: 'Abandonaste un equipo confiando en un nuevo proyecto que, con el nuevo reglamento, nunca despegó. ¿Tomaste la peor decisión de tu carrera?',
      choices: [
        { text: '“Roma no se construyó en un día, este es un proyecto a largo plazo.”', pers: 'team', delta: 15, hint: 'Pedís paciencia (+Equipo).', fixedDesc: '"Sabíamos que este año sería de transición. Estamos construyendo las bases para dominar en el futuro."' },
        { text: '“Es fácil hablar con el diario del lunes.”', pers: 'aggressiveness', delta: 10, hint: 'Te ponés a la defensiva (+Agresividad).', fixedDesc: '"Las decisiones se toman con la información del momento. No me arrepiento de haber buscado un nuevo desafío."' },
        { text: '“Esto no era lo que me prometieron. Si no mejora, me voy.”', pers: 'aggressiveness', delta: 20, pers2: 'team', delta2: -25, hint: 'Le das un ultimátum al equipo (+Agresividad, -Equipo).', fixedDesc: '"Dejé mucho atrás por este proyecto y hasta ahora solo veo excusas. Tienen que reaccionar ya o mi paciencia se agotará."' }
      ]
    },
    {
      id: 'f1_beaten_by_young_peer',
      title: 'El relevo generacional',
      desc: 'Tu compañero es mucho más joven que vos y ya te está superando regularmente. ¿Seguís teniendo lo necesario para competir al máximo nivel?',
      choices: [
        { text: '“Él hizo un gran trabajo, pero la experiencia no se compra.”', pers: 'team', delta: 10, hint: 'Reconocés su talento sin bajar los brazos (+Equipo).', fixedDesc: '"Es un piloto rapidísimo y el futuro del equipo. Me obliga a mejorar y eso es bueno para todos."' },
        { text: '“Tuvimos mala suerte. Todavía soy el más rápido de este garaje.”', pers: 'aggressiveness', delta: 15, pers2: 'team', delta2: -10, hint: 'Negás la realidad y te ponés presión extra (+Agresividad, -Equipo).', fixedDesc: '"Los puntos no cuentan toda la historia. Sé de lo que soy capaz y el año que viene las cosas van a ser muy diferentes."' }
      ]
    },
    {
      id: 'f1_regulations_criticism',
      title: '🏆 El campeón y las nuevas reglas',
      desc: 'Conseguiste tu segundo campeonato consecutivo, Sin embargo, muchos aficionados y pilotos consideran que las regulaciones actuales han hecho que las carreras sean menos entretenidas y que los autos sean difíciles de disfrutar. Ahora que sos el campeón, te preguntan directamente: ¿qué opinás de estas regulaciones?',
      choices: [
        { text: '“Si no les gusta, que sean más rápidos.”', pers: 'aggressiveness', delta: 10, hint: '🏎️ Defendés la categoría y dejás claro que los pilotos están para competir, no para decidir las reglas.', fixedDesc: '“Entiendo las críticas, pero nosotros no escribimos las reglas. Nos adaptamos y hacemos nuestro trabajo. Si otros equipos quieren ganarnos, tienen que hacerlo dentro de las mismas reglas que nosotros.”' },
        { text: '“Hay cosas que deberían cambiar.”', pers: 'team', delta: 5, hint: '🎙️ Reconocés que el reglamento tiene problemas, incluso después de haber sido beneficiado por él.', fixedDesc: '“Estoy orgulloso de lo que conseguimos, pero eso no significa que crea que todo está perfecto. Hay aspectos de estas regulaciones que podrían mejorarse. Si los pilotos y los aficionados sienten que algo no funciona, creo que hay que escucharlos.”' },
        { text: '“A mí me encanta. Gané dos campeonatos con ellas.”', pers: 'media', delta: 5, hint: '🏆 Defendés las reglas desde la perspectiva del campeón.', fixedDesc: '“Para mí han sido fantásticas. He ganado dos campeonatos y disfruto muchísimo pilotando estos autos. Entiendo que haya opiniones diferentes, pero desde dentro del cockpit puedo decir que estas máquinas siguen siendo increíbles.”' }
      ]
    },
    {
      id: 'f1_new_brand_expansion',
      title: 'Expansión en la Parrilla',
      desc: 'Con la noticia de que una nueva marca histórica se une a la Fórmula 1 la próxima temporada, ¿qué opinas de tener más autos compitiendo en la pista?',
      choices: [
        { text: '"Es fantástico para el deporte."', pers: 'team', delta: 15, hint: 'Das la bienvenida a la competencia y cuidás la imagen (+Equipo).', fixedDesc: '"Más competencia siempre es bienvenida. Va a ser genial para los fans tener a otro gigante histórico peleando por puntos."' },
        { text: '"La F1 no perdona a los novatos."', pers: 'aggressiveness', delta: 15, hint: 'Dudás del potencial del nuevo equipo (+Agresividad).', fixedDesc: '"Habrá que ver si están al nivel. Fabricar autos de calle es una cosa, sobrevivir en la F1 es otra historia."' },
        { text: '"Solo es más tráfico en clasificación."', pers: 'media', delta: -10, pers2: 'aggressiveness', delta2: 10, hint: 'Comentario sarcástico que desestima la noticia (+Agresividad, -Medios).', fixedDesc: '"No me cambia mucho la vida, la verdad. Supongo que ahora habrá que esquivar más tráfico en la Q1."' }
      ]
    },
    {
      id: 'f1_new_brand_takeover',
      title: 'Terremoto Corporativo',
      desc: 'Una de las escuderías históricas acaba de ser comprada por un gigante automotriz de cara a la próxima temporada. ¿Cómo crees que afectará esto al balance de poder?',
      choices: [
        { text: '"Darán un salto de calidad increíble."', pers: 'team', delta: 10, pers2: 'media', delta2: 10, hint: 'Elogias el potencial del nuevo proyecto (+Equipo, +Medios).', fixedDesc: '"Con esa inyección de capital e infraestructura, seguro darán un salto enorme. Tenemos que estar preparados."' },
        { text: '"El dinero no compra campeonatos."', pers: 'aggressiveness', delta: 20, hint: 'Desafiás a los nuevos dueños (+Agresividad).', fixedDesc: '"Pueden poner todo el dinero que quieran, pero la experiencia en pista no se compra de la noche a la mañana. Tienen mucho que demostrar."' },
        { text: '"Solo me enfoco en mi auto."', pers: 'team', delta: 15, hint: 'Mostrás enfoque y lealtad total a tu equipo (+Equipo).', fixedDesc: '"Para ser honesto, no me importa quién compre a quién. Mi trabajo es exprimir al máximo nuestro auto, lo demás es ruido."' }
      ]
    },
    {
      id: 'f1_constructors_champ',
      title: '¡Campeones de Constructores!',
      desc: 'Tu escudería ha asegurado el Mundial de Constructores gracias a los puntos sumados a lo largo del año.',
      choices: [
        { text: '"Es el mejor equipo de la parrilla"', pers: 'team', delta: 25, hint: 'Reconoces el trabajo de los ingenieros (+Equipo).', fixedDesc: '"Este título se ganó en la fábrica, no en la pista." El equipo está eufórico.' },
        { text: '"Yo puse el auto donde debía estar"', pers: 'aggressiveness', delta: 20, pers2: 'team', delta2: -10, hint: 'Tomas el crédito (+Agresividad, -Equipo).', fixedDesc: '"Sin mis resultados clave no hubiéramos ganado esto." A los jefes no les gustó tu arrogancia.' }
      ]
    },
    {
      id: 'f1_teammate_champ',
      title: 'A la sombra del campeón',
      desc: 'Tu compañero de equipo se ha coronado Campeón del Mundo de Pilotos con el mismo coche que tú.',
      choices: [
        { text: 'Felicitarlo públicamente', pers: 'media', delta: 15, pers2: 'team', delta2: 10, hint: 'Quedas como un señor (+Medios, +Equipo).', fixedDesc: 'Diste la mano y sonreíste para la foto. La prensa elogia tu madurez, aunque por dentro te hierva la sangre.' },
        { text: '"El año que viene será diferente"', pers: 'aggressiveness', delta: 20, hint: 'Le declaras la guerra (+Agresividad).', fixedDesc: '"Que disfrute ahora, porque el próximo año el 1 lo voy a llevar yo." Pusiste presión sobre tu propio equipo.' }
      ]
    },
    {
      id: 'ev_jet',
      title: '✈️ Vuelo Compartido',
      desc: 'Tu compañero te pide viajar en tu Jet Privado para la próxima carrera europea.',
      choices: [
        { text: 'Aceptar', pers: 'team', delta: 20, pers2: 'media', delta2: -10, hint: 'Mejora relación, pero la prensa inventa rumores.', fixedDesc: 'Aceptaste. Mejoró mucho tu relación en el equipo, aunque a la prensa le gusta inventar dramas donde no hay.' },
        { text: 'Rechazar', pers: 'aggressiveness', delta: 15, pers2: 'team', delta2: -15, hint: 'Viajas solo.', fixedDesc: 'Le dijiste que no tenías asientos libres. Viajaste tranquilo pero la relación quedó tensa.' }
      ]
    },
    {
      id: 'ev_mansion',
      title: '🏰 Visita Inesperada',
      desc: 'Un periodista de élite te pide hacer una nota desde tu mansión en Mónaco sobre "cómo vive una leyenda".',
      choices: [
        { text: 'Mostrarte humilde', pers: 'media', delta: -10, repDelta: 15, hint: 'Sube reputación (+15).', fixedDesc: 'Mostraste un perfil bajo y hogareño. La gente te ama por tu humildad (+15 Reputación).' },
        { text: 'Alardear', pers: 'media', delta: 25, hint: 'Aumenta ser mediático, riesgo de críticas.', fixedDesc: 'Hiciste un tour por tus autos y lujos. Sos una estrella de rock, aunque a algunos puristas no les gustó.' }
      ]
    },
    {
      id: 'ev_yacht',
      title: '🛥️ Fiesta post-carrera',
      desc: 'Conseguiste un podio y tu Yate de Lujo está amarrado en el puerto. ¿Qué hacemos?',
      choices: [
        { text: 'Fiesta pública', pers: 'media', delta: 30, repDelta: 20, hint: 'Mucha prensa, mucho caos (+20 Reputación).', fixedDesc: 'Invitaste a medio paddock. Fue un descontrol y saliste en todas las revistas. Tu reputación subió por las nubes (+20 Reputación).' },
        { text: 'Fiesta privada', pers: 'team', delta: 25, hint: 'Solo el equipo.', fixedDesc: 'Invitaste solo a los mecánicos e ingenieros. La moral del equipo está por las nubes.' }
      ]
    },
    {
      id: 'ev_kart',
      title: '🏎️ La Joven Promesa',
      desc: 'En tu Escudería de Karting descubriste a un chico con talento puro pero sin recursos para correr en Europa.',
      choices: [
        { text: 'Patrocinarlo ($1.000.000)', pers: 'media', delta: 15, money: -1000000, repDelta: 20, hint: 'Cuesta plata pero ganas muchísima reputación.', fixedDesc: 'Pagaste de tu bolsillo su temporada. Te costó plata, pero el mundo aplaude tu gesto (-$1M, +20 Reputación).' },
        { text: 'Desearle suerte', pers: 'aggressiveness', delta: 10, hint: 'No gastas nada.', fixedDesc: 'Le deseaste suerte. Este es un mundo duro, él tendrá que buscarse sus propios sponsors.' }
      ]
    },
    {
      id: 'ev_cryo',
      title: '🧊 Control Antidopaje',
      desc: 'La FIA llegó a las 4 AM a tu casa por un control sorpresa mientras descansabas en tu cámara hiperbárica.',
      choices: [
        { text: 'Colaborar tranquilo', pers: 'team', delta: 15, repDelta: 10, hint: 'Perfil bajo (+10 Reputación).', fixedDesc: 'Hiciste el control sin quejarte. Eres el ejemplo a seguir en la parrilla (+10 Reputación).' },
        { text: 'Quejarte en redes', pers: 'aggressiveness', delta: 25, pers2: 'media', delta2: 20, hint: 'Un escándalo mediático.', fixedDesc: 'Subiste una historia quejándote de que no te dejan dormir. Tus fans te apoyan, la FIA te mira de reojo.' }
      ]
    },
    {
      id: 'ev_psych',
      title: '🧠 El Bloqueo Mental',
      desc: 'Después de varios fines de semana complicados, empezás a notar que la frustración te acompaña cada vez que subís al auto. Tu psicólogo deportivo cree que necesitás trabajar el aspecto mental antes de que afecte tu rendimiento.',
      choices: [
        { text: 'Trabajar el problema', pers: 'media', delta: -15, hint: 'Aceptar que también necesitás preparación mental.', fixedDesc: 'Dedicás tiempo a analizar la frustración acumulada y a recuperar la confianza. No cambia nada de un día para otro, pero llegás al próximo fin de semana con la cabeza mucho más despejada.' },
        { text: 'Dejar atrás lo ocurrido y seguir adelante', pers: 'aggressiveness', delta: 10, hint: 'Confiar en tu fortaleza mental.', fixedDesc: 'Preferís no darle más vueltas al asunto. Para vos, los findes pasados ya son historia y la mejor forma de responder es volver a salir a pista. Tu entorno espera que esa confianza sea suficiente para dejar atrás la mala racha.' }
      ]
    },
    {
      id: 'ev_mentor',
      title: '👑 El Consejo del Campeón',
      desc: 'Antes de la carrera decisiva, tu Mentor Ex-Campeón te frena: "Estás yendo muy al límite, corré con inteligencia hoy".',
      choices: [
        { text: 'Correr inteligente', pers: 'team', delta: 20, hint: 'Aseguras sumar puntos, nada de riesgos.', fixedDesc: 'Le hiciste caso, levantaste el pie cuando hizo falta y aseguraste un gran resultado.' },
        { text: 'Ir al límite', pers: 'aggressiveness', delta: 30, hint: 'Ignorarlo y buscar la gloria.', fixedDesc: 'Lo ignoraste y fuiste a matar o morir. Esta vez funcionó y todos hablan de tu maniobra.' }
      ]
    },
    {
      id: 'ev_classics',
      title: '🚗 Festival de la Velocidad',
      desc: 'En pretemporada, te invitan a manejar uno de tus F1 clásicos en un festival masivo.',
      choices: [
        { text: 'Ir al límite', pers: 'aggressiveness', delta: 20, pers2: 'media', delta2: 25, hint: 'Exigir el auto al máximo.', fixedDesc: 'Hiciste trompos y quemaste gomas. El público enloqueció, tu reputación como showman es legendaria.' },
        { text: 'Pasear para la foto', pers: 'team', delta: 15, repDelta: 10, hint: 'Cuidar la reliquia (+10 Reputación).', fixedDesc: 'Fuiste a baja velocidad saludando al público. Una foto perfecta para cuidar el patrimonio (+10 Reputación).' }
      ]
    },
  
  {
    id: 'first_win',
    title: 'Primera Victoria en F1',
    desc: 'Acabas de conseguir tu primera victoria en la máxima categoría. El paddock entero te está mirando.',
    choices: [
      { text: 'Agradecer al equipo por el auto', pers: 'team', delta: 20, hint: 'Demostrás ser un hombre de equipo (+Equipo).', fixedDesc: '"Este triunfo es de los cientos de personas en la fábrica. Yo solo manejé el auto." El equipo adoró tus palabras.' },
      { text: 'Celebrar tu talento individual', pers: 'aggressiveness', delta: 20, hint: 'Mostrás confianza y agresividad (+Agresividad).', fixedDesc: '"Sabía que si me daban la oportunidad iba a ganar. Es el primero de muchos." Tus rivales tomaron nota de tu arrogancia.' },
      { text: 'Dar un show para las cámaras', pers: 'media', delta: 20, hint: 'Los sponsors te amarán (+Mediático).', fixedDesc: 'Hiciste chistes, saltaste al público y dejaste frases célebres. Te ganaste a los fans y a los patrocinadores.' }
    ]
  },
  {
    id: 'bad_streak',
    title: 'Racha de malos resultados',
    desc: 'Llevás tres carreras fuera de los puntos. La prensa te presiona: "¿Qué está pasando con tu rendimiento?"',
    choices: [
      { text: 'Asumir toda la responsabilidad', pers: 'team', delta: 15, hint: 'Protegés al equipo de las críticas (+Equipo).', fixedDesc: '"Soy yo el que tiene que mejorar. El equipo me está dando todo." Los mecánicos te lo agradecieron en privado.' },
      { text: 'Culpar sutilmente a la estrategia', pers: 'aggressiveness', delta: -10, pers2: 'team', delta2: -15, hint: 'Genera tensión pero desvía la culpa (-Equipo, -Agresividad).', fixedDesc: '"A veces las llamadas desde el muro no ayudan, pero somos un equipo." El jefe de estrategia no te miró el resto del día.' },
      { text: 'Responder con una broma evasiva', pers: 'media', delta: 15, hint: 'Calmás las aguas en los medios (+Mediático).', fixedDesc: '"Bueno, al menos mis sponsors tienen más tiempo de TV porque voy más lento." La prensa rió y la tensión bajó.' }
    ]
  },
  {
    id: 'rival_crash',
    title: 'Toque polémico en pista',
    desc: 'Un piloto experimentado te chocó en carrera. Ambos quedaron fuera. ¿Qué le decís a la TV?',
    choices: [
      { text: 'Llamarlo ciego y viejo', pers: 'aggressiveness', delta: 25, hint: 'Guerra declarada (+Agresividad).', fixedDesc: '"Evidentemente ya no ve bien. Debería pensar en el retiro." Iniciaste una guerra en el paddock.' },
      { text: '"Son cosas de las carreras"', pers: 'media', delta: -5, pers2: 'team', delta2: 10, hint: 'Diplomático, no entrás en juegos.', fixedDesc: 'Mantuviste la calma. Tu equipo apreció que no generaras un circo mediático extra.' }
    ]
  },
  {
    id: 'f1_transfer_rumors',
    title: 'Rumores en el Paddock',
    desc: 'Tu contrato termina dentro de poco y estás rindiendo por encima del coche. La prensa pregunta sobre tu futuro.',
    choices: [
      { text: '"Soy leal a mi equipo"', pers: 'team', delta: 20, hint: 'Demostrás lealtad (+Equipo).', fixedDesc: '"Ellos me dieron la oportunidad, mi cabeza está acá." El equipo agradeció tu lealtad.' },
      { text: '"Siempre busco el mejor auto"', pers: 'aggressiveness', delta: 20, hint: 'Ponés presión a la directiva (+Agresividad).', fixedDesc: '"Soy un ganador. Si no me dan el auto para ganar, miraré otras opciones." Pusiste presión a la directiva.' },
      { text: '"Mi mánager se encarga de eso"', pers: 'media', delta: 15, hint: 'Esquivás la polémica (+Mediático).', fixedDesc: 'Esquivaste la bala mediática con elegancia. Tu mánager tuvo mucho trabajo esa semana.' }
    ]
  },
  {
    id: 'f1_underperform',
    title: 'Dura comparación',
    desc: 'Tenés un coche competitivo, pero tus resultados no acompañan. Tu compañero suma muchos más puntos.',
    choices: [
      { text: 'Admitir el mal rendimiento', pers: 'team', delta: 15, hint: 'Humildad pura (+Equipo).', fixedDesc: '"No le encontré la vuelta al coche. Mi compañero hizo un gran trabajo, debo aprender de él." Humildad pura.' },
      { text: 'Culpar al estilo de manejo del coche', pers: 'aggressiveness', delta: 10, pers2: 'team', delta2: -15, hint: 'Atacas a los ingenieros (+Agresividad, -Equipo).', fixedDesc: '"El auto está hecho a medida para él. No se adapta a mi estilo." Los ingenieros se ofendieron.' }
    ]
  },
  {
    id: 'f1_return_to_win',
    title: 'El regreso a la victoria',
    desc: 'Llevabas años sin ganar en F1. Finalmente volviste a subir al escalón más alto del podio.',
    choices: [
      { text: '"Nunca dejé de creer"', pers: 'media', delta: 20, hint: 'Respuesta que emociona a la TV (+Mediático).', fixedDesc: '"Fue un camino largo, pero el trabajo duro siempre paga." Los fans estallaron de emoción.' },
      { text: '"Solo necesitaba el auto correcto"', pers: 'aggressiveness', delta: 15, hint: 'Confianza pura (+Agresividad).', fixedDesc: '"El talento siempre estuvo, solo faltaba la herramienta." Demostraste gran confianza.' }
    ]
  },
  {
    id: 'f1_epic_champion',
    title: 'El Milagro Inesperado',
    desc: 'Acabás de ganar el campeonato del mundo con un auto inferior, algo que nadie pensaba posible. La prensa enloquece.',
    choices: [
      { text: '"Yo sabía que era posible"', pers: 'aggressiveness', delta: 25, hint: 'Demostrás una confianza inquebrantable (+Agresividad).', fixedDesc: '"Nunca dudé de mi talento, ni siquiera cuando nos daban por muertos." Dejaste al paddock boquiabierto.' },
      { text: '"Es mérito exclusivo del equipo"', pers: 'team', delta: 25, hint: 'Compartís la gloria con todos (+Equipo).', fixedDesc: '"Este auto lo construyeron con sangre y sudor. Este título es de ellos." Aumentaste la moral del equipo al máximo.' }
    ]
  },
  {
    id: 'f1_championship_contender',
    title: 'Peleando el mundial',
    desc: 'Terminaste en el Top 3 del campeonato. Eres oficialmente un contendiente al título.',
    choices: [
      { text: '"El año que viene vamos por todo"', pers: 'aggressiveness', delta: 15, hint: 'Marcás territorio (+Agresividad).', fixedDesc: '"Este año fue de aprendizaje, el próximo no habrá piedad." Marcaste terreno.' },
      { text: '"Es un premio al equipo"', pers: 'team', delta: 20, hint: 'Agradecimiento total (+Equipo).', fixedDesc: '"Estar acá es mérito de los chicos de la fábrica." Fortaleciste el vínculo con tu escudería.' }
    ]
  },
  {
    id: 'f1_retirement_talk',
    title: 'Rumores de retiro',
    desc: 'Tenés más de 35 años. Los medios empiezan a preguntarte cuánto tiempo más vas a correr.',
    choices: [
      { text: '"Hasta que el cuerpo aguante"', pers: 'aggressiveness', delta: 10, hint: 'Dejás claro que hay cuerda para rato (+Agresividad).', fixedDesc: '"Todavía soy más rápido que estos chicos." Les dejaste claro que hay cuerda para rato.' },
      { text: '"Veremos año a año"', pers: 'media', delta: 10, hint: 'Diplomacia y misterio (+Mediático).', fixedDesc: '"Disfruto el presente, el futuro ya llegará." Respuesta diplomática y misteriosa.' }
    ]
  },
  {
    id: 'f1_win_record',
    title: 'Récord histórico',
    desc: '¡Rompiste el récord absoluto de victorias en la historia de la Fórmula 1!',
    choices: [
      { text: '"Es el mejor día de mi vida"', pers: 'media', delta: 20, hint: 'Un discurso emotivo (+Mediático).', fixedDesc: '"Nunca imaginé llegar hasta acá cuando empecé en el karting." Emocionaste a todos.' },
      { text: '"Los récords están para romperse"', pers: 'aggressiveness', delta: 15, hint: 'Respuesta de una leyenda (+Agresividad).', fixedDesc: '"Fui el más rápido. Era cuestión de tiempo." Tu estatus de leyenda quedó sellado.' }
    ]
  },
  {
    id: 'f1_team_orders_obey',
    title: 'Polémica por órdenes de equipo',
    desc: 'Acabas de dejar pasar a tu compañero por órdenes del equipo. La prensa te pregunta qué pensas sobre eso.',
    choices: [
      { text: '"Soy un hombre del equipo"', pers: 'team', delta: 25, wasEscudero: true, hint: 'Sumás puntos para la escuderia (+Equipo).', fixedDesc: '"Me pagan para sumar puntos para el equipo, no para mi ego." El jefe de equipo sonrió.' },
      { text: '"No me gustó, pero obedecí"', pers: 'aggressiveness', delta: 10, pers2: 'team', delta2: -10, hint: 'Muestras frustración (+Agresividad, -Equipo).', fixedDesc: '"Soy más rápido, pero hoy tocó esto." Dejaste ver tu frustración.' }
    ]
  },
  {
    id: 'f1_team_orders_ignore',
    title: 'Rebelión en el equipo',
    desc: 'Ignoraste las órdenes de dejar pasar a tu compañero. El clima interno está al rojo vivo.',
    choices: [
      { text: '"Yo corro para ganar"', pers: 'aggressiveness', delta: 25, pers2: 'team', delta2: -25, hint: 'Guerra total (+Agresividad, -Equipo).', fixedDesc: '"Si es más rápido que me pase en la pista." Te ganaste el odio de una mitad del garaje.' },
      { text: '"Hubo un problema con la radio"', pers: 'media', delta: 20, pers2: 'team', delta2: -15, hint: 'Mentís a la prensa (+Mediático, -Equipo).', fixedDesc: '"No escuché el mensaje a tiempo, lo lamento." Nadie te creyó, pero la prensa rió.' }
    ]
  },
  {
    id: 'f1_rookie_question',
    title: 'La nueva generación',
    desc: 'Hace poco interactuaste con el piloto novato en pista. Te preguntan por él.',
    choices: [
      { text: '"Tiene futuro"', pers: 'media', delta: 15, hint: 'Quedás como un veterano sabio (+Mediático).', fixedDesc: '"Es rápido, le falta experiencia pero va a llegar lejos." Quedaste como un veterano sabio.' },
      { text: '"Le falta sopa"', pers: 'aggressiveness', delta: 15, hint: 'Respuesta cortante (+Agresividad).', fixedDesc: '"Aún tiene mucho que aprender, la F1 no perdona." Fuerte y claro.' }
    ]
  },
  {
    id: 'f1_bad_blood',
    title: 'Guerra fría',
    desc: 'Tu relación con tu compañero es pésima y no se hablan. La prensa lo sabe y tira leña al fuego.',
    choices: [
      { text: '"No vengo a hacer amigos"', pers: 'aggressiveness', delta: 20, hint: 'Llenás de titulares los diarios (+Agresividad).', fixedDesc: '"Nos pagan por ganar, no por tomar café juntos." La rivalidad se encendió aún más.' },
      { text: '"Lo respeto como piloto"', pers: 'media', delta: 15, hint: 'Respuesta madura (+Mediático).', fixedDesc: '"Fuera de la pista es otra historia, adentro somos compañeros." Una respuesta madura.' }
    ]
  },
  {
    id: 'f1_dominant_season',
    title: 'Temporada aplastante',
    desc: 'Ganaste el campeonato con una superioridad abrumadora.',
    choices: [
      { text: '"El auto fue un misil"', pers: 'team', delta: 20, hint: 'Agradecimiento total (+Equipo).', fixedDesc: '"Tuvimos el mejor paquete todo el año, felicidades a la fábrica." Un agradecimiento total.' },
      { text: '"Estuve en otra liga"', pers: 'aggressiveness', delta: 20, hint: 'Ego al máximo (+Agresividad).', fixedDesc: '"Nadie pudo alcanzarme, fui perfecto." Mostraste quién manda.' }
    ]
  },
  {
    id: 'f1_teammate_destroyed',
    title: 'El nuevo referente',
    desc: 'Terminaste la temporada muy por delante de tu compañero. La prensa empieza a preguntarse quién es realmente el piloto número uno del equipo.',
    choices: [
      { text: '"Somos un equipo y ganamos juntos"', pers: 'team', delta: 20, hint: 'Evitás generar una guerra interna (+Equipo).', fixedDesc: '"No creo en eso de piloto número uno. Los dos trabajamos para llevar al equipo hacia adelante." En el garaje respiraron tranquilos.' },
      { text: '"Los resultados hablan solos"', pers: 'aggressiveness', delta: 20, hint: 'Mandás un mensaje directo (+Agresividad).', fixedDesc: '"No necesito decir quién fue más rápido. Está todo en la tabla." Tu compañero no hizo comentarios.' },
      { text: 'Responder con una sonrisa', pers: 'media', delta: 15, hint: 'Alimentás el debate sin decir demasiado (+Mediático).', fixedDesc: 'Sonreíste, miraste a cámara y seguiste caminando. Al día siguiente, todos los diarios discutían exactamente lo mismo.' }
    ]
  },
  {
    id: 'f1_first_title',
    title: 'Campeón del Mundo',
    desc: 'Después de toda una vida persiguiendo este momento, acabás de ganar tu primer campeonato mundial de Fórmula 1.',
    choices: [
      { text: 'Romper en llanto frente a las cámaras', pers: 'media', delta: 25, hint: 'Mostrás el lado más humano de tu carrera (+Mediático).', fixedDesc: 'Intentaste hablar, pero no pudiste. Las lágrimas dijeron todo lo que las palabras no alcanzaban a explicar.' },
      { text: 'Agradecer a todos los que estuvieron desde el inicio', pers: 'team', delta: 25, hint: 'Compartís el momento con quienes te acompañaron (+Equipo).', fixedDesc: '"Este título empezó mucho antes de llegar a la Fórmula 1. Hay demasiadas personas detrás de esto para nombrarlas a todas."' },
      { text: '"El primero de muchos"', pers: 'aggressiveness', delta: 25, hint: 'No pensás detenerte acá (+Agresividad).', fixedDesc: '"Disfrutaré este título esta noche. Mañana empezamos a trabajar por el siguiente." La advertencia recorrió todo el paddock.' }
    ]
  },
  {
    id: 'f1_title_lost',
    title: 'El mundial se escapó',
    desc: 'Estuviste cerca del campeonato, pero terminaste segundo. A pocos puntos de cambiar tu carrera para siempre.',
    choices: [
      { text: '"Volveremos más fuertes"', pers: 'team', delta: 15, hint: 'Transformás la derrota en motivación (+Equipo).', fixedDesc: '"Duele, claro que duele. Pero esto no termina acá. Vamos a aprender y volver más fuertes." El equipo se unió alrededor tuyo.' },
      { text: '"No voy a olvidarme de esto"', pers: 'aggressiveness', delta: 25, hint: 'Convertís la derrota en combustible (+Agresividad).', fixedDesc: '"Que disfruten el trofeo. El año que viene voy a buscarlo." Tu rival escuchó cada palabra.' },
      { text: 'Restarle importancia frente a la prensa', pers: 'media', delta: 15, hint: 'Intentás controlar el relato (+Mediático).', fixedDesc: '"Fue una gran temporada. No voy a destruir un año entero por una posición." Nadie terminó de creerte, pero evitaste mostrar debilidad.' }
    ]
  },
  {
    id: 'f1_title_record_broken',
    title: 'El más campeón',
    desc: 'Acabás de conseguir más campeonatos mundiales que cualquier piloto en la historia de la Fórmula 1.',
    choices: [
      { text: '"Los números hablan por sí solos"', pers: 'aggressiveness', delta: 20, hint: 'Aceptás tu lugar en la historia (+Agresividad).', fixedDesc: '"Nunca corrí pensando en récords, pero ahora que estoy acá no voy a fingir que no significa algo." Tu nombre quedó definitivamente en la historia.' },
      { text: '"Sin el equipo no existiría este récord"', pers: 'team', delta: 25, hint: 'Compartís la gloria (+Equipo).', fixedDesc: '"Un piloto puede cruzar la meta, pero detrás hay miles de personas que hicieron posible cada victoria."' },
      { text: '"Espero que alguien me supere algún día"', pers: 'media', delta: 20, hint: 'Dejás una frase para la historia (+Mediático).', fixedDesc: '"Eso significaría que este deporte sigue avanzando." Tu respuesta recorrió todos los medios.' }
    ]
  },
  {
    id: 'nemesis_ahead_comment',
    title: 'La Sombra desde Arriba',
    desc: '"Tu gran rival, {{NEMESIS_NAME}}, ya está corriendo en {{NEMESIS_CAT}} mientras vos seguís peleando acá abajo. ¿No sentís que te estás quedando atrás?"',
    nemesisInterview: true,
    choices: [
      { text: '"Cada uno tiene su tiempo"', pers: 'media', delta: 15, hint: 'Mostrás paciencia.', fixedDesc: 'Mantuviste la calma. "Él tomó un atajo, yo estoy construyendo mi camino paso a paso. Nos volveremos a cruzar, no te preocupes."' },
      { text: '"Que disfrute mientras pueda"', pers: 'aggressiveness', delta: 20, hint: 'Agresivo.', fixedDesc: '"Que junte todos los trofeos que pueda ahora, porque cuando yo llegue a esa categoría no va a ganar nunca más."' }
    ]
  },
  {
    id: 'nemesis_champ',
    title: 'La Sombra del Año',
    desc: 'Mientras vos terminaste una temporada discreta, tu némesis salió campeón. La prensa te espera en la conferencia.',
    nemesisInterview: true,
    choices: [
      { text: '"Felicitaciones, hizo un gran trabajo"', pers: 'media', delta: 20, pers2: 'team', delta2: 15, hint: 'Resultado fijo: acumulás puntos de profesionalismo.', fixedDesc: '"Hizo un gran trabajo, el año que viene estaremos ahí para competirle." Bajaste la cabeza y respondiste con clase. Todos lo notaron.' },
      { text: '"Cualquiera gana con ese auto"', pers: 'aggressiveness', delta: 30, repDelta: -25, hint: 'Resultado fijo: brutal en lo personal pero te destruye la reputación en el paddock.', fixedDesc: '"Poneme en su butaca y lo gano en la mitad de tiempo." El periodista abrió los ojos. La cita corrió por todos los medios. Tu némesis la imprimió y la colgó en su motorhome.' }
    ]
  },
  {
    id: 'nemesis_retired_comment',
    title: 'Palabras desde el Paddock de TV',
    desc: 'Tu némesis, ya retirado, aparece en un programa de análisis y te destina varios minutos de crítica. "Le falta el instinto de los grandes", dice mirando a cámara.',
    nemesisInterview: true,
    choices: [
      { text: 'Ignorarlo públicamente', pers: 'media', delta: 15, pers2: 'team', delta2: 10, hint: 'Resultado fijo: la madurez suma puntos de imagen.', fixedDesc: 'No dijiste nada. Dejaste que hablara solo. Al día siguiente ya nadie recordaba sus palabras.' },
      { text: 'Responderle en redes sociales', pers: 'aggressiveness', delta: 20, pers2: 'media', delta2: 25, repDelta: -10, hint: 'Resultado fijo: tus seguidores estallan, pero el escándalo te salpica a vos también.', fixedDesc: '"Los que ya no pueden competir, opinan." Un solo tuit. Un millón de reacciones. El programa lo invitó de nuevo para responder. Ya creaste un monstruo.' }
    ]
  },
  {
    id: 'nemesis_press_compare',
    title: 'La Pregunta Inevitable',
    desc: '"La prensa lleva años comparándote con {{NEMESIS_NAME}}. ¿Quién es mejor piloto?"',
    nemesisInterview: true,
    choices: [
      { text: '"Son comparaciones que no me interesan"', pers: 'media', delta: 15, hint: 'Respuesta diplomática. Subís imagen pública.', fixedDesc: '"Cada piloto tiene su propio camino. Yo me enfoco en lo mío." Sonreíste y cerraste el tema con clase. La respuesta no le gustó al periodista, pero el paddock te respetó.' },
      { text: '"Las carreras hablan por sí solas"', pers: 'aggressiveness', delta: 10, repDelta: 10, hint: 'Confianza controlada.', fixedDesc: '"Mirá el marcador. Ahí está tu respuesta." No nombraste a nadie, pero todos entendieron a quién apuntabas. La frase dio la vuelta al mundo del motor.' },
      { text: '"Yo, sin dudas"', pers: 'aggressiveness', delta: 30, repDelta: -15, hint: 'Declaración brutal. Sube agresividad, baja reputación.', fixedDesc: 'Silencio. El periodista tragó saliva. "¿Podés probarlo?" te preguntó. "Ya lo estoy haciendo", respondiste. La cita fue trending topic toda la semana.' }
    ]
  },
  {
    id: 'nemesis_press_rivalry',
    title: 'Combustible para la Rivalidad',
    desc: '"Un periodista te pregunta directamente: ¿Sentís que {{NEMESIS_NAME}} es tu mayor obstáculo para llegar a donde querés?"',
    nemesisInterview: true,
    choices: [
      { text: '"Hay muchos rivales en esta parrilla"', pers: 'media', delta: 20, hint: 'Negás la rivalidad públicamente. Imagen de madurez.', fixedDesc: '"En este deporte son veinte pilotos compitiendo, no dos." Diluyendo la narrativa, te mostraste como alguien enfocado en el colectivo. A tu némesis no le gustó para nada.' },
      { text: '"Es uno de los obstáculos, sí"', pers: 'aggressiveness', delta: 15, repDelta: 5, hint: 'Reconocés la rivalidad con respeto.', fixedDesc: '"Sería una falta de respeto no nombrarlo. Es un piloto de élite y me hace mejorar." La honestidad fue bien recibida. Tu némesis lo leyó y guardó silencio.' },
      { text: '"Obstáculo no, sombra."', pers: 'aggressiveness', delta: 35, repDelta: -20, hint: 'Declaración de guerra total.', fixedDesc: 'El paddock estalló. La frase fue reproducida en cada programa de motor durante tres días seguidos. Tu némesis lo vio. La respuesta llegó en la pista.' }
    ]
  },
  {
    id: 'nemesis_talks_trash',
    title: 'Lo que Dijo',
    desc: 'Un periodista te muestra en pantalla una declaración de {{NEMESIS_NAME}} de esta mañana: "Hay pilotos en esta parrilla que no merecen estar en la Formula 1. No voy a dar nombres, pero todos saben de quién hablo."',
    nemesisInterview: true,
    nemesisMonologue: true,
    choices: [
      { text: 'Continuar', pers: 'aggressiveness', delta: 0, hint: '', fixedDesc: '' }
    ]
  },
  {
    id: 'nemesis_talks_respect',
    title: 'Lo que Dijo',
    desc: 'En la conferencia de prensa de ayer, {{NEMESIS_NAME}} fue directo: "Me inspira competir contra él. Me hace mejor piloto. Ojalá sigamos muchos años más peleando por el mismo título."',
    nemesisInterview: true,
    nemesisMonologue: true,
    choices: [
      { text: 'Continuar', pers: 'aggressiveness', delta: 0, hint: '', fixedDesc: '' }
    ]
  }
];


// F1 Car Rating Helper
const getF1CarRating = (stars) => stars === 1 ? 15 : stars === 2 ? 30 : stars === 3 ? 55 : stars === 4 ? 78 : 92;

// Shared power calculation for F1 drivers and player
function getF1DriverPower(skill, carStars) {
  return (skill * 0.25) + (getF1CarRating(carStars) * 0.75);
}

// Helper to apply consequences consistently for both single interviews and grouped press conferences
function applyInterviewConsequences(c, ivId) {
  if (ivId) G.storyFlags['interview_' + ivId] = true;
  if (c.wasEscudero) G.wasEscudero = true;
  
  if (c.pers) {
    let d = c.delta;
    if (d < 0 && G.upgrades.includes('pr_team')) d = Math.round(d * 0.5);
    G.personality[c.pers] = clamp(G.personality[c.pers] + d, -100, 100);
  }
  if (c.pers2) {
    let d2 = c.delta2;
    if (d2 < 0 && G.upgrades.includes('pr_team')) d2 = Math.round(d2 * 0.5);
    G.personality[c.pers2] = clamp(G.personality[c.pers2] + d2, -100, 100);
  }
  
  let actualRepDelta = c.repDelta || 0;
  if (actualRepDelta !== 0) {
    G.reputation += actualRepDelta;
  }
  
  return actualRepDelta; // return for logging purposes
}

function getInterviewPool(postSeasonId = null) {
  return INTERVIEWS.filter(iv => {
    if (iv.requireAcademy && !G.academy) return false;
    
    // Fix: If a specific interview is requested, ensure we haven't seen it yet.
    if (postSeasonId) {
      if (iv.id !== postSeasonId) return false;
      if (G.storyFlags['interview_' + iv.id]) return false;
      return true;
    }
    
    const psIds = ['first_win', 'f1_overpaid', 'f1_fallen_champion', 'f1_carried_by_car', 'f1_shadow_contract_good', 'f1_shadow_contract_bad', 'f1_beaten_by_young_peer', 'f1_epic_champion', 'f1_championship_contender', 'f1_retirement_talk', 'f1_win_record', 'f1_teammate_destroyed', 'f1_first_title', 'f1_title_lost', 'f1_title_record_broken', 'f1_constructors_champ', 'f1_teammate_champ', 'f1_reg_change_better', 'f1_reg_change_worse', 'f1_underperform', 'f1_regulations_criticism', 'f1_academy_sign_filial', 'f1_academy_sign_main', 'f1_academy_leave', 'f1_academy_dropped', 'f1_academy_promoted_main', 'f1_h2h_domination', 'f1_h2h_getting_destroyed', 'f1_new_brand_expansion', 'f1_new_brand_takeover'];
    if (!postSeasonId && (psIds.includes(iv.id) || iv.id.startsWith('ev_') || iv.nemesisInterview)) return false; // Hide post-season interviews from mid-season
    if (iv.nemesisInterview) {
      if (!G.nemesis) return false;
      // nemesis_ahead_comment: makes sense only when nemesis is in a higher cat than us
      if (iv.id === 'nemesis_ahead_comment') {
        const nemDrv = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
        if (!nemDrv) return false;
        const CAT_ORDER = ['Karting','F4','Formula Regional','F3','F2','F1'];
        const nemCatIdx = CAT_ORDER.indexOf(nemDrv.cat);
        if (nemCatIdx <= G.catIndex) return false; // Nemesis must be in a higher category
        if (G.storyFlags['interview_nemesis_ahead_comment']) return false; // No repeats
      }
      // nemesis_champ: only if nemesis is in same cat and they did better than us this season
      if (iv.id === 'nemesis_champ') {
        if (G.catIndex < 5) return false; // F1 only
        if (!G.lastResult) return false;
        const nemDriver = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
        if (!nemDriver || nemDriver.cat !== G.lastResult.cat) return false;
        const approxNemRank = Math.max(1, Math.round((1 - nemDriver.skill / 99) * 20) + 1);
        if (approxNemRank >= G.lastResult.champ) return false; // Nemesis must have beaten us
        if (approxNemRank !== 1) return false; // Nemesis must be champion
      }
      if (iv.id === 'nemesis_retired_comment') {
        if (G.catIndex < 5) return false; // F1 only — retired nemesis commentary only makes sense in F1
        if (!G.nemesis.retired) return false;
        if (G.storyFlags['interview_nemesis_retired_comment']) return false;
      }
      // Press interviews: no repeats, nemesis must be alive
      if (iv.id === 'nemesis_press_compare' || iv.id === 'nemesis_press_rivalry') {
        if (G.nemesis.retired) return false;
        if (G.storyFlags['interview_' + iv.id]) return false;
        if (G.catIndex < 5) return false; // F1 only for press interviews
      }
      // Monologues: no repeats, nemesis must be alive and in F1
      if (iv.id === 'nemesis_talks_trash' || iv.id === 'nemesis_talks_respect') {
        if (G.nemesis.retired) return false;
        if (G.storyFlags['interview_' + iv.id]) return false;
        if (G.catIndex < 5) return false;
        // talks_trash: only if player beat nemesis this year (nemesis might be salty)
        if (iv.id === 'nemesis_talks_trash') {
          const nemDrv = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
          if (!nemDrv || !G.lastResult) return false;
          const nemRank = nemDrv._finalRank || 10;
          if (nemRank <= G.lastResult.champ) return false; // Nemesis must have finished behind player
        }
        // talks_respect: only if nemesis beat player (respect from a position of strength)
        if (iv.id === 'nemesis_talks_respect') {
          const nemDrv = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
          if (!nemDrv || !G.lastResult) return false;
          const nemRank = nemDrv._finalRank || 10;
          if (nemRank >= G.lastResult.champ) return false; // Nemesis must have finished ahead of player
        }
      }
      return true;
    }
    if (G.catIndex < 5) return false; // ONLY IN F1
    if (G.storyFlags['interview_' + iv.id]) return false; // NO REPEATS

    // NEW INTERVIEW LOGIC
    if (iv.id === 'f1_transfer_rumors') {
      if (!G.lastResult || G.lastResult.cat !== 'F1') return false;
      if (G.f1ContractYearsLeft !== 1) return false;
      const expectedPosition = 12 - (G.team ? G.team.stars * 2 : 2); // Roughly expected champ pos
      if (G.lastResult.champ > expectedPosition) return false; // Only if overperforming or doing great
      return true;
    }
    
    
    
    if (iv.id === 'f1_return_to_win') {
      if (!G.lastResult || G.lastResult.cat !== 'F1' || G.lastResult.wins === 0) return false;
      const f1WinSeasons = G.seasons.filter(s => s.cat === 'F1' && s.wins > 0);
      if (f1WinSeasons.length < 2) return false;
      const latestWin = f1WinSeasons[f1WinSeasons.length - 1];
      const previousWin = f1WinSeasons[f1WinSeasons.length - 2];
      if (latestWin.year - previousWin.year < 3) return false; // Must be at least 3 years gap
      return true;
    }
    
    if (iv.id === 'f1_epic_champion') {
      if (!G.lastResult || G.lastResult.cat !== 'F1') return false;
      if (G.lastResult.champ !== 1 || G.team.stars > 4) return false;
      return true;
    }
    
    if (iv.id === 'f1_championship_contender') {
      if (!G.lastResult || G.lastResult.cat !== 'F1') return false;
      if (G.lastResult.champ !== 2 && G.lastResult.champ !== 3) return false;
      return true;
    }
    
    if (iv.id === 'f1_retirement_talk') {
      if (G.age < 35) return false;
      return true;
    }
    
    if (iv.id === 'f1_win_record') {
      if (G.wins < 105) return false; // 105 is Hamilton's count
      return true;
    }
    
    if (iv.id === 'f1_team_orders_obey') {
      if (G.storyFlags['minigame_peer_ordenes'] !== 0) return false; // 0 was 'Acatar'
      return true;
    }
    
    if (iv.id === 'f1_team_orders_ignore') {
      if (G.storyFlags['minigame_peer_ordenes'] !== 1) return false; // 1 was 'Ignorar'
      return true;
    }
    
    if (iv.id === 'f1_rookie_question') {
      if (G.storyFlags['event_rookie'] === undefined) return false;
      return true;
    }
    
    if (iv.id === 'f1_bad_blood') {
      if (!G.peer || G.peer.relationship > -30) return false;
      return true;
    }
    
    if (iv.id === 'f1_dominant_season') {
      if (!G.lastResult || G.lastResult.cat !== 'F1') return false;
      if (G.lastResult.champ !== 1 || G.lastResult.wins < 12) return false;
      return true;
    }

    // General interviews
    if (iv.id === 'rival_crash' && G.seasons.filter(s => s.cat === 'F1').length < 2) return false;
    if (iv.id === 'bad_streak' && (G.wins > 0 || G.podiums > 0)) return false;
    return true;
  });
}



function playPressFlashes(targetElement = null) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0'; container.style.left = '0';
  container.style.width = '100%'; container.style.height = '100%';
  container.style.zIndex = '0'; // Behind the cards
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';
  
  const target = targetElement || document.getElementById('screen-event');
  if (target && target.firstChild) {
    target.insertBefore(container, target.firstChild);
  } else if (target) {
    target.appendChild(container);
  }
  
  if (!target) return container;
  
  // Bring content to the front
  Array.from(target.children).forEach(child => {
    if (child !== container && child.style) {
      child.style.position = 'relative';
      child.style.zIndex = '10';
    }
  });

  let flashCount = 0;
  const maxFlashes = 40; 
  
  const spawnFlash = () => {
    if (flashCount >= maxFlashes) {
      if (flashCount === maxFlashes) {
        flashCount++;
        setTimeout(() => container.remove(), 1000);
      }
      return;
    }
    
    const f = document.createElement('div');
    const size = 60 + Math.random() * 150;
    f.style.position = 'absolute';
    
    // Spread slightly wider for the intro
    f.style.left = (5 + Math.random() * 90) + '%';
    f.style.top = (40 + Math.random() * 60) + '%';
    
    f.style.width = size + 'px';
    f.style.height = size + 'px';
    f.style.transform = 'translate(-50%, -50%) scale(0.5)';
    f.style.background = 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)';
    f.style.borderRadius = '50%';
    f.style.opacity = '1';
    f.style.transition = 'all 0.4s ease-out';
    
    container.appendChild(f);
    void f.offsetWidth;
    
    f.style.transform = 'translate(-50%, -50%) scale(1.5)';
    f.style.opacity = '0';
    
    setTimeout(() => f.remove(), 400);
    
    flashCount++;
    setTimeout(spawnFlash, 25 + Math.random() * 60);
  };
  
  for(let i=0; i<4; i++) spawnFlash();
}

function showPressConference(queue, logs = [], isIntro = true) {

  if (isIntro && queue.length > 0) {
    const overlay = document.createElement('div');
    overlay.id = 'press-intro-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'var(--bg, #0f172a)'; 
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.innerHTML = `
        <div id="press-intro-content" class="anim-intro-enter" style="text-align:center;">
            <div style="font-size: 80px; margin-bottom: 20px;">🎙️</div>
            <h1 style="font-size: 32px; font-weight: 900; color: #fff; letter-spacing: 2px; margin-bottom: 10px; text-transform:uppercase;">Conferencia de Prensa</h1>
            <p style="color: #94a3b8; font-size: 16px;">Los medios esperan tus declaraciones...</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    playPressFlashes(overlay);
    
    setTimeout(() => {
        const content = document.getElementById('press-intro-content');
        if (content) content.className = 'anim-intro-exit';
        setTimeout(() => {
            overlay.remove();
            showPressConference(queue, logs, false);
        }, 400);
    }, 1400);
    return;
  }

  if (queue.length === 0) {
    if (logs.length === 0) {
      processSeasonStep();
      return;
    }
    
    let summaryHtml = '<div class="press-summary-list">';
    logs.forEach(l => {
      if (l.isMonologue) {
         summaryHtml += `
          <div class="press-log-external">
            <div class="log-label">🎙️ Declaración Externa</div>
            <div class="log-text">${l.a}</div>
          </div>`;
      } else {
         summaryHtml += `
          <div class="press-log-question">
            <div class="q-text">
              <span class="q-icon">📸</span> ${l.q}
            </div>
            <div class="a-text">
              "${l.a.replace(/^"|"$/g, '')}"
            </div>
          </div>`;
      }
    });
    summaryHtml += '</div>';
    
    showEventScene({
      icon: '📸',
      title: 'Portadas de los Diarios',
      subtitle: 'La sesión ha terminado. Esto recogen los medios:',
      desc: summaryHtml,
      borderColor: UI_COLORS.blue,
      animate: true,
      choices: [{ text: 'Finalizar Rueda de Prensa' }]
    });
    return;
  }

  const step = queue.shift();
  const postSeasonId = step.startsWith('event:') ? step.split(':')[1] : null;
  let pool = getInterviewPool(postSeasonId);

  if (pool.length === 0) {
    showPressConference(queue, logs, false);
    return;
  }
  
  let ivTemplate = pool.length > 1 ? randFrom(pool) : pool[0];
  const iv = JSON.parse(JSON.stringify(ivTemplate));

  let ivTitle = iv.title;
  let ivDesc = iv.desc;
  if (G.nemesis) {
    const nStyle = `<span style="color:${UI_COLORS.danger};font-weight:bold">${G.nemesis.name}</span>`;
    const nemRegex = /tu n[éèe]mesis/gi;
    ivTitle = ivTitle.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(nemRegex, nStyle);
    ivDesc = ivDesc.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle)
                   .replace(/\{\{NEMESIS_CAT\}\}/g, G.nemesis.cat || 'otra categoría')
                   .replace(nemRegex, nStyle);
  }

  if (iv.nemesisMonologue) {
    G.storyFlags['interview_' + iv.id] = true;
    showEventScene({
      icon: '🎙️',
      title: 'Rueda de Prensa' + (logs.length > 0 ? '' : ''),
      subtitle: ivTitle,
      desc: ivDesc,
      borderColor: UI_COLORS.danger,
      animate: true,
      choices: [{
        text: 'Siguiente Pregunta',
        onClick: () => {
          let logText = iv.desc;
          if (G.nemesis) {
            const nStyle = `<span style="color:${UI_COLORS.danger};font-weight:bold">${G.nemesis.name}</span>`;
            const nemRegex = /tu n[éèe]mesis/gi;
            logText = logText.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(nemRegex, nStyle);
          }
          logs.push({ q: ivTitle, a: logText, isMonologue: true });
          showPressConference(queue, logs, false);
        }
      }]
    });
    return;
  }

  const choices = iv.choices.map(c => {
    let cText = c.text;
    if (G.nemesis) {
      const nStyle = `<span style="color:${UI_COLORS.danger};font-weight:bold">${G.nemesis.name}</span>`;
      const nemRegex = /tu n[éèe]mesis/gi;
      cText = cText.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(nemRegex, nStyle);
    }
    
    return {
      text: cText,
      subtitle: c.hint ? `<span style="color:var(--blue)">${c.hint}</span>` : null,
      reqStars: c.reqStars,
      onClick: () => {
        applyInterviewConsequences(c, iv.id);
        
        let logText = c.logText || `"${cText}"`;
        if (G.nemesis) {
          const nStyle = `<span style="color:${UI_COLORS.danger};font-weight:bold">${G.nemesis.name}</span>`;
          const nemRegex = /tu n[éèe]mesis/gi;
          logText = logText.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(nemRegex, nStyle);
        }
        
        logs.push({ q: ivTitle, a: logText, isMonologue: false });
        showPressConference(queue, logs, false);
      }
    };
  });

  showEventScene({
    icon: '🎙️',
    title: 'Rueda de Prensa' + (logs.length > 0 ? '' : ''),
    subtitle: ivTitle,
    desc: ivDesc,
    borderColor: UI_COLORS.blue,
    animate: true,
    choices: choices
  });
}

/**
 * Helper unificado para mostrar eventos narrativos en el DOM.
 * @param {Object} config - { icon, title, subtitle, desc, choices, borderColor, bgGradient }
 */
function showEventScene(config) {
  resetEventChrome(); // Clean up previous styles

  document.getElementById('ev-icon').innerHTML = config.icon || '🚨';
  document.getElementById('ev-title').innerHTML = config.title || 'Evento';

  const cardDiv = document.querySelector('#screen-event .card');
  if (cardDiv) {
    if (config.borderColor) cardDiv.style.borderLeft = `4px solid ${config.borderColor}`;
    if (config.bgGradient) cardDiv.style.background = `linear-gradient(135deg, ${config.bgGradient} 0%, rgba(15,23,42,0.6) 100%)`;
  }

  let content = '';
  if (config.subtitle) {
    content += `<strong style="font-size:18px; color:#fff">${config.subtitle}</strong><br><br>`;
  }
  if (config.desc) content += config.desc;
  document.getElementById('ev-desc').innerHTML = content;

  const ch = document.getElementById('ev-choices');
  ch.innerHTML = '';

  // The cleanup of previous animations is now handled globally in resetEventChrome()
  if (config.animate) {
    if (cardDiv) cardDiv.classList.add('anim-card-enter');
    ch.classList.add('anim-card-enter');
  }

  const choices = config.choices || [{ text: 'Continuar', onClick: () => processSeasonStep() }];

  choices.forEach(c => {
    const btn = document.createElement('div');
    btn.className = 'minigame-choice';
    if (c.style) Object.assign(btn.style, c.style);

    const isLocked = c.reqStars && G.team && G.team.stars < c.reqStars;

    if (isLocked) {
      btn.classList.add('locked');
      btn.innerHTML = `<h3 style="color:var(--muted)">${c.text} 🔒 (Req: ${c.reqStars}⭐)</h3>`;
    } else {
      btn.innerHTML = c.html ? c.html : `<h3>${c.text}</h3>`;
      if (c.subtitle) {
        const sub = document.createElement('p');
        sub.innerHTML = c.subtitle;
        btn.appendChild(sub);
      }
      btn.onclick = () => {
        const doAction = () => {
          if (cardDiv) {
            cardDiv.style.borderLeft = '';
            cardDiv.style.background = '';
          }
          if (c.onClick) c.onClick();
          else processSeasonStep();
        };
        if (config.animate) {
          if (cardDiv) {
            cardDiv.classList.remove('anim-card-enter');
            cardDiv.classList.add('anim-card-exit');
          }
          ch.classList.remove('anim-card-enter');
          ch.classList.add('anim-card-exit');
          setTimeout(doAction, 280);
        } else {
          doAction();
        }
      };
    }
    ch.appendChild(btn);
  });

  goto('screen-event');
}

function updateRivalries(cat, champ) {
  if (!G.nemesis && G.aiRoster) {
    G.nemesisHeat = G.nemesisHeat || {};
    // Passive heat: being teammates each season
    if (G.peer && G.catIndex === 5) {
      const peerDriver = G.aiRoster.find(d => d.id === G.peer.id);
      if (peerDriver) addNemesisHeat(peerDriver, 15);
    }
    // Accurate championship positions (within 2 places of each other in same category)
    const catDrivers = G.aiRoster.filter(d => d.cat === cat);
    // Sort by _power (simulated performance including car)
    catDrivers.sort((a,b) => (b._power || 0) - (a._power || 0));
    let currentRank = 1;
    catDrivers.forEach(d => {
      if (currentRank === champ) currentRank++; // Skip the player's slot
      d._finalRank = currentRank;
      
      const diff = Math.abs(d._finalRank - champ);
      if (G.catIndex < 5) {
        if (diff === 0) addNemesisHeat(d, 70);
        else if (diff === 1) addNemesisHeat(d, 60);
        else if (diff === 2) addNemesisHeat(d, 35);
      } else {
        if (diff === 0) addNemesisHeat(d, 40);
        else if (diff === 1) addNemesisHeat(d, 30);
        else if (diff === 2) addNemesisHeat(d, 15);
      }
      currentRank++;
    });
  }

  // Nemesis H2H Tracking
  if (G.nemesis && G.aiRoster) {
    const nemDriver = G.aiRoster.find(d => d.id === G.nemesis.id);
    if (nemDriver && nemDriver.cat === cat) {
      G.nemesis.cat = nemDriver.cat;
      // Fallback if _finalRank missing (shouldn't happen)
      const approxNemRank = nemDriver._finalRank || Math.max(1, Math.round((1 - nemDriver.skill / 99) * 20) + 1);
      if (champ < approxNemRank) G.nemesis.h2hWins = (G.nemesis.h2hWins || 0) + 1;
      else if (champ > approxNemRank) G.nemesis.h2hLosses = (G.nemesis.h2hLosses || 0) + 1;
      // Nemesis champion interview (if he won and we didn't)
      if (approxNemRank === 1 && champ > 1 && !G.storyFlags['interview_nemesis_champ']) {
        G._seasonSteps = G._seasonSteps || [];
        G._seasonSteps.push('event:nemesis_champ');
      }

      // Feature 1: Seat Steal
      if (cat === 'F1' && G.f1ContractYearsLeft === 0 && !G.nemesis.retired) {
        const myStars = G.team ? G.team.stars : 0;
        const nemTeam = TEAMS['F1'] && TEAMS['F1'].find(t => t.name === nemDriver.team);
        const nemStars = nemTeam ? nemTeam.stars : 0;
        if (nemStars > myStars && approxNemRank > champ && !G.storyFlags['nemesis_seat_steal_offered']) {
          G._seasonSteps = G._seasonSteps || [];
          G._seasonSteps.push('nemesis_steal_seat');
        }
      }

      // Feature 2: H2H Ultimatum
      if (cat === 'F1' && G.peer && G.peer.id === G.nemesis.id && !G.nemesis.retired) {
        G.nemesis.teammateSeasons = (G.nemesis.teammateSeasons || 0) + 1;
        if (G.nemesis.ultimatumActive) {
          G.nemesis.ultimatumActive = false;
          G._seasonSteps = G._seasonSteps || [];
          if (champ < approxNemRank) {
            G._seasonSteps.push('nemesis_h2h_ultimatum_win'); 
          } else {
            G._seasonSteps.push('nemesis_h2h_ultimatum_lose');
          }
        } else if (!G.storyFlags['nemesis_ultimatum_used'] && G.nemesis.teammateSeasons >= 2 && Math.random() < 0.5) {
          G.nemesis.ultimatumActive = true;
          G._seasonSteps = G._seasonSteps || [];
          G._seasonSteps.push('nemesis_h2h_ultimatum_warn');
        }
      }

      // Press Events
      if (cat === 'F1' && !G.nemesis.retired) {
        if (approxNemRank > champ && !G.storyFlags['interview_nemesis_talks_trash'] && Math.random() < 0.4) {
          G._seasonSteps = G._seasonSteps || [];
          G._seasonSteps.push('event:nemesis_talks_trash');
        }
        if (approxNemRank < champ && !G.storyFlags['interview_nemesis_talks_respect'] && Math.random() < 0.35) {
          G._seasonSteps = G._seasonSteps || [];
          G._seasonSteps.push('event:nemesis_talks_respect');
        }
        if (!G.storyFlags['interview_nemesis_press_compare'] && Math.random() < 0.3) {
          G._seasonSteps = G._seasonSteps || [];
          G._seasonSteps.push('event:nemesis_press_compare');
        }
        if (!G.storyFlags['interview_nemesis_press_rivalry'] && Math.random() < 0.3) {
          G._seasonSteps = G._seasonSteps || [];
          G._seasonSteps.push('event:nemesis_press_rivalry');
        }
      }
    } else if (nemDriver) {
      G.nemesis.cat = nemDriver.cat;
    }

    // Check nemesis retirement
    if (nemDriver && !G.nemesis.retired && nemDriver.age >= 40) {
      G.nemesis.retired = true;
      G._seasonSteps = G._seasonSteps || [];
      G._seasonSteps.push('nemesis_retired');
    }
    // Occasional retired comment
    if (G.nemesis.retired && Math.random() < 0.15 && !G.storyFlags['interview_nemesis_retired_comment']) {
      G._seasonSteps = G._seasonSteps || [];
      G._seasonSteps.push('event:nemesis_retired_comment');
    }
    
    // Add summary log
    const statusStr = G.nemesis.retired ? 'Retirado' : (G.nemesis.cat ? G.nemesis.cat : '');
    G._seasonEventLogs.push(`⚔️ Rivalidad Histórica vs ${G.nemesis.name} (${statusStr}): ${G.nemesis.h2hWins || 0} - ${G.nemesis.h2hLosses || 0}`);
  }
}

function showBrandArrivalScreen(brand, type, oldTeam) {
    let subtitle = '';
    let msg = '';
    if (type === 'expansion') {
        subtitle = `¡${brand} entra a la Fórmula 1!`;
        msg = `La histórica marca ha anunciado la creación de un nuevo equipo oficial. Se suman a la parrilla como el equipo N° ${TEAMS['F1'].length}, listos para competir al máximo nivel.`;
    } else {
        subtitle = `¡${brand} compra ${oldTeam}!`;
        msg = `¡Terremoto en el paddock! ${brand} ha adquirido las instalaciones de ${oldTeam} y competirá bajo su propio nombre a partir de la próxima temporada, heredando todo su desarrollo y personal.`;
        if (G.team && G.team.name === brand) {
            msg += `<br><br><span style="color:var(--accent)"><strong>Eres piloto oficial de ${brand} ahora.</strong></span>`;
        }
    }
    
    showEventScene({
      icon: '🚨',
      title: 'ÚLTIMA HORA EN LA F1',
      subtitle: subtitle,
      desc: msg,
      borderColor: UI_COLORS.danger,
      bgGradient: UI_COLORS.dangerBg
    });
}

function showInterview(postSeasonId = null) {
  let pool = getInterviewPool(postSeasonId);
  if (pool.length === 0) {
    processSeasonStep();
    return;
  }
  
  let ivTemplate = randFrom(pool);
  const iv = JSON.parse(JSON.stringify(ivTemplate));
  
  const isEventMode = iv.id.startsWith('ev_');
  let ivTitle = iv.title;
  let ivDesc = iv.desc;
  
  if (G.nemesis) {
    const nStyle = `<span style="color:${UI_COLORS.danger};font-weight:bold">${G.nemesis.name}</span>`;
    const nemRegex = /tu n[éèe]mesis/gi;
    ivTitle = ivTitle.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(nemRegex, nStyle);
    ivDesc = ivDesc.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle)
                   .replace(/\{\{NEMESIS_CAT\}\}/g, G.nemesis.cat || 'otra categoría')
                   .replace(nemRegex, nStyle);
  }

  G.storyFlags['interview_' + iv.id] = true;

  if (iv.nemesisMonologue) {
    showEventScene({
      icon: '🎙️',
      title: ivTitle,
      desc: ivDesc,
      borderColor: UI_COLORS.danger,
      bgGradient: 'rgba(239, 68, 68, 0.15)',
      animate: true,
      choices: [{ text: 'Continuar' }]
    });
    return;
  }
  
  const choices = iv.choices.map(c => {
    let cText = c.text;
    if (G.nemesis) {
      const nStyle = `<span style="color:${UI_COLORS.danger};font-weight:bold">${G.nemesis.name}</span>`;
      cText = cText.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(/tu n[éèe]mesis/gi, nStyle);
    }
    
    return {
      text: cText,
      subtitle: c.hint ? `<span style="color:var(--blue)">${c.hint}</span>` : null,
      reqStars: c.reqStars,
      onClick: () => {
        let actualRepDelta = applyInterviewConsequences(c, iv.id);
        
        let logText = isEventMode ? `Evento: ${c.text}` : `Entrevista: "${c.text}"`;
        if (actualRepDelta !== 0) {
           logText += ` (${actualRepDelta > 0 ? '+' : ''}${actualRepDelta} Reputación)`;
        }
        G._seasonEventLogs.push(logText);
        
        showEventScene({
           icon: isEventMode ? '⚡' : '🎙️',
           title: isEventMode ? 'Resolución del evento' : 'Declaraciones publicadas',
           desc: `<div class="narrative-box" style="border-left-color: ${isEventMode ? 'var(--accent)' : 'var(--blue)'};">${c.fixedDesc}</div>`,
           borderColor: isEventMode ? UI_COLORS.accent : UI_COLORS.blue,
           bgGradient: isEventMode ? 'rgba(235, 180, 50, 0.15)' : 'rgba(74, 144, 232, 0.15)',
           animate: true,
           choices: [{ text: 'Continuar' }]
        });
      }
    };
  });

  showEventScene({
    icon: isEventMode ? '⚡' : '🎙️',
    title: isEventMode ? 'Evento Exclusivo' : 'Sala de Prensa',
    subtitle: ivTitle,
    desc: ivDesc,
    borderColor: isEventMode ? UI_COLORS.accent : UI_COLORS.blue,
    bgGradient: isEventMode ? 'rgba(235, 180, 50, 0.15)' : 'rgba(74, 144, 232, 0.15)',
    animate: true,
    choices: choices
  });
}

const UPGRADES = [
  // Lujo
  { id: 'jet', name: 'Jet Privado', tier: 'lujo', icon: '✈️', desc: 'Aumenta reputación pasivamente y reduce el cansancio de los viajes.', cost: 10000000, stats: {} },
  { id: 'mansion', name: 'Mansión en Mónaco', tier: 'lujo', icon: '🏰', desc: 'Aumenta reputación y reduce drásticamente el deterioro de las estadísticas por edad.', cost: 20000000, stats: {} },
  { id: 'agent', name: 'Agente Estrella', tier: 'lujo', icon: '👔', desc: 'Los equipos de F1 exigen menos reputación y pagan mejores salarios.', cost: 8000000, stats: {} },
  { id: 'track', name: 'Pista de Kart Personal', tier: 'lujo', icon: '🏁', desc: 'Aumenta la ganancia natural de tus estadísticas.', cost: 4000000, stats: {} },
  { id: 'charity', name: 'Fundación Benéfica', tier: 'lujo', icon: '🤝', desc: 'Aumenta tu reputación cada temporada y mitiga escándalos mediáticos.', cost: 7000000, stats: {} },
  { id: 'yacht', name: 'Yate de Lujo', tier: 'lujo', icon: '🛥️', desc: 'Aumento de reputación. Un mal resultado no dañará tanto tu imagen.', cost: 15000000, stats: {} },
  { id: 'kart_team', name: 'Escudería de Karting Propia', tier: 'lujo', icon: '🏎️', desc: 'Ingresos pasivos anuales y mejora tu ganancia de Velocidad.', cost: 10000000, stats: {} },
  { id: 'cryo', name: 'Cámara Hiperbárica', tier: 'lujo', icon: '🧊', desc: 'Reduce el deterioro físico de la edad (Velocidad y Constancia).', cost: 5000000, stats: {} },

  // Staff
  { id: 'photographer', name: 'Fotógrafo Personal', tier: 'staff', icon: '📸', desc: 'Ganas mucha más reputación al conseguir buenos resultados.', cost: 1000000, stats: {} },
  { id: 'pr_team', name: 'Equipo de PR', tier: 'staff', icon: '🎙️', desc: 'Reduce el impacto de respuestas polémicas a la prensa.', cost: 2000000, stats: {} },
  { id: 'psychologist', name: 'Psicólogo Deportivo', tier: 'staff', icon: '🧠', desc: 'Mitiga la pérdida de moral y reputación tras un abandono (DNF).', cost: 1000000, stats: {} },
  { id: 'mentor', name: 'Mentor Ex-Campeón', tier: 'staff', icon: '👑', desc: 'Aumenta pasivamente tus habilidades para clasificar y adelantar en pista.', cost: 2500000, stats: { quali: 2, overtake: 2 } },
  { id: 'classics', name: 'Colección de Clásicos', tier: 'staff', icon: '🚗', desc: 'Gran impulso a tu reputación histórica.', cost: 4000000, stats: {} },

  // Basicas
  { id: 'trainer', name: 'Preparador Físico', tier: 'basica', icon: '💪', desc: '+3 Constancia (Gestión de Gomas)', cost: 250000, stats: { tyres: 3 } },
  { id: 'nutrition', name: 'Nutricionista', tier: 'basica', icon: '🥗', desc: '+2 Gestión, +1 Velocidad', cost: 150000, stats: { tyres: 2, speed: 1 } },
  { id: 'rain_spec', name: 'Especialista en Lluvia', tier: 'basica', icon: '🌧️', desc: '+3 Lluvia', cost: 200000, stats: { rain: 3 } },
  { id: 'reflex', name: 'Entrenador de Reflejos', tier: 'basica', icon: '⚡', desc: '+3 Velocidad', cost: 250000, stats: { speed: 3 } },
  { id: 'telemetry', name: 'Ingeniero Analista', tier: 'basica', icon: '💻', desc: '+2 Clasificación', cost: 180000, stats: { quali: 2 } },
  { id: 'sparring', name: 'Piloto Sparring', tier: 'basica', icon: '🥊', desc: '+2 Adelantamientos', cost: 150000, stats: { overtake: 2 } }
];

// ═══════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════
let G = {};
let _lastStandings = null; // cache de la clasificación generada para el resumen actual

function resetGame() {
  G = {
    academy: null,
    academyWarnings: 0,
    academyBans: [] // Array of academy IDs that banned the player
  };
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('path-bar').style.display = 'none';
}
function generateInitialRoster() {
  const roster = [];
  let idCounter = 1;
  const generateDriver = (name, team, age, nat, cat, skill) => {
    let flag = '🏁';
    const foundNat = NATIONALITIES.find(n => n.name === nat);
    if (foundNat) flag = foundNat.flag;
    const stars = (TEAMS[cat] || []).find(t => t.name === team)?.stars || 3;
    const contractYearsLeft = Math.floor(Math.random() * (stars >= 4 ? 4 : 2)) + 2;
    const avatar = EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)];
    roster.push({ id: 'ai_' + idCounter++, name, team, age, flag, cat, skill, contractYearsLeft, consecutiveLosses: 0, avatar });
  };

  // F1
  generateDriver('Kimi Antonelli', 'Mercedes', 20, 'Italia', 'F1', 88);
  generateDriver('George Russell', 'Mercedes', 28, 'Reino Unido', 'F1', 92);
  generateDriver('Lewis Hamilton', 'Ferrari', 41, 'Reino Unido', 'F1', 95);
  generateDriver('Charles Leclerc', 'Ferrari', 28, 'Mónaco', 'F1', 94);
  generateDriver('Lando Norris', 'McLaren', 26, 'Reino Unido', 'F1', 94);
  generateDriver('Oscar Piastri', 'McLaren', 25, 'Australia', 'F1', 91);
  generateDriver('Max Verstappen', 'Red Bull', 29, 'Países Bajos', 'F1', 98);
  generateDriver('Isack Hadjar', 'Red Bull', 22, 'Francia', 'F1', 84);
  generateDriver('Liam Lawson', 'Racing Bulls', 24, 'Nueva Zelanda', 'F1', 85);
  generateDriver('Arvid Lindblad', 'Racing Bulls', 19, 'Reino Unido', 'F1', 81);
  generateDriver('Pierre Gasly', 'Alpine', 30, 'Francia', 'F1', 86);
  generateDriver('Franco Colapinto', 'Alpine', 23, 'Argentina', 'F1', 87);
  generateDriver('Oliver Bearman', 'Haas F1', 21, 'Reino Unido', 'F1', 86);
  generateDriver('Esteban Ocon', 'Haas F1', 30, 'Francia', 'F1', 85);
  generateDriver('Gabriel Bortoleto', 'Audi', 22, 'Brasil', 'F1', 85);
  generateDriver('Nico Hülkenberg', 'Audi', 39, 'Alemania', 'F1', 85);
  generateDriver('Carlos Sainz', 'Williams', 32, 'España', 'F1', 90);
  generateDriver('Alexander Albon', 'Williams', 30, 'Tailandia', 'F1', 86);
  generateDriver('Fernando Alonso', 'Aston Martin', 45, 'España', 'F1', 92);
  generateDriver('Lance Stroll', 'Aston Martin', 28, 'Canadá', 'F1', 81);
  generateDriver('Valtteri Bottas', 'Cadillac', 37, 'Finlandia', 'F1', 83);
  generateDriver('Sergio Pérez', 'Cadillac', 36, 'México', 'F1', 84);

  // F2
  generateDriver('Rafael Câmara', 'Invicta', 21, 'Brasil', 'F2', 78);
  generateDriver('Joshua Dürksen', 'Invicta', 22, 'Paraguay', 'F2', 76);
  generateDriver('Ritomo Miyata', 'Hitech Pulse-Eight', 26, 'Japón', 'F2', 75);
  generateDriver('Colton Herta', 'Hitech Pulse-Eight', 26, 'Estados Unidos', 'F2', 80);
  generateDriver('Noel León', 'Campos', 21, 'México', 'F2', 73);
  generateDriver('Nikola Tsolov', 'Campos', 19, 'Bulgaria', 'F2', 74);
  generateDriver('Dino Beganovic', 'DAMS', 22, 'Suecia', 'F2', 76);
  generateDriver('Roman Bilinski', 'DAMS', 22, 'Polonia', 'F2', 71);
  generateDriver('Gabriele Minì', 'MP Motorsport', 21, 'Italia', 'F2', 79);
  generateDriver('Oliver Goethe', 'MP Motorsport', 21, 'Alemania', 'F2', 75);
  generateDriver('Sebastián Montoya', 'Prema', 21, 'Colombia', 'F2', 72);
  generateDriver('Mari Boya', 'Prema', 22, 'España', 'F2', 74);
  generateDriver('Martinius Stenshorne', 'Rodin Motorsport', 20, 'Noruega', 'F2', 75);
  generateDriver('Alex Dunne', 'Rodin Motorsport', 20, 'Irlanda', 'F2', 77);
  generateDriver('Kush Maini', 'ART Grand Prix', 25, 'India', 'F2', 76);
  generateDriver('Tasanapol Inthraphuvasak', 'ART Grand Prix', 20, 'Tailandia', 'F2', 70);
  generateDriver('Emerson Fittipaldi Jr.', 'AIX Racing', 19, 'Brasil', 'F2', 69);
  generateDriver('Cian Shields', 'AIX Racing', 21, 'Reino Unido', 'F2', 68);
  generateDriver('Nicolás Varrone', 'Van Amersfoort', 25, 'Argentina', 'F2', 73);
  generateDriver('Rafael Villagómez', 'Van Amersfoort', 24, 'México', 'F2', 71);
  generateDriver('Laurens van Hoepen', 'Trident', 20, 'Países Bajos', 'F2', 72);
  generateDriver('John Bennett', 'Trident', 22, 'Reino Unido', 'F2', 70);

  // F3
  generateDriver('Théophile Naël', 'Campos', 18, 'Francia', 'F3', 68);
  generateDriver('Ugo Ugochukwu', 'Campos', 19, 'Estados Unidos', 'F3', 70);
  generateDriver('Ernesto Rivera', 'Campos', 17, 'México', 'F3', 65);
  generateDriver('Noah Strømsted', 'Trident', 18, 'Dinamarca', 'F3', 66);
  generateDriver('Freddie Slater', 'Trident', 18, 'Reino Unido', 'F3', 72);
  generateDriver('Matteo De Palo', 'Trident', 18, 'Italia', 'F3', 67);
  generateDriver('Mattia Colnaghi', 'MP Motorsport', 18, 'Argentina', 'F3', 68);
  generateDriver('Tuukka Taponen', 'MP Motorsport', 19, 'Finlandia', 'F3', 70);
  generateDriver('Alessandro Giusti', 'MP Motorsport', 19, 'Francia', 'F3', 69);
  generateDriver('Taito Kato', 'ART Grand Prix', 18, 'Japón', 'F3', 65);
  generateDriver('Maciej Gładysz', 'ART Grand Prix', 18, 'Polonia', 'F3', 67);
  generateDriver('Kanato Le', 'ART Grand Prix', 19, 'Japón', 'F3', 64);
  generateDriver('Hiyu Yamakoshi', 'Van Amersfoort', 19, 'Japón', 'F3', 68);
  generateDriver('Enzo Deligny', 'Van Amersfoort', 18, 'Francia', 'F3', 69);
  generateDriver('Bruno del Pino', 'Van Amersfoort', 20, 'España', 'F3', 65);
  generateDriver('Pedro Clerot', 'Rodin Motorsport', 19, 'Brasil', 'F3', 66);
  generateDriver('Brando Badoer', 'Rodin Motorsport', 19, 'Italia', 'F3', 69);
  generateDriver('Christian Ho', 'Rodin Motorsport', 19, 'Singapur', 'F3', 67);
  generateDriver('Louis Sharp', 'Prema', 19, 'Nueva Zelanda', 'F3', 71);
  generateDriver('James Wharton', 'Prema', 20, 'Australia', 'F3', 70);
  generateDriver('José Garfias', 'Prema', 21, 'México', 'F3', 63);
  generateDriver('Michael Shin', 'Hitech', 22, 'Corea del Sur', 'F3', 62);
  generateDriver('Fionn McLaughlin', 'Hitech', 18, 'Irlanda', 'F3', 65);
  generateDriver('Jin Nakamura', 'Hitech', 20, 'Japón', 'F3', 64);
  generateDriver('Rafael Escotto', 'AIX Racing', 18, 'México', 'F3', 61);
  generateDriver('Yevan David', 'AIX Racing', 19, 'Sri Lanka', 'F3', 62);
  generateDriver('Fernando Barrichello', 'AIX Racing', 20, 'Brasil', 'F3', 60);
  generateDriver('Nicola Lacorte', 'Jenzer Motorsport', 18, 'Italia', 'F3', 66);
  generateDriver('Nandhavud Bhirombhakdi', 'Jenzer Motorsport', 20, 'Tailandia', 'F3', 61);
  generateDriver('Gerrard Xie', 'Jenzer Motorsport', 19, 'China', 'F3', 63);

  // Auto-generate missing for Formula Regional (3x8=24) and F4 (3x8=24)
  const catsToGen = [{ cat: 'Formula Regional', baseSkill: 50, age: 17 }, { cat: 'F4', baseSkill: 40, age: 16 }];
  catsToGen.forEach(ctg => {
    TEAMS[ctg.cat].forEach(t => {
      for (let i = 0; i < 3; i++) {
        const first = ["L.", "M.", "A.", "J.", "T.", "O.", "C.", "S.", "E.", "P."][Math.floor(Math.random()*10)];
        const last = ["Rossi", "Müller", "Smith", "Dubois", "Silva", "Kim", "Olsen", "López", "Ricci", "Novak"][Math.floor(Math.random()*10)];
        const skill = ctg.baseSkill + Math.floor(Math.random()*10);
        const nat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
        roster.push({ id: 'ai_' + idCounter++, name: first + ' ' + last, team: t.name, age: ctg.age + Math.floor(Math.random()*3), flag: nat.flag, cat: ctg.cat, skill });
      }
    });
  });

  return roster;
}

function initState(name, number, nat, talent) {
  const potential = 90 + Math.floor(Math.random() * 10); // 90-99
  G = {
    name, number, nat, talent,
    potential,
    year: new Date().getFullYear(),
    age: 14,
    catIndex: 0,
    stats: {
      speed: 45 + Math.floor(Math.random() * 6),
      quali: 45 + Math.floor(Math.random() * 6),
      rain: 45 + Math.floor(Math.random() * 6),
      tyres: 45 + Math.floor(Math.random() * 6),
      overtake: 45 + Math.floor(Math.random() * 6)
    },
    money: 50000,
    reputation: 0,
    aiRoster: generateInitialRoster(),
    _seasonEventLogs: [],
    team: TEAMS['Karting'][0],
    seasons: [],
    wins: 0, podiums: 0, poles: 0, dnfs: 0, totalMoney: 50000,
    upgrades: [],
    chosenActivity: null,
    lastResult: null,
    careerBest: null,
    historicRival: null,
    f1Titles: 0,
    epicTitles: 0,
    f1ContractYearsLeft: 0,
    blacklistedTeams: [],     // teams that will never offer a contract again (shadow-offer betrayal)
    _shadowBetrayalActive: false, // true when the dev-focus event this season must be skipped (betrayal fallout)
    _shadowSecretTeam: null,  // name of the team the player secretly pre-signed with
    _shadowOldTeam: null,     // name of the team that got betrayed
    _shadowVerdictPending: false, // true until the "was it worth it" reveal message is shown
    regulationBonus: 0,      // rating bonus for THIS season (player focused on current)
    nextSeasonRegBonus: 0,
      nextSeasonRegPenalty: 0,   // star bonus applied when reg change fires
    _pendingRegChange: false, // true when a reg change is queued this season
    lastRegChangeYear: 0,    // tracks the last year a regulation change occurred
    nickname: null,
    nicknameHistory: [],
    renewalsCount: 0,
    nonRenewalsCount: 0,
    newNicknameThisSeason: null,
    _goldenBoyChecked: false,
    _pendriveUsed: false,
    f1ConsecutiveTitles: 0,
    // Living table of F1 world champion title counts (seed with real history)
    aiChampions: {
      'Michael Schumacher': 7,
      'Lewis Hamilton': 7,
      'Juan Manuel Fangio': 5,
      'Alain Prost': 4,
      'Sebastian Vettel': 4,
      'Max Verstappen': 4
    },
    _directivaUsed: false,
    peer: null,
    _peerInitialized: false,
    wetWins: 0,
    storyFlags: {},
    personality: { aggressiveness: 0, media: 0, team: 0 },
    sponsor: null,
    loanUsed: false,
    loanDebt: 0,
    nemesis: null,       // { id, name, retired: false } — fijado al llegar a 100 de tensión
    nemesisHeat: {},     // { 'ai_12': 45 } — tensión acumulada por piloto
  };
  // apply talent
  const t = TALENTS.find(x => x.id === talent);
  if (t) for (const [k, v] of Object.entries(t.stats)) G.stats[k] += v;
  // apply nat flag
  G.flag = NATIONALITIES.find(x => x.name === nat)?.flag || '🏁';
}

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
function goto(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════
//  TITLE SCREEN → just show, nothing needed
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
//  CREATE SCREEN
// ═══════════════════════════════════════════════════════════
(function buildCreate() {
  // Nationalities
  const ng = document.getElementById('nat-grid');
  NATIONALITIES.forEach(n => {
    const b = document.createElement('div');
    b.className = 'nat-btn';
    b.innerHTML = `${n.flag}<span>${n.name}</span>`;
    b.onclick = () => { ng.querySelectorAll('.nat-btn').forEach(x => x.classList.remove('selected')); b.classList.add('selected'); b.dataset.nat = n.name; };
    b.dataset.nat = n.name;
    ng.appendChild(b);
  });

  // Talents
  const tl = document.getElementById('talent-list');
  TALENTS.forEach(t => {
    const b = document.createElement('div');
    b.className = 'talent-btn';
    b.innerHTML = `<h3>${t.name}</h3><p>${t.desc}</p><div class="bonus">${t.bonus}</div>`;
    b.onclick = () => { tl.querySelectorAll('.talent-btn').forEach(x => x.classList.remove('selected')); b.classList.add('selected'); b.dataset.id = t.id; };
    b.dataset.id = t.id;
    tl.appendChild(b);
  });
})();

function startGame() {
  const name = document.getElementById('pilot-name').value.trim() || 'Sin nombre';
  let number = parseInt(document.getElementById('pilot-number').value, 10);
  if (isNaN(number)) number = 1;
  number = clamp(number, 1, 99);

  const natBtn = document.querySelector('.nat-btn.selected');
  const nat = natBtn ? natBtn.dataset.nat : 'Argentina';
  const talBtn = document.querySelector('.talent-btn.selected');
  const talent = talBtn ? talBtn.dataset.id : 'speed';

  initState(name, number, nat, talent);
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('path-bar').style.display = 'block';
  updateTopBar();
  updatePathBar();
  buildPreseason();
  goto('screen-preseason');
}

// ═══════════════════════════════════════════════════════════
//  TOP BAR & PATH BAR
// ═══════════════════════════════════════════════════════════
function updateTopBar() {
  const ovr = Math.round(Object.values(G.stats).reduce((a, b) => a + b) / 5);
  document.getElementById('tb-name').textContent = `${G.flag} ${G.name} #${G.number}`;
  const nickLine = G.nickname ? `"${G.nickname}" · ` : '';
  document.getElementById('tb-cat').textContent = `${nickLine}${CATEGORIES[G.catIndex]}`;
  
  if (G.catIndex === 5 && G.team && G.team.logo) {
    document.getElementById('tb-academy').innerHTML = `<img src="${G.team.logo}" width="16" height="16" style="vertical-align:middle;object-fit:contain" title="${G.team.name}">`;
  } else if (G.academy) {
    const ac = ACADEMIES.find(a => a.id === G.academy);
    document.getElementById('tb-academy').innerHTML = `<img src="${ac.icon}" width="16" height="16" style="vertical-align:middle;object-fit:contain" title="${ac.name}">`;
  } else {
    document.getElementById('tb-academy').innerHTML = '';
  }

  const topbarEl = document.getElementById('topbar');
  if (G.catIndex === 5 && G.team && G.team.name) {
    const color = TEAM_COLORS[G.team.name] || 'transparent';
    topbarEl.style.setProperty('--team-color', color);
    
    // Create a shadow color with opacity by converting hex to rgba if needed, 
    // but a simple shadow using the same color usually works if we don't mind it being strong.
    // Let's just use the color directly.
    topbarEl.style.setProperty('--team-color-shadow', color === 'transparent' ? 'transparent' : color);
  } else {
    topbarEl.style.setProperty('--team-color', 'transparent');
    topbarEl.style.setProperty('--team-color-shadow', 'transparent');
  }

  document.getElementById('tb-ovr').textContent = ovr;
  document.getElementById('tb-rep').textContent = G.reputation;
  
  const lastMoney = typeof G._uiLastMoney === 'undefined' ? G.money : G._uiLastMoney;
  if (lastMoney !== G.money) {
    animateCount(document.getElementById('tb-money'), G.money, { startValue: lastMoney, formatter: fmt$ });
    const moneyDisplay2 = document.getElementById('money-display2');
    if (moneyDisplay2) animateCount(moneyDisplay2, G.money, { startValue: lastMoney, formatter: v => v.toLocaleString('es-AR') });
    const upgradeMoney = document.getElementById('upgrade-money');
    if (upgradeMoney) animateCount(upgradeMoney, G.money, { startValue: lastMoney, formatter: fmt$ });
    G._uiLastMoney = G.money;
  } else {
    document.getElementById('tb-money').textContent = fmt$(G.money);
    const moneyDisplay2 = document.getElementById('money-display2');
    if (moneyDisplay2) moneyDisplay2.textContent = G.money.toLocaleString('es-AR');
    const upgradeMoney = document.getElementById('upgrade-money');
    if (upgradeMoney) upgradeMoney.textContent = fmt$(G.money);
    G._uiLastMoney = G.money;
  }
}

function updatePathBar() {
  if (typeof G._uiLastCatIdx === 'undefined') G._uiLastCatIdx = G.catIndex;
  if (G.catIndex > G._uiLastCatIdx) {
    G._uiPromoteAnimUntil = Date.now() + 3000; // Trigger glow for up to 3 seconds across redraws
    G._uiLastCatIdx = G.catIndex;
  }
  const isAnimatingPromotion = G._uiPromoteAnimUntil && Date.now() < G._uiPromoteAnimUntil;

  const SHORT = { 'Karting': 'Karting', 'F4': 'F4', 'Formula Regional': 'FR', 'F3': 'F3', 'F2': 'F2', 'F1': 'F1' };
  const row = document.getElementById('path-row');
  row.innerHTML = '';
  CATEGORIES.forEach((c, i) => {
    const s = document.createElement('div');
    const isCurrent = i === G.catIndex;
    s.className = 'path-step ' + (i < G.catIndex ? 'done' : isCurrent ? 'current' : 'future');
    
    if (isCurrent && isAnimatingPromotion) {
      s.classList.add('promoted-glow');
    }

    const logo = CAT_LOGOS[c];
    const label = SHORT[c] || c;
    if (logo) {
      s.innerHTML = `<img src="${logo}" alt="${label}" style="height:20px;object-fit:contain;opacity:${i <= G.catIndex ? '1' : '0.35'}">`;
    } else {
      s.textContent = label;
    }
    row.appendChild(s);
    if (i < CATEGORIES.length - 1) {
      const a = document.createElement('div');
      a.className = 'path-arrow';
      a.textContent = '›';
      row.appendChild(a);
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  PRESEASON SCREEN
// ═══════════════════════════════════════════════════════════
function buildPreseason() {
  const cat = CATEGORIES[G.catIndex];
  document.getElementById('pre-season-label').textContent = `Temporada ${G.year} (Edad: ${G.age})`;

  // Category label with logo
  const catLogoSrc = CAT_LOGOS[cat];
  const catEl = document.getElementById('pre-cat-label');
  if (catLogoSrc) {
    catEl.innerHTML = `<img src="${catLogoSrc}" alt="${cat}" style="height:34px;object-fit:contain;vertical-align:middle">`;
  } else {
    catEl.textContent = cat;
  }

  // Temporary surprise performance already calculated in processNextStep
  const isRegChange = cat === 'F1' && G.lastRegChangeYear === (G.year - 1);

  const effectiveStars = G.team.stars + (G._tempStarBonus || 0);

  // Team label with logo
  const teamEl = document.getElementById('pre-team-label');

  let regChangeHtml = '';
  if (isRegChange) {
    regChangeHtml = `<div style="color:var(--warning);font-size:13px;margin-top:4px">⚠️ Nuevo Reglamento: Tu equipo tiene ${effectiveStars} estrellas</div>`;
  } else if (G._tempStarBonus) {
    const msg = G._tempStarBonus > 0
      ? `🚀 ¡Sorpresa! El auto rinde mejor de lo esperado. (+1 Estrella esta temporada)`
      : `📉 Problemas de diseño. El auto rinde peor de lo esperado. (-1 Estrella esta temporada)`;
    const color = G._tempStarBonus > 0 ? '#4ade80' : '#f87171';
    regChangeHtml = `<div style="color:${color};font-size:13px;margin-top:4px">${msg}</div>`;
  }

  if (G.team.logo) {
    teamEl.innerHTML = `<div style="display:inline-flex;align-items:center;gap:8px"><span style="background:rgba(255,255,255,0.08);border-radius:6px;padding:3px 8px;display:inline-flex;align-items:center"><img src="${G.team.logo}" alt="${G.team.name}" style="height:20px;max-width:60px;object-fit:contain"></span>${G.team.name}</div>${regChangeHtml}`;
  } else {
    teamEl.innerHTML = `<div>Equipo: ${G.team.name}</div>${regChangeHtml}`;
  }

  renderStatsDisplay();
  buildActivities();
  G.chosenActivity = null;
  
  updateTopBar();
  updatePathBar();
}

function renderStatsDisplay() {
  const stats = [
    { key: 'speed', label: 'VEL' },
    { key: 'quali', label: 'CLA' },
    { key: 'rain', label: 'LLU' },
    { key: 'tyres', label: 'GES' },
    { key: 'overtake', label: 'ADE' },
  ];
  const el = document.getElementById('stats-display');

  const tierColor = (v) => {
    if (v >= 80) return 'var(--accent)';
    if (v >= 60) return 'var(--green)';
    if (v >= 40) return 'var(--blue)';
    return 'var(--accent2)';
  };

  const values = stats.map(s => Math.round(G.stats[s.key]));
  const best = Math.max(...values);

  el.innerHTML = `<div class="mini-stat-row">
    ${stats.map((s, i) => {
      const v = values[i];
      const color = tierColor(v);
      const isBest = v === best;
      const fillPct = Math.max(4, Math.min(100, Math.round((v / 99) * 100)));
      return `
      <div class="mini-stat-box">
        <div class="mini-stat-label">${s.label}</div>
        <div class="mini-stat-val" style="color:${color}">${v}</div>
        <div class="mini-stat-bar"><div class="mini-stat-fill" style="width:${fillPct}%; background:${color}"></div></div>
      </div>`;
    }).join('')}
  </div>`;
}

function buildActivities() {
  // Pick 5 activities: 3 common + chance of rare/legendary
  const filterAct = act => !act.requireAcademy || G.academy;
  const pool = [...ACTIVITIES_COMMON].filter(filterAct);
  const picked = shuffle(pool).slice(0, 3);
  
  const rarePool = ACTIVITIES_RARE.filter(filterAct);
  if (Math.random() < 0.15 && rarePool.length > 0) picked.push(randFrom(rarePool));
  
  const legPool = ACTIVITIES_LEGENDARY.filter(filterAct);
  if (Math.random() < 0.03 && legPool.length > 0) picked.push(randFrom(legPool));

  // Actividad garantizada: "Actividades con patrocinadores" (solo en formativas)
  if (G.catIndex < 5) { // < 5 significa Karting, F4, FR, F3, F2
     const seatCost = SEAT_COSTS[G.catIndex][0]; // Asiento más barato de la categoría actual
     const payAmount = Math.floor(seatCost * 0.5);
     picked.push({
       id: 'sponsor_activity',
       name: 'Actividades con patrocinadores',
       icon: '🤝',
       bonus: `Recompensa: $${payAmount.toLocaleString()}`,
       stats: {},
       money: payAmount,
       rarity: 'common'
     });
  }

  const el = document.getElementById('preseason-activities');
  el.innerHTML = '';
  picked.forEach((act, i) => {
    const c = document.createElement('div');
    c.className = `card selectable rarity-${act.rarity}`;
    c.style.marginBottom = '10px';
    const rarityBadge = act.rarity === 'legendary' ? `<span class="badge badge-gold" style="margin-left:8px">LEGENDARIA</span>` :
      act.rarity === 'rare' ? `<span class="badge badge-blue" style="margin-left:8px">RARA</span>` : '';
    c.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:24px">${act.icon}</span>
        <div style="flex:1"><strong style="font-size:15px">${act.name}</strong>${rarityBadge}</div>
      </div>
      <div class="sub" style="margin-bottom:4px">${act.bonus}</div>
    `;
    c.onclick = () => {
      el.querySelectorAll('.card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      G.chosenActivity = act;
      runSimulation();
    };
    el.appendChild(c);
  });
}

// ═══════════════════════════════════════════════════════════
//  RACE VISUALIZER
// ═══════════════════════════════════════════════════════════
let _raceAnimFrame = null;
let _raceRacers = null;
let _raceStartTime = null;

const RACE_W = 360, RACE_H = 170;
const RT = { x0: 60, x1: 300, cy: 85, r: 52 };
const RACE_STRAIGHT = RT.x1 - RT.x0;
const RACE_ARC = Math.PI * RT.r;
const RACE_PERIM = 2 * RACE_STRAIGHT + 2 * RACE_ARC;

function trackPoint(t) {
  t = ((t % 1) + 1) % 1;
  let d = t * RACE_PERIM;
  if (d < RACE_STRAIGHT) return { x: RT.x0 + d, y: RT.cy - RT.r };
  d -= RACE_STRAIGHT;
  if (d < RACE_ARC) {
    const a = -Math.PI / 2 + (d / RACE_ARC) * Math.PI;
    return { x: RT.x1 + RT.r * Math.cos(a), y: RT.cy + RT.r * Math.sin(a) };
  }
  d -= RACE_ARC;
  if (d < RACE_STRAIGHT) return { x: RT.x1 - d, y: RT.cy + RT.r };
  d -= RACE_STRAIGHT;
  const a = Math.PI / 2 + (d / RACE_ARC) * Math.PI;
  return { x: RT.x0 + RT.r * Math.cos(a), y: RT.cy + RT.r * Math.sin(a) };
}

function initRaceRacers() {
  const N = 9;
  const racers = [];
  for (let i = 0; i < N; i++) {
    racers.push({
      startOffset: i / N,
      speed: 0.55 + Math.random() * 0.18,
      oscAmp: 0.010 + Math.random() * 0.02,
      oscFreq: 0.6 + Math.random() * 1.1,
      oscPhase: Math.random() * Math.PI * 2,
      color: RACE_COLORS[i % RACE_COLORS.length],
    });
  }
  return racers;
}

const RACE_COLORS = ['#e84a4a', '#4a90e8', '#4ae87a', '#c084fc', '#f0a04a', '#4ae0e8', '#e84ac0', '#9ae84a'];

function drawRaceTrack(ctx) {
  ctx.clearRect(0, 0, RACE_W, RACE_H);
  ctx.lineWidth = 26;
  ctx.strokeStyle = '#1c1c2c';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(RT.x0, RT.cy - RT.r);
  ctx.lineTo(RT.x1, RT.cy - RT.r);
  ctx.arc(RT.x1, RT.cy, RT.r, -Math.PI / 2, Math.PI / 2, false);
  ctx.lineTo(RT.x0, RT.cy + RT.r);
  ctx.arc(RT.x0, RT.cy, RT.r, Math.PI / 2, Math.PI * 1.5, false);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.stroke();

  const sfX = RT.x0 + 14;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
    ctx.fillRect(sfX, RT.cy - RT.r - 13 + i * 4.4, 4, 4.4);
  }
}

function raceAnimFrame(ts) {
  if (!_raceStartTime) _raceStartTime = ts;
  const elapsed = (ts - _raceStartTime) / 1000;
  const canvas = document.getElementById('race-canvas');
  if (!canvas) { _raceAnimFrame = null; return; }
  const ctx = canvas.getContext('2d');
  drawRaceTrack(ctx);

  const withPos = _raceRacers.map(r => {
    const t = r.startOffset + elapsed * r.speed * 0.28 + r.oscAmp * Math.sin(elapsed * r.oscFreq + r.oscPhase);
    return { r, t: ((t % 1) + 1) % 1 };
  }).sort((a, b) => a.t - b.t);

  withPos.forEach(({ r, t }) => {
    const p = trackPoint(t);
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  _raceAnimFrame = requestAnimationFrame(raceAnimFrame);
}

function startRaceAnimation() {
  stopRaceAnimation();
  const canvas = document.getElementById('race-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = RACE_W * dpr;
  canvas.height = RACE_H * dpr;
  canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);

  _raceRacers = initRaceRacers();
  _raceStartTime = null;
  _raceAnimFrame = requestAnimationFrame(raceAnimFrame);
}

function stopRaceAnimation() {
  if (_raceAnimFrame) {
    cancelAnimationFrame(_raceAnimFrame);
    _raceAnimFrame = null;
  }
}

// ═══════════════════════════════════════════════════════════
//  SIMULATION
// ═══════════════════════════════════════════════════════════
function runSimulation() {
  // Apply activity
  if (G.chosenActivity) {
    for (const [k, v] of Object.entries(G.chosenActivity.stats || {})) {
      G.stats[k] = Math.min(G.potential, G.stats[k] + v);
    }
    if (G.chosenActivity.money) {
      G.money += G.chosenActivity.money;
      G.totalMoney += G.chosenActivity.money;
    }
  }
  // Apply upgrades
  G.upgrades.forEach(uid => {
    const u = UPGRADES.find(x => x.id === uid);
    // upgrades are applied once on purchase
  });

  // Natural growth is moved into the timeout so we can log it

  // Show simulation screen
  document.getElementById('sim-cat').textContent = CATEGORIES[G.catIndex];
  const statuses = ['Calculando resultados...', 'Simulando carreras...', 'Contando puntos...', 'Preparando resumen...'];
  let si = 0;
  const iv = setInterval(() => { document.getElementById('sim-status').textContent = statuses[Math.min(si++, statuses.length - 1)]; }, 500);

  // Reset load bar
  const lb = document.getElementById('load-bar');
  lb.style.animation = 'none';
  lb.offsetHeight; // reflow
  lb.style.animation = '';
  lb.style.setProperty('--dur', '2s');

  let raceWrap = document.querySelector('.race-track-wrap');
  if (!raceWrap) {
    raceWrap = document.createElement('div');
    raceWrap.className = 'race-track-wrap';
    raceWrap.innerHTML = '<canvas id="race-canvas" width="360" height="170"></canvas>';
    const simScreen = document.getElementById('screen-simulating');
    const loadBarWrap = lb.parentElement;
    simScreen.insertBefore(raceWrap, loadBarWrap);
  }

  goto('screen-simulating');
  startRaceAnimation();
  setTimeout(() => {
    clearInterval(iv);
    stopRaceAnimation();

    G._seasonSteps = [];
    G._seasonEventLogs = [];
    G._minigamePowerBonus = 0; // reset each season

    // Natural growth (aging curve)
    const age = G.age;
    let logMsg = '';

    // Team focus growth multiplier (only formative categories)
    // desarrollo = old baseline, equilibrado = slightly less, ganar = much less
    const focusGrowthMult = (G.team && G.team.focus === 'desarrollo') ? 1.0
      : (G.team && G.team.focus === 'ganar') ? 0.55
        : 0.8; // equilibrado or F1

    const tb = G.upgrades.includes('track') ? 0.75 : 0;
    
    const applyStatDelta = (k, rawDelta, decayMult = 1) => {
      let delta = rawDelta * decayMult;
      if (k === G.talent) {
        // Talent passive: 10% extra growth, 10% less decay
        delta = delta >= 0 ? delta * 1.1 : delta * 0.9;
      }
      G.stats[k] = clamp(G.stats[k] + delta, 1, G.potential);
    };

    if (age < 18) {
      logMsg = `🌱 Por tu juventud (Edad ${age}), tus atributos mejoraron notablemente.`;
      if (tb) logMsg += ' (Bonus de Pista)';
      for (const k of Object.keys(G.stats)) applyStatDelta(k, (3 + Math.random() * 2.5 + tb) * focusGrowthMult);
    }
    else if (age < 23) {
      logMsg = `🌱 Seguís desarrollándote a gran ritmo (Edad ${age}).`;
      for (const k of Object.keys(G.stats)) applyStatDelta(k, (1.5 + Math.random() * 2 + tb) * focusGrowthMult);
    }
    else if (age < 28) {
      logMsg = `🌱 Acercándote a tu máximo potencial (Edad ${age}), seguís puliendo detalles.`;
      for (const k of Object.keys(G.stats)) applyStatDelta(k, (0.3 + Math.random() * 1.7 + tb) * focusGrowthMult);
    }
    else if (age < 34) {
      logMsg = `⚖️ Estás en tu plenitud física y mental (Edad ${age}). Atributos estables.`;
      for (const k of Object.keys(G.stats)) applyStatDelta(k, (Math.random() * 1.5 - 0.9 + tb));
    }
    else if (age < 38) {
      logMsg = `📉 Los años empiezan a pesar (Edad ${age}). Tus reflejos y estado físico caen notablemente.`;
      const decayMult = G.upgrades.includes('cryo') ? 0.2 : (G.upgrades.includes('mansion') ? 0.5 : 1); 
      if(decayMult<1) logMsg+=' (Mitigado)';
      for (const k of Object.keys(G.stats)) applyStatDelta(k, -(1 + Math.random() * 3), decayMult);
    }
    else {
      logMsg = `📉 Estás en el ocaso de tu carrera (Edad ${age}). Tus atributos se desploman.`;
      const decayMult2 = G.upgrades.includes('cryo') ? 0.2 : (G.upgrades.includes('mansion') ? 0.5 : 1); 
      if(decayMult2<1) logMsg+=' (Mitigado)';
      for (const k of Object.keys(G.stats)) applyStatDelta(k, -(3 + Math.random() * 4), decayMult2);
    }

    // Log team focus effect
    if (G.team && G.team.focus === 'desarrollo') {
      G._seasonEventLogs.push('📚 Tu equipo priorizó tu desarrollo como piloto. Mayor crecimiento de atributos.');
    } else if (G.team && G.team.focus === 'ganar') {
      G._seasonEventLogs.push('🏆 Tu equipo priorizó los resultados. Menor crecimiento pero mejor rendimiento en pista.');
    }

    G._seasonEventLogs.push(logMsg);

    // In F1, regulation changes happen every 3 to 5 years
    if (CATEGORIES[G.catIndex] === 'F1') {
      if (!G.nextRegChangeYear) {
        G.nextRegChangeYear = G.year + 3 + Math.floor(Math.random() * 3);
      }
      if (G.year >= G.nextRegChangeYear) {
        G._pendingRegChange = true;
        G.lastRegChangeYear = G.year;
        G.nextRegChangeYear = G.year + 3 + Math.floor(Math.random() * 3);

        // ──        // ✨ EXCLUSIVE EVENT: "Una Oferta en las Sombras" ✨
        // Only fires in the season right before a reg change, if the player has
        // 1+ years left on their current contract with a mid-top (3-5 star) team.
        if (G.f1ContractYearsLeft >= 1 && G.team && G.team.stars >= 3 && !G.storyFlags['shadow_offer_seen'] && Math.random() < 0.25) {
          G.storyFlags['shadow_offer_seen'] = true;
          G._seasonSteps.push('shadow_offer');
        }

        G._seasonSteps.push('regulation');
      }
    }

    G._seasonSteps.push('compute');

    const hasEvent = Math.random() < 0.4;
    const hasMini = Math.random() < 0.2;
    const hasInteractiveMini = Math.random() < 0.25; // 1 in 4 seasons gets an interactive minigame
    if (hasEvent) G._seasonSteps.push('event');
    if (hasMini) G._seasonSteps.push('minigame');
    if (hasInteractiveMini) G._seasonSteps.push('interactive_minigame');
    const hasInterview = Math.random() < 0.3;
    if (hasInterview) G._seasonSteps.push('interview');

    // In junior categories, a sponsor selection event fires each season
    // [DESACTIVADO A PEDIDO DEL JUGADOR]
    /*
    if (G.catIndex < 5) {
      if (!G.sponsor || G.sponsor.category !== G.catIndex) {
        G.sponsor = null; // Clear old sponsor
        G._seasonSteps.unshift('sponsor_selection');
      } else {
        // Auto-renew sponsor for the same category
        G.money += G.sponsor.fixedPaid;
        G.totalMoney += G.sponsor.fixedPaid;
        G._seasonEventLogs.push(`💸 ${G.sponsor.brand} renovó automáticamente su patrocinio y depositó ${fmt$(G.sponsor.fixedPaid)}.`);
      }
    }
    */

    processSeasonStep();
  }, 2100);
}

function processSeasonStep() {
  window._activeStepCallback = processSeasonStep;
  if (!G.aiRoster) G.aiRoster = generateInitialRoster();
  if (!G._seasonSteps || G._seasonSteps.length === 0) {
    checkNicknames();
    if (!G.lastResult) {
      goto('screen-preseason');
      return;
    }
    buildSummary();
    goto('screen-summary');
    return;
  }
  
  // Grouping logic for Press Conference (F1 only)
  const isPressStep = (s) => G.catIndex === 5 && (s === 'interview' || (typeof s === 'string' && s.startsWith('event:') && !s.split(':')[1].startsWith('ev_')));
  
  if (isPressStep(G._seasonSteps[0])) {
    const queue = [];
    while (G._seasonSteps.length > 0 && isPressStep(G._seasonSteps[0])) {
      queue.push(G._seasonSteps.shift());
    }
    showPressConference(queue);
    return;
  }

  if (typeof G._seasonSteps[0] === 'string' && G._seasonSteps[0].startsWith('brand_arrival:')) {
    const stepStr = G._seasonSteps.shift();
    const parts = stepStr.split(':');
    const type = parts[1];
    const brand = parts[2];
    const target = parts[3];

    if (type === 'expansion') {
      TEAMS['F1'].push({ name: brand, stars: 2, logo: `assets/images/logos/logo ${brand.toLowerCase()}.png` });
      let maxId = Math.max(...G.aiRoster.map(d => parseInt(d.id.split('_')[1]) || 0)) + 1;
      const getSkill = () => 65 + Math.floor(Math.random() * 10);
      const avatars = typeof EMOJI_AVATARS !== 'undefined' ? EMOJI_AVATARS : ['👨','👦','🧔','👱‍♂️','👨‍🦱'];
      
      const genDriver = (age) => {
        const nat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
        const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const av = avatars[Math.floor(Math.random() * avatars.length)];
        return {
          id: 'ai_' + maxId++, 
          name: `${fName} ${lName}`, 
          team: brand, 
          age: age, 
          flag: nat ? nat.flag : '❓', 
          cat: 'F1', 
          skill: getSkill(), 
          contractYearsLeft: 2, 
          consecutiveLosses: 0, 
          avatar: av
        };
      };
      
      G.aiRoster.push(genDriver(24));
      G.aiRoster.push(genDriver(26));
      showBrandArrivalScreen(brand, 'expansion', null);
    } else {
      const oldTeam = TEAMS['F1'].find(t => t.name === target);
      if (oldTeam) {
        oldTeam.name = brand;
        oldTeam.logo = `assets/images/logos/logo ${brand.toLowerCase()}.png`;
        G.aiRoster.forEach(d => {
          if (d.cat === 'F1' && d.team === target) d.team = brand;
        });
        if (G.team && G.team.name === target) {
          G.team = oldTeam;
        }
        if (G.peer && G.peer.team === target) {
           G.peer.team = brand;
        }
        showBrandArrivalScreen(brand, 'takeover', target);
      } else {
        processSeasonStep();
      }
    }
    return;
  }

  const step = G._seasonSteps.shift();
  if (step === 'sponsor_selection') showSponsorEvent();
  else if (step === 'shadow_offer') showShadowOfferEvent();
  else if (step === 'regulation') showRegulationEvent();
  else if (step === 'event') showRandomEvent();
  else if (step === 'minigame') showMinigame();
  else if (step === 'interactive_minigame') showInteractiveMinigame();
  else if (step === 'interview') showInterview();
  else if (step.startsWith('event:')) showInterview(step.split(':')[1]);
  else if (step.startsWith('nemesis_born:')) showNemesisBornEvent(step.split(':')[1]);
  else if (step === 'nemesis_retired') showNemesisRetiredEvent();
  else if (step === 'nemesis_steal_seat') showNemesisSeatStealEvent();
  else if (step === 'nemesis_h2h_ultimatum_warn') showNemesisUltimatumWarnEvent();
  else if (step === 'nemesis_h2h_ultimatum_win') showNemesisUltimatumResolveEvent(true);
  else if (step === 'nemesis_h2h_ultimatum_lose') showNemesisUltimatumResolveEvent(false);
  else if (step === 'compute') {
    computeSeasonResult();
    processSeasonStep();
  }
}

function calcPlayerRating(cat, effStats) {
  const weightedBase = (
    effStats.speed * 0.35 +
    effStats.quali * 0.25 +
    effStats.tyres * 0.20 +
    effStats.overtake * 0.15 +
    effStats.rain * 0.05
  );

  const wetSeason = Math.random() < 0.30;
  const rainBonus = wetSeason ? (effStats.rain - 50) * 0.15 : 0;
  if (wetSeason) {
    G._seasonEventLogs.push(`🌧️ Temporada lluviosa! (Bonus por Lluvia: ${rainBonus > 0 ? '+' : ''}${Math.round(rainBonus)})`);
  }

  let eff = weightedBase + rainBonus;
  if (cat === 'F1') {
    const effectiveStars = clamp((G.team ? G.team.stars : 3) + (G._tempStarBonus || 0), 1, 5);
    eff = getF1DriverPower(weightedBase, effectiveStars) + rainBonus + 4;
    if (G.regulationBonus) {
      eff += G.regulationBonus;
    }
  }

  if (G._minigamePowerBonus) {
    eff += G._minigamePowerBonus;
  }

  if (cat === 'F3') {
    const playerStars = G.team ? G.team.stars : 3;
    eff += (playerStars * 3);
  } else {
    const focusRatingBonus = (G.team && G.team.focus === 'ganar') ? 10
      : (G.team && G.team.focus === 'desarrollo') ? -2
        : 0;
    eff += focusRatingBonus;
  }

  if (cat !== 'F1') {
    eff += 8;
    if (G.academy) {
      eff += 5;
    }
    
    let repeatedYears = 0;
    if (G.seasons && G.seasons.length > 0) {
      for (let i = G.seasons.length - 1; i >= 0; i--) {
        if (G.seasons[i].cat === cat) {
          repeatedYears++;
        } else {
          break;
        }
      }
    }
    eff += repeatedYears;
  }

  const luck = rand(-10, 10);
  const rating = clamp(eff + luck, 1, 99);
  
  return { rating, wetSeason, playerPower: rating };
}

function calcPlayerSeasonPerformance(cat, champ, effStats, races, teamStars) {
  const overtakeFactor = (effStats.overtake - 1) / 98;
  const consistencyFactor = (effStats.tyres - 1) / 98;
  const qualiFactor = (effStats.quali - 1) / 98;

  let wins = 0;
  let podiums = 0;
  let poles = 0;

  const pickRange = (min, max, factor) => {
    const randomVariance = (Math.random() * 0.5) - 0.25;
    const finalFactor = clamp(factor + randomVariance, 0, 1);
    const base = min + (max - min) * finalFactor;
    return Math.round(base); 
  };

  if (champ === 1) {
    let baseDom = Math.random();
    let domWins = clamp(baseDom + (Math.random() * 0.4 - 0.2), 0, 1);
    let domPods = clamp(baseDom + (Math.random() * 0.4 - 0.2), 0, 1);
    let domPoles = clamp(baseDom + (Math.random() * 0.4 - 0.2), 0, 1);
    
    if (cat === 'F1' && teamStars <= 4) {
      baseDom = Math.random() * 0.15;
      domWins = clamp(baseDom + (Math.random() * 0.1 - 0.05), 0, 1);
      domPods = clamp(baseDom + (Math.random() * 0.1 - 0.05), 0, 1);
      domPoles = clamp(baseDom + (Math.random() * 0.1 - 0.05), 0, 1);
    }

    let minWins = races * 0.15;
    let maxWins = races * (0.40 + 0.45 * domWins);
    let minPods = races * 0.45;
    let maxPods = races * (0.55 + 0.40 * domPods);

    if (cat === 'F1') {
      minWins *= 0.80;
      maxWins *= 0.80;
      minPods = races * 0.55;
      maxPods = races * (0.65 + 0.35 * domPods);
    }

    wins = clamp(pickRange(minWins, maxWins, overtakeFactor), 1, races);
    podiums = clamp(pickRange(minPods, maxPods, consistencyFactor), wins, races);
    poles = clamp(pickRange(races * 0.10, races * (0.35 + 0.45 * domPoles), qualiFactor), 0, races);
  } else if (champ === 2) {
    wins = clamp(pickRange(races * 0.12, races * 0.35, overtakeFactor), 0, races);
    podiums = clamp(pickRange(races * 0.40, races * 0.70, consistencyFactor), wins, races);
    poles = clamp(pickRange(races * 0.12, races * 0.40, qualiFactor), 0, races);
  } else if (champ === 3) {
    wins = clamp(pickRange(races * 0.08, races * 0.20, overtakeFactor), 0, races);
    podiums = clamp(pickRange(races * 0.30, races * 0.55, consistencyFactor), wins, races);
    poles = clamp(pickRange(races * 0.08, races * 0.25, qualiFactor), 0, races);
  } else if (champ <= 5) {
    wins = clamp(pickRange(races * 0.04, races * 0.12, overtakeFactor), 0, races);
    podiums = clamp(pickRange(races * 0.20, races * 0.40, consistencyFactor), wins, races);
    poles = clamp(pickRange(races * 0.04, races * 0.15, qualiFactor), 0, races);
  } else if (champ <= 8) {
    wins = Math.random() < 0.25 * overtakeFactor ? 1 : 0;
    podiums = clamp(pickRange(0, races * 0.15, consistencyFactor), wins, races);
    poles = Math.random() < 0.25 * qualiFactor ? 1 : 0;
  } else if (champ <= 11) {
    wins = 0;
    podiums = Math.random() < 0.4 * consistencyFactor ? 1 : 0;
    poles = 0;
  }

  podiums = Math.max(podiums, wins);
  return { wins, podiums, poles };
}

function applySeasonRewards(cat, champ, wins, podiums, poles, dnfs, wetSeason, rating, races) {
  const salary = [10000, 30000, 50000, 100000, 200000, 2000000][G.catIndex];
  const winBonus = [2000, 5000, 10000, 20000, 40000, 100000][G.catIndex];
  const mediaMult = 1.0 + (G.personality.media / 200);
  let earned = (salary + wins * winBonus) * mediaMult;

  if (champ <= 10 && G.catIndex < 5) {
    const nextCatIdx = G.catIndex + 1;
    const baseCheapestNextSeat = getSeatCost(nextCatIdx, 3, false);
    
    let prizeMoney = 0;
    if (champ === 1) prizeMoney = baseCheapestNextSeat;
    else if (champ === 2) prizeMoney = baseCheapestNextSeat * 0.50;
    else if (champ === 3) prizeMoney = baseCheapestNextSeat * 0.25;
    else if (champ <= 5) prizeMoney = baseCheapestNextSeat * 0.10;
    else if (champ <= 10) prizeMoney = baseCheapestNextSeat * 0.05;
    
    prizeMoney = Math.round(prizeMoney);
    if (prizeMoney > 0) {
      earned += prizeMoney;
      G._seasonEventLogs.push(`🏆 Premio por terminar ${champ}º en el campeonato: ${fmt$(prizeMoney)}.`);
    }
  }
  
  const focusRepMult = (G.team && G.team.focus === 'ganar') ? 1.4
    : (G.team && G.team.focus === 'desarrollo') ? 0.7
      : 1.0;
  let rep = Math.round(((100 - champ) * 2 + wins * 5) * focusRepMult);

  if (G.upgrades.includes('photographer') && podiums > 0) {
    const pBonus = Math.floor(rep * 0.4);
    if (pBonus > 0) {
      rep += pBonus;
      G._seasonEventLogs.push(`📸 Las fotos de tu podio se hicieron virales (+${pBonus} Reputación extra).`);
    }
  }
  
  if (G.upgrades.includes('charity')) {
    rep += 15;
    G._seasonEventLogs.push(`🤝 Tu Fundación Benéfica mejoró tu imagen pública (+15 Reputación).`);
  }
  
  G.reputation += rep;
  G.money += earned;
  G.totalMoney += earned;
  G.wins += wins;
  if (wetSeason && cat === 'F1') G.wetWins += wins;
  G.podiums += podiums;
  G.poles += poles;
  G.dnfs += dnfs;

  const teamName = G.team ? G.team.name : '❓';
  const teamLogo = G.team && G.team.logo ? G.team.logo : null;
  const teamStars = G.team ? G.team.stars : null;
  const result = { cat, year: G.year, champ, wins, podiums, poles, dnfs, earned, rep, rating, teamName, teamLogo, teamStars, age: G.age, races };
  G.seasons.push(result);
  G.lastResult = result;

  return result;
}

function computeSeasonResult() {
  const cat = CATEGORIES[G.catIndex];

  const effStats = { ...G.stats };
  let extraDnf = 0;
  
  if (cat === 'F1' && G.peer) {
    if (G.peer.relationship < -30) {
      effStats.speed = clamp(effStats.speed + 8, 1, 99);
      effStats.tyres = clamp(effStats.tyres - 10, 1, 99);
      extraDnf = 1;
      G._seasonEventLogs.push(`⚡ Tensión en el box con ${G.peer.name}: +Agresividad, -Gestión y +Riesgo.`);
    } else if (G.peer.relationship > 30) {
      effStats.tyres = clamp(effStats.tyres + 6, 1, 99);
      effStats.quali = clamp(effStats.quali + 6, 1, 99);
      extraDnf = -1;
      G._seasonEventLogs.push(`🤝 Sintonía con ${G.peer.name}: +Gestión, +Clasificación y -Riesgo.`);
    }
  }

  const ratingData = calcPlayerRating(cat, effStats);
  const rating = ratingData.rating;
  const wetSeason = ratingData.wetSeason;
  const playerPower = ratingData.playerPower;

  // Races per category
  const races = [12, 14, 14, 16, 14, 24][G.catIndex];

  // 5. Calculate results with specific stat impacts
  let champ = 1;
  if (cat === 'Karting') {
    champ = calcChampPosition(rating);
  } else {
    const catDrivers = G.aiRoster.filter(d => d.cat === cat);
    let rank = 1;
    catDrivers.forEach(ai => {
      let aiPower = ai.skill;
      const tObj = TEAMS[cat].find(t => t.name === ai.team);
      const aiStars = tObj ? tObj.stars : 3;
      
      if (cat === 'F1') {
        aiPower = getF1DriverPower(ai.skill, aiStars);
      } else {
        aiPower = ai.skill + (aiStars * 3);
      }
      
      aiPower += rand(-10, 10);
      ai._power = aiPower; // Store for later rank estimation
      if (aiPower > playerPower) rank++;
    });
    champ = rank;
  }

  const teamStars = G.team ? G.team.stars : 3;
  const performance = calcPlayerSeasonPerformance(cat, champ, effStats, races, teamStars);
  const wins = performance.wins;
  const podiums = performance.podiums;
  const poles = performance.poles;

  // Tyres reduces DNFs
  const dnfBase = rand(0, 3) + extraDnf + (G.personality.aggressiveness > 30 ? 1 : 0);
  if (cat === 'F1') {
    let possibleEvents = [];
    if (!G.storyFlags['interview_ev_jet'] && G.upgrades.includes('jet') && Math.random() < 0.15) possibleEvents.push('ev_jet');
    if (!G.storyFlags['interview_ev_mansion'] && G.upgrades.includes('mansion') && G.age > 33 && Math.random() < 0.25) possibleEvents.push('ev_mansion');
    if (!G.storyFlags['interview_ev_yacht'] && G.upgrades.includes('yacht') && podiums > 0 && Math.random() < 0.2) possibleEvents.push('ev_yacht');
    if (!G.storyFlags['interview_ev_cryo'] && G.upgrades.includes('cryo') && Math.random() < 0.1) possibleEvents.push('ev_cryo');
    if (!G.storyFlags['interview_ev_psych'] && G.upgrades.includes('psychologist') && Math.random() < 0.1) possibleEvents.push('ev_psych');
    if (!G.storyFlags['interview_ev_mentor'] && G.upgrades.includes('mentor') && champ <= 3 && Math.random() < 0.2) possibleEvents.push('ev_mentor');
    if (!G.storyFlags['interview_ev_kart'] && G.upgrades.includes('kart_team') && Math.random() < 0.15) possibleEvents.push('ev_kart');
    if (!G.storyFlags['interview_ev_classics'] && G.upgrades.includes('classics') && Math.random() < 0.15) possibleEvents.push('ev_classics');
    
    if (possibleEvents.length > 0) {
        G._seasonSteps.push('event:' + possibleEvents[Math.floor(Math.random() * possibleEvents.length)]);
    }
  }
  const tyreFactor = (effStats.tyres - 50) / 100;
  const dnfs = Math.max(0, Math.round(dnfBase - tyreFactor * 2));

  const result = applySeasonRewards(cat, champ, wins, podiums, poles, dnfs, wetSeason, rating, races);

  updateRivalries(cat, champ);
    
    // Brand Arrivals (Expansion & Takeover)
    if (G.catIndex === 5 && G.seasons.filter(s => s.cat === 'F1').length >= 1) {
      if (!G.pendingBrands) G.pendingBrands = ['BYD', 'Porsche', 'Toyota', 'Andretti', 'Hyundai'];
      if (G.brandEventsCount === undefined) G.brandEventsCount = 0;
      if (G.hasExpanded === undefined) G.hasExpanded = false;

      if (G.brandEventsCount < 2 && G.pendingBrands.length > 0 && Math.random() < 0.05) {
        let type = (G.hasExpanded) ? 'takeover' : (Math.random() < 0.5 ? 'expansion' : 'takeover');
        
        let brandName = G.pendingBrands.splice(Math.floor(Math.random() * G.pendingBrands.length), 1)[0];
        
        if (type === 'takeover') {
          const possibleTargets = ['Alpine', 'Haas', 'Racing Bulls', 'Williams'];
          const availableTargets = TEAMS['F1'].filter(t => possibleTargets.includes(t.name));
          if (availableTargets.length > 0) {
            const target = availableTargets[Math.floor(Math.random() * availableTargets.length)].name;
            G._seasonSteps.push(`brand_arrival:takeover:${brandName}:${target}`);
            G._seasonSteps.push('event:f1_new_brand_takeover');
          } else {
            G._seasonSteps.push(`brand_arrival:expansion:${brandName}`);
            G._seasonSteps.push('event:f1_new_brand_expansion');
            G.hasExpanded = true;
          }
        } else {
          G._seasonSteps.push(`brand_arrival:expansion:${brandName}`);
          G._seasonSteps.push('event:f1_new_brand_expansion');
          G.hasExpanded = true;
        }
        G.brandEventsCount++;
      }
    }


  // Sponsor evaluation (junior categories only)
  // [DESACTIVADO A PEDIDO DEL JUGADOR]
  /*
  if (G.sponsor && G.catIndex < 5) {
    const sp = G.sponsor;
    let bonusEarned = false;
    if (sp.objective === 'none') {
      bonusEarned = false; // No bonus, fixed was already paid
    } else if (sp.objective === 'top5' && champ <= 5) {
      bonusEarned = true;
    } else if (sp.objective === 'champion' && champ === 1) {
      bonusEarned = true;
    }
    if (bonusEarned) {
      G.money += sp.bonusAmount;
      G.totalMoney += sp.bonusAmount;
      G._seasonEventLogs.push(`💸 ¡Objetivo del patrocinador cumplido! ${sp.brand} te deposita el bono de ${fmt$(sp.bonusAmount)}.`);
    } else if (sp.objective !== 'none') {
      G._seasonEventLogs.push(`❌ No cumpliste el objetivo de ${sp.brand}. Sin bono de rendimiento.`);
    }
    // El patrocinador no se resetea aquí, dura toda la categoría
  }
  */

  // Loan repayment
  // [DESACTIVADO A PEDIDO DEL JUGADOR]
  /*
  if (G.loanDebt > 0) {
    G.money -= G.loanDebt;
    G._seasonEventLogs.push(`💸 Se descontaron ${fmt$(G.loanDebt)} del préstamo de emergencia.`);
    G.loanDebt = 0;
  }
  */

  if (result.champ === 1 && result.cat === 'F1') {
    G.f1Titles++;
    G.f1ConsecutiveTitles++;
    G.achievementsProgress = G.achievementsProgress || {};
    G.achievementsProgress['reg_changes_won'] = G.achievementsProgress['reg_changes_won'] || [];
    if (!G.achievementsProgress['reg_changes_won'].includes(G.lastRegChangeYear)) {
      G.achievementsProgress['reg_changes_won'].push(G.lastRegChangeYear);
    }
    if (G.team.stars <= 4) G.epicTitles++;
  } else if (result.cat === 'F1') {
    G.f1ConsecutiveTitles = 0;
  }
  if (!G.careerBest || wins > G.careerBest.wins) G.careerBest = result;

  if (cat === 'F1') {
    // 1. Calculate Standings
    const standingsRows = generateStandingsTable(result);
    // Track AI champion titles in the living historical table
    if (result.champ !== 1) {
      const winner = standingsRows.find(r => r.rank === 1 && !r.isPlayer);
      if (winner) {
        const winnerName = winner.name.match(/[a-zA-ZÁÉÍÓÚáéíóúÀ-ÿ].*/)[0].trim(); // strip flags and emojis
        if (!G.aiChampions) G.aiChampions = {};
        G.aiChampions[winnerName] = (G.aiChampions[winnerName] || 0) + 1;
      }
    }
    const teamMap = {};
    standingsRows.forEach(row => {
      if (!teamMap[row.team]) teamMap[row.team] = { team: row.team, logo: row.logo, points: 0, hasPlayer: false };
      teamMap[row.team].points += row.points;
      if (row.isPlayer) teamMap[row.team].hasPlayer = true;
    });
    const constructorRows = Object.values(teamMap).sort((a, b) => b.points - a.points).map((t, i) => ({ ...t, rank: i + 1 }));
    _lastStandings = { rows: standingsRows, constructors: constructorRows, cat: result.cat, year: result.year, view: 'drivers' };

    const _myTeamRow = constructorRows.find(c => c.team === result.teamName);
    result.constructorRank = _myTeamRow ? _myTeamRow.rank : null;
    const _peerRow = standingsRows.find(s => s.isPeer);
    result.peerRank = _peerRow ? _peerRow.rank : null;

    // 2. Peer Logic and H2H
    if (G.peer) {
      if (G.team.name === G.peer.team) {
        G.peer.yearsAsTeammate = (G.peer.yearsAsTeammate || 0) + 1;
      } else {
        G.peer.yearsAsTeammate = 0;
      }
      const myStRow = standingsRows.find(s => s.isPlayer);
      const peerStRow = standingsRows.find(s => s.isPeer);
      if (myStRow && peerStRow) {
        if (myStRow.rank < peerStRow.rank) {
          G.peer.h2hLosses = (G.peer.h2hLosses || 0) + 1;
          G.f1ContractH2HWins = (G.f1ContractH2HWins || 0) + 1;
        } else if (peerStRow.rank < myStRow.rank) {
          G.peer.h2hWins = (G.peer.h2hWins || 0) + 1;
          G.f1ContractH2HLosses = (G.f1ContractH2HLosses || 0) + 1;
          G.careerH2HLosses = (G.careerH2HLosses || 0) + 1;
        }
      }
    }
    
    // 3. Standings-dependent interviews
    const champ = result.champ;
    const myStRow = standingsRows.find(s => s.isPlayer);
    const tmRow = standingsRows.find(s => s.isPeer);
    const myTeamRow = constructorRows.find(c => c.team === result.teamName);
    const peerPos = tmRow ? tmRow.rank : 99;
    if (champ <= 10 && myStRow && tmRow && tmRow.rank >= myStRow.rank + 4 && !G.storyFlags['interview_f1_teammate_destroyed']) {
      G._seasonSteps.push('event:f1_teammate_destroyed');
    }
    if (myStRow && tmRow && myStRow.rank >= tmRow.rank + 4 && !G.storyFlags['interview_f1_underperform']) {
      G._seasonSteps.push('event:f1_underperform');
    }
    if (G.peer && (G.peer.h2hLosses || 0) >= 3 && (G.peer.h2hWins || 0) === 0 && !G.storyFlags['interview_f1_h2h_domination']) {
      G._seasonSteps.push('event:f1_h2h_domination');
    }
    if (G.peer && (G.peer.h2hWins || 0) >= 3 && (G.peer.h2hLosses || 0) === 0 && !G.storyFlags['interview_f1_h2h_getting_destroyed']) {
      G._seasonSteps.push('event:f1_h2h_getting_destroyed');
    }
    if (myTeamRow && myTeamRow.rank === 1 && !G.storyFlags['interview_f1_constructors_champ']) {
      G._seasonSteps.push('event:f1_constructors_champ');
    }
    if (tmRow && tmRow.rank === 1 && !G.storyFlags['interview_f1_teammate_champ']) {
      G._seasonSteps.push('event:f1_teammate_champ');
    }


    if (G.f1Titles > 7 && !G.storyFlags['interview_f1_title_record_broken']) {
      G._seasonSteps.push('event:f1_title_record_broken');
    }
    else if (champ === 1 && G.f1Titles >= 2 && G.lastRegChangeYear && G.year >= G.lastRegChangeYear + 1 && !G.storyFlags['interview_f1_regulations_criticism'] && G.seasons.find(s => s.year === G.year - 1 && s.cat === 'F1' && s.champ === 1 && s.year >= G.lastRegChangeYear)) {
      G._seasonSteps.push('event:f1_regulations_criticism');
    }
    else if (champ === 1 && G.f1Titles === 1 && !G.storyFlags['interview_f1_first_title']) {
      G._seasonSteps.push('event:f1_first_title');
    }
    else if (champ === 1 && G.team.stars <= 4 && !G.storyFlags['interview_f1_epic_champion']) {
      G._seasonSteps.push('event:f1_epic_champion');
    }
    else if (champ === 2 && wins >= 4 && !G.storyFlags['interview_f1_title_lost']) {
      G._seasonSteps.push('event:f1_title_lost');
    }
    else if ((champ === 2 || champ === 3) && wins < 4 && !G.storyFlags['interview_f1_championship_contender']) {
      G._seasonSteps.push('event:f1_championship_contender');
    }
    
    const totalF1Wins = G.seasons.filter(s => s.cat === 'F1').reduce((a, b) => a + (b.wins || 0), 0);
    if (wins > 0 && totalF1Wins === wins && !G.storyFlags['interview_first_win']) {
      G._seasonSteps.push('event:first_win');
    }
    if (G.wins >= 105 && !G.storyFlags['interview_f1_win_record']) {
      G._seasonSteps.push('event:f1_win_record');
    }
    
    if (G.age >= 35 && !G.storyFlags['interview_f1_retirement_talk']) {
      G._seasonSteps.push('event:f1_retirement_talk');
    }
    if (champ > 10 && G.money > 20000000 && !G.storyFlags['interview_f1_overpaid']) {
      G._seasonSteps.push('event:f1_overpaid');
    }
    const prevSeason_fc = G.seasons.find(s => s.year === G.year - 1 && s.cat === 'F1');
    if (prevSeason_fc && prevSeason_fc.champ === 1 && champ > 5 && !G.storyFlags['interview_f1_fallen_champion']) {
      G._seasonSteps.push('event:f1_fallen_champion');
    }
    if (champ === 1 && G.team.stars === 5 && peerPos <= 3 && !G.storyFlags['interview_f1_carried_by_car']) {
      G._seasonSteps.push('event:f1_carried_by_car');
    }
    if (G.age >= 34 && peerPos < champ && !G.storyFlags['interview_f1_beaten_by_young_peer']) {
      G._seasonSteps.push('event:f1_beaten_by_young_peer');
    }
    if (G.lastRegChangeYear === (G.year - 1) && G._shadowOldTeam && G.f1ContractYearsLeft >= 0) {
      if (G.team.stars >= 4 && !G.storyFlags['interview_f1_shadow_contract_good']) G._seasonSteps.push('event:f1_shadow_contract_good');
      else if (G.team.stars < 4 && !G.storyFlags['interview_f1_shadow_contract_bad']) G._seasonSteps.push('event:f1_shadow_contract_bad');
    }


    if (G._evaluatingRegChange) {
      G._evaluatingRegChange = false;
      if (G.team.name === G._regChangeTeam) {
        if (G.team.stars > G._regChangeOldStars) G._seasonSteps.push('event:f1_reg_change_better');
        else if (G.team.stars < G._regChangeOldStars) G._seasonSteps.push('event:f1_reg_change_worse');
      }
    }
    
    // Cola de entrevista pendiente por traspasos de academia
    if (G.pendingAcademyInterview) {
      G._seasonSteps.push('event:' + G.pendingAcademyInterview);
      G.pendingAcademyInterview = null;
    }
    // NOTE: standings-dependent interviews (teammate_destroyed, underperform, constructors_champ,
    // teammate_champ) are pushed in buildSummary() where _lastStandings is available.
  }

  // Regulation change in F1: triggered from G._pendingRegChange (set before season)
  if (cat === 'F1' && G._pendingRegChange) {
    G._pendingRegChange = false;
    const f1Teams = TEAMS['F1'];
    // Fixed target distribution: always exactly 2×5⭐, 2×4⭐, 3×3⭐, 3×2⭐, 1×1⭐
    const targetStars = [5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1];

    // Sort teams by current stars (ascending), keeping index so we can assign back
    const indexed = f1Teams.map((t, i) => ({ i, stars: t.stars }));
    indexed.sort((a, b) => a.stars - b.stars);

    // Sort targets ascending
    const sortedTargets = [...targetStars].sort((a, b) => a - b);

    // Build the assignment: lowest current stars → lowest target, etc.
    // For teams tied at the same star level, shuffle their target slots for variety
    const assignment = new Array(f1Teams.length);
    let pos = 0;
    while (pos < indexed.length) {
      // Find range of teams with same current stars
      let end = pos;
      while (end < indexed.length && indexed[end].stars === indexed[pos].stars) end++;
      // Find range of matching targets (same tier)
      const tierTargets = sortedTargets.slice(pos, end);
      const shuffledTier = shuffle(tierTargets);
      for (let k = 0; k < shuffledTier.length; k++) {
        assignment[indexed[pos + k].i] = shuffledTier[k];
      }
      pos = end;
    }

    
      const oldStars = G.team.stars;
      f1Teams.forEach((t, i) => { t.stars = assignment[i]; });
      
      // Apply next-season bonus to player's current team if they focused on it
    if (G.nextSeasonRegBonus !== 0) {
      G.team.stars = Math.max(1, Math.min(5, G.team.stars + G.nextSeasonRegBonus));
      G.nextSeasonRegBonus = 0;
    }
      
    // Remember star count NOW (before next season) to compare later
    G._evaluatingRegChange = true;
    G._regChangeTeam = G.team.name;
    G._regChangeOldStars = G.team.stars;

    G._seasonEventLogs.push(`📝 ¡El nuevo reglamento entró en vigor! El mapa de poder en F1 ha cambiado.`);
  }

  // When the player is NOT in F1, simulate the F1 season so the
  // champions table and G.lastF1Champion stay current every year.
  if (cat !== 'F1') simulateShadowF1Season();
}

// PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
//  SHADOW F1 SIMULATION
//  Runs every non-F1 player season to keep the world alive.
//  G.lastF1Champion is available for future news / narrative mechanics.
// PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
function simulateShadowF1Season() {
  if (!G.aiRoster) return;
  const f1Drivers = G.aiRoster.filter(d => d.cat === 'F1');
  if (f1Drivers.length === 0) return;

  // Score: team stars * 12 + individual skill + RNG (up to 20)
  const scored = f1Drivers.map(d => {
    const team = (TEAMS['F1'] || []).find(t => t.name === d.team);
    const stars = team ? team.stars : 3;
    const power = getF1DriverPower(d.skill, stars) + rand(-10, 10);
    return { name: d.name, team: d.team, power };
  });
  scored.sort((a, b) => b.power - a.power);

  const champion = scored[0];
  if (!champion) return;

  if (!G.aiChampions) G.aiChampions = {};
  G.aiChampions[champion.name] = (G.aiChampions[champion.name] || 0) + 1;
  G.lastF1Champion = { name: champion.name, team: champion.team, year: G.year };
}

function calcChampPosition(rating) {
  // F1-calibrated: now only truly perfect ratings can assure 1st place
  if (rating > 95) return 1;
  if (rating > 90) return rand(1, 3) | 0;   // 1st or 2nd
  if (rating > 85) return rand(1, 5) | 0;   // 1st to 4th
  if (rating > 75) return rand(3, 8) | 0;   // 3rd to 7th
  if (rating > 60) return rand(5, 12) | 0;
  if (rating > 45) return rand(8, 16) | 0;
  return rand(12, 22) | 0;
}

// ═══════════════════════════════════════════════════════════
//  REGULATION CHANGE EVENT
// ═══════════════════════════════════════════════════════════
function resetEventChrome() {
  const label = document.querySelector('#screen-event .label');
  const card = document.querySelector('#screen-event .card');
  const ch = document.getElementById('ev-choices');

  if (label) label.textContent = 'Evento especial';
  
  if (card) { 
    card.style.borderColor = ''; 
    card.style.boxShadow = ''; 
    card.style.animation = 'none';
    card.classList.remove('anim-card-enter', 'anim-card-exit');
    void card.offsetWidth;
    card.style.animation = '';
  }
  
  if (ch) {
    ch.style.animation = 'none';
    ch.classList.remove('anim-card-enter', 'anim-card-exit');
    void ch.offsetWidth;
    ch.style.animation = '';
  }

  const titleEl = document.getElementById('ev-title');
  if (titleEl) titleEl.style.color = '';
  const radio = document.getElementById('ev-radio-block');
  if (radio) radio.remove();
}

// ═══════════════════════════════════════════════════════════
//  SHADOW OFFER — "Una Oferta en las Sombras"
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
//  SPONSOR EVENT
// ═══════════════════════════════════════════════════════════
function showSponsorEvent() {
  const cat = CATEGORIES[G.catIndex];
  const BASE = SEAT_COSTS[G.catIndex] ? SEAT_COSTS[G.catIndex][0] : 1200000;

  // Pool of sponsor options per type
  const SPONSORS = {
    A: [
      { brand: 'Santander', logo: 'assets/images/marcas/marca santander.png', emoji: '🤝', mult: 1.00 },
      { brand: 'Telmex',    logo: 'assets/images/marcas/marca telmex.png',    emoji: '📞', mult: 1.00 },
      { brand: 'Rolex',     logo: 'assets/images/marcas/marca rolex.png',     emoji: '⌚', mult: 1.00 },
      { brand: 'Emirates',  logo: 'assets/images/marcas/marca emirates.png',  emoji: '✈️', mult: 1.00 },
    ],
    B: [
      { brand: 'Castrol', logo: 'assets/images/marcas/marca castrol.png', emoji: '🛢️', multFixed: 0.40, multBonus: 0.90 },
      { brand: 'Puma',    logo: 'assets/images/marcas/marca puma.png',    emoji: '🐆', multFixed: 0.40, multBonus: 0.90 },
      { brand: 'Brembo',  logo: 'assets/images/marcas/marca brembo.png',  emoji: '🛑', multFixed: 0.40, multBonus: 0.90 },
      { brand: 'Pirelli', logo: 'assets/images/marcas/marca pirelli.png', emoji: '🛞', multFixed: 0.40, multBonus: 0.90 },
    ],
    C: [
      { brand: 'Monster Energy', logo: 'assets/images/marcas/marca monster.png',  emoji: '⚡', multFixed: 0.25, multBonus: 1.35 },
      { brand: 'Red Bull',       logo: 'assets/images/marcas/marca redbull.png',  emoji: '🐂', multFixed: 0.25, multBonus: 1.35 },
      { brand: 'Crypto.com',     logo: 'assets/images/marcas/marca crypto.png',   emoji: '🪙', multFixed: 0.25, multBonus: 1.35 },
      { brand: 'Aramco',         logo: 'assets/images/marcas/marca aramco.png',   emoji: '🛢️', multFixed: 0.25, multBonus: 1.35 },
    ],
  };

  const pickA = SPONSORS.A[Math.floor(Math.random() * SPONSORS.A.length)];
  const pickB = SPONSORS.B[Math.floor(Math.random() * SPONSORS.B.length)];
  const pickC = SPONSORS.C[Math.floor(Math.random() * SPONSORS.C.length)];

  // No rounding to 10k so Type A pays exactly the base seat
  const fixedA  = Math.round(BASE * pickA.mult);
  const fixedB  = Math.round(BASE * pickB.multFixed);
  const bonusB  = Math.round(BASE * pickB.multBonus);
  const fixedC  = Math.round(BASE * pickC.multFixed);
  const bonusC  = Math.round(BASE * pickC.multBonus);

  const options = [
    { brand: pickA.brand, logo: pickA.logo, emoji: pickA.emoji, type: 'A', objective: 'none',     fixedPaid: fixedA, bonusAmount: 0,      label: 'Sin objetivo', detail: `Cobras ${fmt$(fixedA)} al inicio. Sin bono de rendimiento.`, badge: '✅ Seguro' },
    { brand: pickB.brand, logo: pickB.logo, emoji: pickB.emoji, type: 'B', objective: 'top5',     fixedPaid: fixedB, bonusAmount: bonusB, label: 'Top 5', detail: `${fmt$(fixedB)} ahora + ${fmt$(bonusB)} si terminás en el Top 5 del campeonato.`, badge: '📈 Moderado' },
    { brand: pickC.brand, logo: pickC.logo, emoji: pickC.emoji, type: 'C', objective: 'champion', fixedPaid: fixedC, bonusAmount: bonusC, label: 'Campeón', detail: `${fmt$(fixedC)} ahora + ${fmt$(bonusC)} si salís CAMPEÓN.`, badge: '🔥 Todo o Nada' },
  ];

  showEventScene({
    icon: '💸',
    title: 'Elegí tu patrocinador para la categoría',
    subtitle: 'Patrocinadores',
    desc: `Antes de arrancar la temporada de ${cat}, tres marcas te hacen una oferta. Solo podés elegir una.`,
    borderColor: UI_COLORS.success,
    choices: options.map(opt => ({
      text: `<img src="${opt.logo}" alt="${opt.brand}" style="height:28px;max-width:80px;object-fit:contain;vertical-align:middle;margin-right:8px" onerror="this.style.display='none'"><span>${opt.brand}</span>`,
      subtitle: `${opt.detail} <span style="font-size:11px;opacity:0.7;display:block;margin-top:2px;">${opt.badge}</span>`,
      onClick: () => {
        G.sponsor = {
          brand: opt.brand,
          logo: opt.logo,
          type: opt.type,
          fixedPaid: opt.fixedPaid,
          bonusAmount: opt.bonusAmount,
          objective: opt.objective,
          category: G.catIndex,
        };
        G.money += opt.fixedPaid;
        G.totalMoney += opt.fixedPaid;
        showEventScene({
          icon: '✅',
          title: `¡Contrato firmado con ${opt.brand}!`,
          desc: `${fmt$(opt.fixedPaid)} depositados en tu cuenta.${opt.objective !== 'none' ? ` Objetivo: <strong>${opt.label}</strong> para cobrar el bono de ${fmt$(opt.bonusAmount)}.` : ' Sin objetivo de rendimiento.'}`,
          borderColor: UI_COLORS.success,
          choices: [{ text: 'Continuar' }]
        });
      }
    }))
  });
}

// ═══════════════════════════════════════════════════════════
//  EMERGENCY LOAN SCREEN
// ═══════════════════════════════════════════════════════════
function showEmergencyLoanScreen(catIdx, r, cheapestSeat) {
  const LOAN = 500000;
  
  showEventScene({
    icon: '💸',
    title: 'Sin fondos',
    subtitle: 'Emergencia Financiera',
    desc: `No tenés dinero suficiente para comprar un asiento en ${CATEGORIES[catIdx]}.<br><br>Tu familia y managers pueden conseguirte un <strong>préstamo de emergencia de ${fmt$(LOAN)}</strong>, pero tendrás que devolverlo al final de la próxima temporada.<br><br><em>Solo podés usarlo una vez en toda tu carrera.</em>`,
    borderColor: UI_COLORS.danger,
    choices: [
      {
        text: '💸 Aceptar el préstamo',
        subtitle: `Recibís ${fmt$(LOAN)} ahora. Al final de la temporada, se descuentan automáticamente de tus ganancias.`,
        onClick: () => {
          G.loanUsed = true;
          G.loanDebt = LOAN;
          G.money += LOAN;
          G.totalMoney += LOAN;
          // Resume normal flow
          goToContracts(catIdx);
        }
      },
      {
        text: '🏁 Retirarse',
        subtitle: 'Tu carrera como piloto termina aquí. Sin dinero, sin asiento.',
        style: { borderColor: UI_COLORS.danger, color: UI_COLORS.danger },
        onClick: () => showRetirement('💸 Sin fondos para continuar tu carrera, te retiraste.')
      }
    ]
  });
}

function showNemesisBornEvent(driverId) {
  const driver = G.aiRoster && G.aiRoster.find(d => d.id === driverId);
  const rawName = G.nemesis ? G.nemesis.name : (driver ? driver.name : 'Tu Rival');
  const name = `<span style="color:${UI_COLORS.danger};font-weight:bold">${rawName}</span>`;
  const msgFn = NEMESIS_ORIGIN_MESSAGES[Math.floor(Math.random() * NEMESIS_ORIGIN_MESSAGES.length)];
  
  showEventScene({
    icon: '🔥',
    title: 'Nace una Rivalidad',
    desc: msgFn(name),
    borderColor: UI_COLORS.danger,
    choices: [{
      text: '"Nos vemos en la pista"',
      subtitle: 'Se ha generado un Némesis, nace una rivalidad.',
      onClick: () => processSeasonStep()
    }]
  });
}

function showNemesisRetiredEvent() {
  const rawName = G.nemesis ? G.nemesis.name : 'Tu Némesis';
  const name = `<span style="color:${UI_COLORS.danger};font-weight:bold">${rawName}</span>`;
  
  showEventScene({
    icon: '👋',
    title: `${name} se Retira`,
    desc: `${name} anunció su retiro del automovilismo. Su carrera termina acá. La guerra entre ustedes quedará en los libros de historia.`,
    borderColor: UI_COLORS.danger,
    choices: [{
      text: 'Fin de una era',
      subtitle: `Balance final: ${G.nemesis.h2hWins || 0} temporadas por delante, ${G.nemesis.h2hLosses || 0} temporadas por detrás. Aunque ya no compita, puede que sus comentarios en los medios no terminen acá.`,
      onClick: () => processSeasonStep()
    }]
  });
}

function showNemesisSeatStealEvent() {
  if (!G.nemesis || !G.aiRoster) { processSeasonStep(); return; }
  const nemDriver = G.aiRoster.find(d => d.id === G.nemesis.id);
  if (!nemDriver) { processSeasonStep(); return; }

  const rawName = G.nemesis.name;
  const name = `<span style="color:${UI_COLORS.danger};font-weight:bold">${rawName}</span>`;
  const nemTeam = TEAMS['F1'] && TEAMS['F1'].find(t => t.name === nemDriver.team);

  G.storyFlags['nemesis_seat_steal_offered'] = true;

  showEventScene({
    icon: '📞',
    title: `La Butaca de ${rawName}`,
    desc: `Tu mánager te llama con una novedad enorme: en <strong style="color:var(--accent)">${nemDriver.team}</strong> están evaluando opciones para la próxima temporada. ${name} terminó por detrás tuyo pese a tener mejor auto, y desde adentro del equipo preguntaron si estarías dispuesto a tomar su butaca. Es una estructura de ${'⭐'.repeat(nemTeam ? nemTeam.stars : 3)} que terminó muy decepcionada con los resultados de tu rival.`,
    borderColor: UI_COLORS.accent,
    choices: [
      {
        text: '📱 "Sí, que me llamen"',
        subtitle: `Dejás que el equipo de ${rawName} te contacte. Aparecerá como opción en el mercado de contratos.`,
        onClick: () => {
          G._nemesisSeatTarget = nemDriver.team;
          G._seasonEventLogs = G._seasonEventLogs || [];
          G._seasonEventLogs.push(`📱 Te ofreciste para el asiento de ${rawName} en ${nemDriver.team}.`);
          showEventScene({
            icon: '✅',
            title: 'Mensaje enviado',
            desc: `Tu mánager habló con el director del equipo. El asiento de ${rawName} aparecerá disponible en el mercado de contratos.`,
            borderColor: UI_COLORS.success,
            choices: [{ text: 'Continuar' }]
          });
        }
      },
      {
        text: '🙅 "No me interesa"',
        subtitle: 'Preferís buscar otro equipo. No se sabe nada, el mercado sigue igual.',
        onClick: () => processSeasonStep()
      }
    ]
  });
}

function showNemesisUltimatumWarnEvent() {
  if (!G.nemesis) { processSeasonStep(); return; }
  const rawName = G.nemesis.name;
  const teamName = G.team ? G.team.name : 'tu equipo';

  G.storyFlags['nemesis_ultimatum_used'] = true;

  showEventScene({
    icon: '⚡',
    title: 'Clima Insostenible',
    desc: `El director de ${teamName} los llama a los dos juntos al motorhome. "Llevan demasiado tiempo dentro del mismo equipo sin que ninguno tome ventaja decisiva. Esto no puede seguir así." Mirándolos a ambos, fue claro: <strong>"El que quede por debajo el año que viene tendrá que marcharse. Solo hay lugar para uno."</strong>`,
    borderColor: UI_COLORS.danger,
    choices: [{
      text: '⚡ "Entendido"',
      subtitle: 'El año que viene uno de los dos se va. El reloj ya arrancó.',
      style: { borderColor: UI_COLORS.danger, color: UI_COLORS.danger },
      onClick: () => processSeasonStep()
    }]
  });
}

function showNemesisUltimatumResolveEvent(playerWon) {
  if (!G.nemesis) { processSeasonStep(); return; }
  const rawName = G.nemesis.name;
  const name = `<span style="color:${UI_COLORS.danger};font-weight:bold">${rawName}</span>`;
  const teamName = G.team ? G.team.name : 'el equipo';

  if (playerWon) {
    const nemDriver = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
    if (nemDriver && G.team) {
      const worseTeams = TEAMS['F1'].filter(t => t.stars < G.team.stars);
      let targetTeamName = 'Sin equipo';
      if (worseTeams.length > 0) {
        targetTeamName = worseTeams[Math.floor(Math.random() * worseTeams.length)].name;
      }
      
      nemDriver.team = targetTeamName;
      
      // To avoid teams having 1 or 3 drivers, we swap the Nemesis with an AI driver from the target team.
      if (targetTeamName !== 'Sin equipo') {
        const driversInTarget = G.aiRoster.filter(d => d.cat === 'F1' && d.team === targetTeamName && d.id !== nemDriver.id);
        if (driversInTarget.length > 0) {
          // Sort to take the best driver from the target team to the player's team (since it's a promotion for them)
          driversInTarget.sort((a, b) => b.skill - a.skill);
          const promotedDriver = driversInTarget[0];
          promotedDriver.team = G.team.name;
        }
      } else {
        // If Nemesis goes to 'Sin equipo', we just create a rookie to fill the player's empty seat
        G.aiRoster.push({
          id: 'ai_' + Math.floor(Math.random() * 1000000),
          name: 'Joven Promesa',
          team: G.team.name,
          age: 21,
          flag: '🏳️',
          cat: 'F1',
          skill: 75,
          contractYearsLeft: 1,
          consecutiveLosses: 0,
          avatar: '👨🏻'
        });
      }
    }
    // Detach nemesis as peer so the team doesn't show 3 drivers
    if (G.peer && G.peer.id === G.nemesis.id) {
      G.peer = null;
    }
    G.reputation += 30;
    G._seasonEventLogs = G._seasonEventLogs || [];
    G._seasonEventLogs.push(`🏆 Forzaste la salida de ${rawName} del equipo. +30 Reputación.`);
    // Schedule a new teammate to be assigned in preseason
    G._pendingRefreshTeammate = true;
    
    showEventScene({
      icon: '🏆',
      title: `${rawName} Echado del Equipo`,
      desc: `Lo que el equipo prometió, el equipo cumplió. ${name} fue convocado a la oficina del director y salió de ahí con el contrato terminado. La prensa tardó minutos en saberlo: <em>"${rawName} fuera de ${teamName} por bajo rendimiento."</em> Vos seguís. Él busca asiento.`,
      borderColor: UI_COLORS.success,
      choices: [{
        text: '✌️ "El mejor ganó"',
        subtitle: `Terminaste por delante en el campeonato y demostraste quien es el mejor para comandar el proyecto.`,
        style: { borderColor: UI_COLORS.success, color: UI_COLORS.success },
        onClick: () => processSeasonStep()
      }]
    });
  } else {
    G.f1ContractYearsLeft = 0;
    G.reputation = Math.max(0, G.reputation - 20);
    G._seasonEventLogs = G._seasonEventLogs || [];
    G._seasonEventLogs.push(`❌ ${rawName} ganó el pulso. Fuiste echado de ${teamName}. -20 Reputación.`);
    
    showEventScene({
      icon: '❌',
      title: 'El Equipo Tomó su Decisión',
      desc: `Fue rápido y sin anestesia. El director te llamó, cerró la puerta y fue directo: "Este año ${name} estuvo por encima. Tenemos que ir en una dirección y no podés ser vos." Tu contrato en ${teamName} terminó ahí. Ahora el mercado está abierto.`,
      borderColor: UI_COLORS.danger,
      choices: [{
        text: '🔥 "Esto no terminó"',
        subtitle: `Balance H2H: ${G.nemesis.h2hWins || 0} a ${G.nemesis.h2hLosses || 0}. La deuda queda pendiente.`,
        style: { borderColor: UI_COLORS.danger, color: UI_COLORS.danger },
        onClick: () => processSeasonStep()
      }]
    });
  }
}


function showShadowOfferEvent() {
  const rivalTeams = TEAMS['F1'].filter(t => t.name !== G.team.name);
  const offerTeam = randFrom(rivalTeams.length ? rivalTeams : TEAMS['F1']);

  showEventScene({
    icon: '🕵️',
    title: 'Una Oferta en las Sombras',
    subtitle: 'Oferta Secreta',
    desc: `El director de <strong>${offerTeam.name}</strong> te aborda en secreto en el paddock:<br><br><span style="font-style:italic">"El año que viene cambia el reglamento. Tenemos el diseño muy avanzado y te aseguro que nuestro auto volará. Firmá ahora este pre-contrato. Si tu equipo actual se entera, te van a echar, pero es tu chance de dominar la nueva era."</span>`,
    borderColor: UI_COLORS.accent,
    bgGradient: 'rgba(235, 180, 50, 0.15)',
    choices: [
      {
        text: '🛡️ Rechazar y ser leal',
        subtitle: `Te quedás en ${G.team.name} y confiás en su desarrollo legal. (+40 Equipo)`,
        onClick: () => {
          G.personality.team = clamp(G.personality.team + 40, -100, 100);
          const logText = `🛡️ Rechazaste la oferta secreta de ${offerTeam.name} y le fuiste leal a ${G.team.name}.`;
          G._seasonEventLogs.push(logText);
          showEventScene({
            icon: '🛡️',
            title: 'Lealtad ante todo',
            desc: logText,
            borderColor: UI_COLORS.blue,
            choices: [{ text: 'Continuar' }]
          });
        }
      },
      {
        text: '🕵️ Firmar el pre-contrato (Traición)',
        subtitle: `Firmás en secreto con ${offerTeam.name}. No hay vuelta atrás. (+20 Agresividad)`,
        style: { borderColor: UI_COLORS.accent, color: UI_COLORS.accent, boxShadow: '0 0 16px rgba(232,200,74,.25)' },
        onClick: () => {
          G.personality.aggressiveness = clamp(G.personality.aggressiveness + 20, -100, 100);
          G._shadowBetrayalActive = true;
          G._shadowSecretTeam = offerTeam.name;
          G._shadowOldTeam = G.team.name;
          if (!G.blacklistedTeams) G.blacklistedTeams = [];
          if (!G.blacklistedTeams.includes(G.team.name)) G.blacklistedTeams.push(G.team.name);
          G.f1ContractYearsLeft = 0;
          const logText = `🕵️ Firmaste en secreto un pre-contrato con ${offerTeam.name}. Tu contrato con ${G.team.name} quedó reducido a esta temporada.`;
          G._seasonEventLogs.push(logText);
          showEventScene({
            icon: '🕵️',
            title: 'El trato está hecho',
            desc: logText,
            borderColor: UI_COLORS.accent,
            choices: [{ text: 'Continuar' }]
          });
        }
      }
    ]
  });
}

function showRegulationEvent() {
  if (G._shadowBetrayalActive) {
    G._shadowBetrayalActive = false;
    const options = ['current', 'split', 'next'];
    const effect = randFrom(options);
    let decisionLabel;
    if (effect === 'current') {
      G.regulationBonus = 8; G.nextSeasonRegBonus = -1;
      decisionLabel = 'apostar todo al campeonato actual';
    } else if (effect === 'split') {
      G.regulationBonus = 4; G.nextSeasonRegBonus = 0;
      decisionLabel = 'dividir los recursos de forma equilibrada';
    } else {
      G.regulationBonus = -4; G.nextSeasonRegBonus = 1;
      decisionLabel = 'apostar todo al desarrollo del nuevo reglamento';
    }
    const logText = `🚫 Excluido del desarrollo: el equipo decidió, sin consultarte, ${decisionLabel}.`;
    G._seasonEventLogs.push(logText);

    showEventScene({
      icon: '🔒',
      title: 'Fuera de las reuniones técnicas',
      desc: `La FIA anunció un nuevo reglamento técnico que entrará en vigor al final de esta temporada. Tu directiva ya sospecha de tu pre-contrato secreto: fuiste excluido de las reuniones técnicas a puertas cerradas.<br><br><span style="color:var(--muted)">${logText}</span>`,
      borderColor: UI_COLORS.danger,
      choices: [{ text: 'Continuar' }]
    });
    return;
  }

  showEventScene({
    icon: '📜',
    title: '¡Cambio de Reglamento Técnico!',
    desc: `La FIA anunció un nuevo reglamento técnico que entrará en vigor al final de esta temporada. ¿Cómo enfocás los recursos de tu equipo?`,
    borderColor: UI_COLORS.blue,
    choices: [
      {
        text: '🏎️ Apostar por esta temporada',
        subtitle: 'Beneficio: +8 de rendimiento ahora. Consecuencia: Tu equipo podría quedar peor posicionado.',
        onClick: () => {
          G.regulationBonus = 8;
          G.nextSeasonRegPenalty = 0;
          G.nextSeasonRegBonus = -1;
          const logText = `Decisión: Apostaste todo al campeonato actual.`;
          G._seasonEventLogs.push(logText);
          showEventScene({ icon: '✍️', title: 'Decisión tomada', desc: logText, choices: [{ text: 'Continuar' }] });
        }
      },
      {
        text: '⚖️ Dividir recursos',
        subtitle: 'Beneficio: +4 de rendimiento ahora. Mantenés tus opciones sin hipotecar el futuro ni el presente.',
        onClick: () => {
          G.regulationBonus = 4;
          G.nextSeasonRegPenalty = 0;
          G.nextSeasonRegBonus = 0;
          const logText = `Decisión: Dividiste los recursos equitativamente.`;
          G._seasonEventLogs.push(logText);
          showEventScene({ icon: '✍️', title: 'Decisión tomada', desc: logText, choices: [{ text: 'Continuar' }] });
        }
      },
      {
        text: '🔮 Apostar todo al nuevo reglamento',
        subtitle: 'Penalidad: -4 de rendimiento ahora. Después tenés una gran posibilidad de un salto en la parrilla.',
        onClick: () => {
          G.regulationBonus = -4;
          G.nextSeasonRegPenalty = 0;
          G.nextSeasonRegBonus = 1;
          const logText = `Decisión: Apostaste el desarrollo al nuevo reglamento.`;
          G._seasonEventLogs.push(logText);
          showEventScene({ icon: '✍️', title: 'Decisión tomada', desc: logText, choices: [{ text: 'Continuar' }] });
        }
      }
    ]
  });
}

// ═══════════════════════════════════════════════════════════
//  NICKNAMES
// ═══════════════════════════════════════════════════════════
function checkNicknames() {
  if (G.catIndex < 5) return; // Only in F1
  
  const currentNick = G.nickname;
  let newNick = null;
  let newDesc = null;
  
  const f1Seasons = G.seasons.filter(s => s.cat === 'F1');
  if (f1Seasons.length === 0) return;
  
  const totalF1Wins = f1Seasons.reduce((acc, s) => acc + s.wins, 0);
  const totalF1Poles = f1Seasons.reduce((acc, s) => acc + s.poles, 0);
  const titles = G.f1Titles;

  const titlesPerTeam = {};
  f1Seasons.forEach(s => {
    if (s.champ === 1) {
      titlesPerTeam[s.teamName] = (titlesPerTeam[s.teamName] || 0) + 1;
    }
  });
  
  let legendTeam = null;
  for (const [tName, tCount] of Object.entries(titlesPerTeam)) {
    if (tCount >= 3) {
      legendTeam = tName;
      break;
    }
  }
  const legendNick = legendTeam ? `La Leyenda de ${legendTeam}` : null;
  
  const has = (nick) => G.nicknameHistory.includes(nick);
  
  if (titles >= 7 && currentNick !== 'El Kaiser' && !has('El Kaiser')) {
    newNick = 'El Kaiser';
    newDesc = 'La dominación absoluta tiene un nombre. Siete o más títulos te han elevado a la categoría de mito, a la par de los más grandes de la historia.';
  } else if (legendNick && currentNick !== legendNick && !has(legendNick)) {
    newNick = legendNick;
    newDesc = `Ganaste tres campeonatos mundiales con ${legendTeam}. Tu nombre y el de la escudería quedarán grabados juntos en la historia.`;
  } else if (titles >= 1 && (has('El Escudero') || G.wasEscudero) && currentNick !== 'El Heredero' && !has('El Heredero')) {
    newNick = 'El Heredero';
    newDesc = 'Dejaste de vivir a la sombra de tu compañero de equipo. Rompiste tu destino de piloto secundario y finalmente reclamaste la corona mundial.';
  } else if (G.nonRenewalsCount >= 3 && currentNick !== 'El Mercenario' && !has('El Mercenario') && titles < 3) {
    newNick = 'El Mercenario';
    newDesc = 'Múltiples cambios de equipo en poco tiempo. Tu lealtad está con el mejor postor, o el auto más rápido.';
  } else if (G.renewalsCount >= 4 && currentNick !== 'El Hombre de la Casa' && !has('El Hombre de la Casa') && titles < 3) {
    newNick = 'El Hombre de la Casa';
    newDesc = 'Años de lealtad inquebrantable. Sos la cara visible y el alma de tu escudería.';
  } else if (totalF1Poles >= 15 && totalF1Poles > totalF1Wins * 2 && currentNick !== 'Mr. Sábado' && !has('Mr. Sábado') && titles < 2) {
    newNick = 'Mr. Sábado';
    newDesc = 'Nadie te iguala a una vuelta rápida en clasificación, pero los domingos suelen ser más difíciles de cerrar.';
  } else if (G.stats.rain >= 92 && G.catIndex === 5 && G.wetWins >= 3 && currentNick !== 'El Mago del Mojado' && !has('El Mago del Mojado')) {
    newNick = 'El Mago del Mojado';
    newDesc = 'Cuando el cielo se oscurece y la pista se moja, encontrás un agarre que nadie más puede ver.';
  } else if (G.stats.tyres >= 90 && G.stats.quali >= 90 && totalF1Wins >= 5 && currentNick !== 'El Profesor' && !has('El Profesor')) {
    newNick = 'El Profesor';
    newDesc = 'Frío, calculador y estratégico. Cuidás los neumaticos como nadie y ganás carreras usando la cabeza.';
  } else if (G.stats.speed >= 85 && G.stats.overtake >= 85 && G.stats.tyres <= 60 && currentNick !== 'El Kamikaze' && !has('El Kamikaze')) {
    newNick = 'El Kamikaze';
    newDesc = 'Espectáculo garantizado. Ataques al límite y velocidad pura, a costa de devorar los neumáticos.';
  } else if ((G.wasEscudero || f1Seasons.filter(s => s.champ === 2 || s.champ === 3).length >= 3) && titles === 0 && currentNick !== 'El Escudero' && !has('El Escudero')) {
    newNick = 'El Escudero';
    newDesc = 'Fiel compañero, sacrificaste tus propias chances de gloria para asegurar campeonatos de equipo.';
  } else if (G.personality && G.personality.aggressiveness >= 50 && currentNick !== 'El Depredador' && !has('El Depredador')) {
    newNick = 'El Depredador';
    newDesc = 'No dejás un hueco sin atacar. Tu agresividad en la pista asusta a tus rivales y alienta a los fans.';
  } else if (G.personality && G.personality.media >= 50 && currentNick !== 'Hollywood' && !has('Hollywood')) {
    newNick = 'Hollywood';
    newDesc = 'Naciste para las cámaras. Sos el gran showman de la categoría, siempre en el centro de atención.';
  } else if (G.personality && G.personality.media <= -50 && currentNick !== 'Iceman' && !has('Iceman')) {
    newNick = 'Iceman';
    newDesc = 'Respuestas cortas, mirada fría. La prensa no te saca una sonrisa, pero en la pista sos una máquina impecable.';
  } else if (G.personality && G.personality.team <= -50 && currentNick !== 'El Rebelde' && !has('El Rebelde')) {
    newNick = 'El Rebelde';
    newDesc = 'Las órdenes de equipo son solo sugerencias. Hacés la tuya sin importar lo que digan por la radio.';
  }
  
  if (newNick) {
    G.nickname = newNick;
    G.nicknameHistory.push(newNick);
    G.newNicknameThisSeason = { name: newNick, desc: newDesc };
  }
}

// ═══════════════════════════════════════════════════════════
//  SUMMARY SCREEN
// ═══════════════════════════════════════════════════════════
// Idea #1 fix: count-up animation instead of numbers popping in static.
function animateCount(el, endValue, opts) {
  opts = opts || {};
  const suffix = opts.suffix || '';
  const duration = opts.duration || 700;
  const startValue = opts.startValue || 0;
  const formatter = opts.formatter || (v => v);
  
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    const val = Math.round(startValue + (endValue - startValue) * eased);
    el.textContent = formatter(val) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = formatter(endValue) + suffix;
  }
  requestAnimationFrame(tick);
}

// Idea #2: a one-line "verdict" headline for the season, colored by tone.
function getSeasonVerdict(r, cat, firstInCat) {
  if (r.champ === 1 && cat === 'F1' && G.team.stars <= 4) {
    return { title: 'CAMPEÓN ÉPICO', color: '#c084fc', icon: '💎' };
  }
  if (firstInCat) {
    return { title: `Primer año en ${cat}`, color: '#a78bfa', icon: '✨' };
  }
  if (r.champ === 1) {
    return { title: r.wins >= 6 ? '¡Temporada histórica!' : 'Temporada de campeón', color: '#e8c84a', icon: '🏆' };
  }
  if (r.champ === 2) {
    return { title: 'Al borde de la gloria', color: '#f97316', icon: '🥈' };
  }
  if (r.champ === 3 || r.champ === 4) {
    return { title: 'Cerca de la cima', color: '#4ae87a', icon: '🥉' };
  }
  if (r.dnfs >= 3 && r.champ > 8) {
    return { title: 'Temporada para el olvido', color: '#e84a4a', icon: '💥' };
  }
  if (r.champ <= 8) {
    return { title: 'Temporada de consolidación', color: '#4a90e8', icon: '📈' };
  }
  return { title: 'Temporada irregular', color: '#7070a0', icon: '〰️' };
}



// Idea #6: quick canvas confetti burst for championship-winning seasons.
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#e8c84a', '#e84a4a', '#4a90e8', '#4ae87a', '#ffffff'];
  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    r: 3 + Math.random() * 4,
    vy: 2 + Math.random() * 3,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * Math.PI,
    vrot: -0.2 + Math.random() * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
      ctx.restore();
    });
    if (elapsed < 2600) requestAnimationFrame(tick);
    else { canvas.style.display = 'none'; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  requestAnimationFrame(tick);
}

function buildSummary() {
  checkAchievements('season_end');
  const r = G.lastResult;
  if (!r) {
    goto('screen-preseason');
    return;
  }


  document.getElementById('sum-season-label').textContent = `Temporada ${r.year} (Edad: ${G.age})`;
  document.getElementById('sum-cat-label').textContent = r.cat;

  // ── verdict banner ──
  const firstInCat = !G.seasons.slice(0, -1).some(s => s.cat === r.cat);
  const verdict = getSeasonVerdict(r, r.cat, firstInCat);
  document.getElementById('sum-verdict-wrap').innerHTML = `
    <div class="verdict-banner" style="background:${verdict.color}22; color:${verdict.color}; border:1px solid ${verdict.color}55">
      <span>${verdict.icon}</span><span>${verdict.title}</span>
    </div>`;

  // ── Idea #3 (hero): championship position front and center ──
  const champClass = r.champ === 1 ? 'good' : r.champ <= 3 ? '' : 'bad';
  const champColor = r.champ === 1 ? 'var(--accent)' : r.champ <= 3 ? 'var(--green)' : 'var(--accent2)';

  let standingsRows;
  if (_lastStandings && _lastStandings.year === r.year && _lastStandings.cat === r.cat) {
    standingsRows = _lastStandings.rows;
  } else {
    standingsRows = generateStandingsTable(r);
    const teamMap = {};
    standingsRows.forEach(row => {
      if (!teamMap[row.team]) teamMap[row.team] = { team: row.team, logo: row.logo, points: 0, hasPlayer: false };
      teamMap[row.team].points += row.points;
      if (row.isPlayer) teamMap[row.team].hasPlayer = true;
    });
    const constructorRows = Object.values(teamMap)
      .sort((a,b) => b.points - a.points)
      .map((t, i) => ({ ...t, rank: i+1 }));
    _lastStandings = { rows: standingsRows, constructors: constructorRows, cat: r.cat, year: r.year, view: 'drivers' };
  }



  const leaderPoints = standingsRows.find(s => s.rank === 1).points;
  const myRow = standingsRows.find(s => s.isPlayer);
  const gapText = r.champ === 1
    ? '🏆 Líder del campeonato'
    : `a ${leaderPoints - myRow.points} puntos del líder`;

  document.getElementById('sum-hero').innerHTML = `
    <div class="champ-hero" style="background:linear-gradient(160deg, ${champColor}14, transparent); border-color:${champColor}55">
      <div class="label">Posición en el campeonato</div>
      <div class="champ-num ${champClass}" id="sum-champ-num" style="color:${champColor}">0°</div>
      <div class="sub" style="margin-bottom:8px">${gapText}</div>
      <div class="standings-link" onclick="openStandingsModal()">Ver tabla completa 📊</div>
    </div>`;
  animateCount(document.getElementById('sum-champ-num'), r.champ, { suffix: '°' });

  // ── Idea #4: count-up secondary stats (3-up grid) ──
  const secondary = [
    { key: 'wins', label: 'Victorias', val: r.wins, cls: r.wins > 0 ? 'good' : 'zero' },
    { key: 'podiums', label: 'Podios', val: r.podiums, cls: r.podiums > 0 ? '' : 'zero' },
    { key: 'poles', label: 'Poles', val: r.poles, cls: r.poles > 0 ? '' : 'zero' },
  ];
  document.getElementById('sum-grid').innerHTML = secondary.map(s => `
    <div class="stat-box">
      <div class="val ${s.cls}" id="sum-stat-${s.key}">0</div>
      <div class="key">${s.label}</div>
    </div>`).join('');
  secondary.forEach(s => animateCount(document.getElementById(`sum-stat-${s.key}`), s.val));

  // ── Idea #7: accordions for Resultados / Finanzas / Sucesos ──
  const hasEvents = G._seasonEventLogs && G._seasonEventLogs.length > 0;
  const eventsHtml = hasEvents
    ? G._seasonEventLogs.map(l => `<div style="font-size:13px; margin-top:4px; color:var(--muted)">• ${l}</div>`).join('')
    : `<div class="sub">Sin sucesos destacados esta temporada.</div>`;

  document.getElementById('sum-accordions').innerHTML = `
    <details class="acc" open>
      <summary>📊 Resultados deportivos</summary>
      <div class="acc-body">
        <div class="result-row"><div class="r-label">Abandonos</div><div class="r-val ${r.dnfs > 2 ? 'bad' : ''}">${r.dnfs}</div></div>
        <div class="result-row"><div class="r-label">Rating de temporada</div><div class="r-val">${Math.round(r.rating || 0)}</div></div>
        <div class="result-row"><div class="r-label">Equipo</div><div class="r-val" style="font-size:15px">${r.teamName || '—'}</div></div>
      </div>
    </details>
    <details class="acc" open>
      <summary>💰 Finanzas</summary>
      <div class="acc-body">
        <div class="result-row"><div class="r-label">Dinero ganado</div><div class="r-val">${fmt$(r.earned)}</div></div>
        <div class="result-row"><div class="r-label">Reputación</div><div class="r-val good">+${r.rep}</div></div>
        <div class="result-row"><div class="r-label">Total acumulado</div><div class="r-val">${fmt$(G.money)}</div></div>
      </div>
    </details>
    <details class="acc" open>
      <summary>⚡ Sucesos de la temporada</summary>
      <div class="acc-body">${eventsHtml}</div>
    </details>
  `;

  // ── Highlights (nickname press release + generational peer) ──
  let highlightsHtml = '';
  if (G.newNicknameThisSeason) {
    const n = G.newNicknameThisSeason;
    highlightsHtml += `
      <div style="margin-top:6px; padding:16px; border-radius:8px; background:rgba(255, 215, 0, 0.1); border:1px solid #fbbf24; text-align:center">
        <div style="font-size:24px; margin-bottom:4px">📰</div>
        <div style="font-size:14px; color:#fbbf24; font-weight:bold; margin-bottom:4px">LA PRENSA HABLA</div>
        <div style="font-size:13px; color:var(--text); font-style:italic; margin-bottom:8px">"${n.desc}"</div>
        <div style="font-size:16px; font-weight:bold; color:white">Nuevo apodo: "${n.name}"</div>
      </div>
    `;
    G.newNicknameThisSeason = null;
  }

  if (G.peer && G.catIndex === 5) {
    const rel = G.peer.relationship;
    const relPct = Math.round((rel + 100) / 2); // 0% = -100, 100% = +100
    const relIcon = rel > 50 ? '🤝' : rel < -50 ? '⚔️' : '😐';
    const relLabel = rel > 50 ? 'Aliados' : rel < -50 ? 'Enemigos juramentados' : rel > 0 ? 'Buena onda' : rel < 0 ? 'Tensión' : 'Neutral';
    const relColor = rel > 30 ? '#4ade80' : rel < -30 ? '#f87171' : '#facc15';
    highlightsHtml += `
      <div style="margin-top:10px; padding:14px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--border)">
        <div style="font-size:12px; color:var(--muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:1px">Compañero de Garaje</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div style="display:flex; align-items:center;">
            <div style="position:relative; width:40px; height:40px; margin-right:12px; flex-shrink:0; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:24px; border:1px solid rgba(255,255,255,0.2);">
              <span style="position:absolute;">${G.peer.avatar || '👨🏻'}</span>
              <img src="assets/images/caras/cara ${G.peer.name.split(' ').pop().toLowerCase()}.png" onload="this.previousElementSibling.style.display='none'" onerror="this.style.display='none'" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:2;" />
            </div>
            <div>
              <div style="font-weight:bold">${G.peer.name} <span style="font-size:12px; color:var(--muted); font-weight:normal">(${G.peer.flag || (G.peer.nat && G.peer.nat.flag) || '❓'} OVR ${Math.round(G.peer.skill || 50)})</span></div>
              <div style="font-size:12px; color:var(--muted); font-weight:normal">${G.peer.h2hLosses} victorias, ${G.peer.h2hWins} derrotas</div>
            </div>
          </div>
          <div style="font-size:12px; color:${relColor}; font-weight:bold; text-align:right">${relLabel}</div>
        </div>
        <div style="background:rgba(0,0,0,0.3); border-radius:4px; height:8px; position:relative; overflow:hidden">
          <div style="position:absolute; left:0; top:0; height:100%; width:${relPct}%; background:${relColor}; border-radius:4px; transition:width 0.4s"></div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px; color:var(--muted)">
          <span>⚔️ Enemigo</span><span>H2H: ${G.peer.h2hLosses}–${G.peer.h2hWins}</span><span>Aliado 🤝</span>
        </div>
      </div>
    `;
  }
  document.getElementById('sum-highlights').innerHTML = highlightsHtml;

  // ── Idea #6: confetti for championship-winning seasons ──
  if (r.champ === 1) launchConfetti();

  updateTopBar();
}


function afterSummary() {

  const catIdx = G.catIndex;
  const r = G.lastResult;
  const careerLen = G.seasons.length;

  G.academyTempBans = []; // Clear 1-year bans
  G.regulationBonus = 0; // Clear bonuses after they were used
  G._minigamePowerBonus = 0;

  // Advance Age & Year
  G.year++;
  G.age++;
  
  if (G.aiRoster) {
    G.aiRoster.forEach(d => {
      d.age++;
      if (d.age < 28) {
        let maxLimit = 99;
        if (d.cat === 'F2') maxLimit = 80;
        else if (d.cat === 'F3') maxLimit = 75;
        else if (d.cat === 'Formula Regional') maxLimit = 65;
        else if (d.cat === 'F4') maxLimit = 60;
        else if (d.cat === 'Karting') maxLimit = 55;
        
        if (d.skill < maxLimit) {
          let growth = Math.floor(Math.random() * 3) + 1; // 1 to 3 points
          if (d.skill < 85 && Math.random() < 0.5 && d.cat === 'F1') growth += 1; // F1 gets extra boost
          d.skill = Math.min(d.skill + growth, maxLimit);
        }
      }
      else if (d.age > 33) d.skill -= Math.floor(Math.random() * 3);
    });
    simulateDriverMarket();
  }

  // Check retirement
  const maxAge = 35 + Math.floor((r.rating || 50) / 20);
  if (G.age >= maxAge || (catIdx === 0 && r.champ > 15 && careerLen > 3)) {
    showRetirement();
    return;
  }

  // Academy warnings logic
  if (G.academy && catIdx < 5) {
    if (r.champ > 8) {
      G.academyWarnings = (G.academyWarnings || 0) + 1;
    } else {
      G.academyWarnings = 0;
    }
    
    if (G.academyWarnings >= 3) {
      const academy = ACADEMIES.find(a => a.id === G.academy);
      G.academy = null;
      G.academyWarnings = 0;
      G.achievementsProgress = G.achievementsProgress || {};
      G.achievementsProgress['dropped_from_academy'] = true;
      updateTopBar();
      G._pendingFiredMsg = {
        type: 'message',
        title: 'Despido de la Academia',
        desc: `Tras sumar tres temporadas consecutivas decepcionantes en la misma categoría, la directiva de  ${academy.name} ha decidido rescindir tu contrato de desarrollo. Tendrás que buscarte tu propio camino.`
      };
    }
  }

  // If in F1 with contract years remaining, skip market entirely
  if (catIdx === 5 && G.f1ContractYearsLeft > 0) {
    G.f1ContractYearsLeft--;
    G._prevCatIdx = catIdx;
    goToContracts(catIdx, false, true); // skipContracts=true
    return;
  }

  const isFormative = G.catIndex < 5;
  
  // BANKRUPTCY CHECK: can the player afford any seat in their own category?
  // [DESACTIVADO A PEDIDO DEL JUGADOR: Asientos formativos gratis]
  /*
  if (isFormative) {
    const acadDisc = G.academy ? 0.30 : 1.0;
    const sameCatTeams = TEAMS[CATEGORIES[catIdx]] || [];
    const cheapestSeat = Math.min(...sameCatTeams.map(t => {
      const si = clamp((t.stars || 3) - 3, 0, 2);
      return getSeatCost(catIdx, t.stars, G.academy);
    }));
    if (G.money < cheapestSeat) {
      if (!G.loanUsed) {
        // Offer emergency loan
        showEmergencyLoanScreen(catIdx, r, cheapestSeat);
        return;
      } else {
        // Already used loan: bankruptcy ➔ forced retirement
        showRetirement('💸 Sin fondos para continuar tu carrera, te viste obligado a retirarte.');
        return;
      }
    }
  }
  */

  // Check if player can advance by position AND meets requirements in next category
  const posCanAdvance = r.champ <= 10 && G.catIndex < 5;
  const meetsNextReqs = posCanAdvance ? canMeetNextCatReqs(G.catIndex + 1) : false;
  let canAdvance = posCanAdvance && meetsNextReqs;
  const isChampion = r.champ === 1;

  // Position OK but no team accepts you in next category (OVR/Reputation)
  if (posCanAdvance && !meetsNextReqs && isFormative) {
    showNoOfferScreen(catIdx, r, true, false); // reqsFailed=true
    return;
  }

  // Position & Reqs OK, but check if they can afford next category
  let canAffordNext = true;
  // [DESACTIVADO A PEDIDO DEL JUGADOR: Asientos formativos gratis, ya no se requiere chequear fondos]
  /*
  if (isFormative && posCanAdvance && meetsNextReqs && catIdx + 1 < 5) {
    const nextCatIdx = catIdx + 1;
    const acadDisc = G.academy ? 0.30 : 1.0;
    const nextTeams = TEAMS[CATEGORIES[nextCatIdx]] || [];
    const cheapestNextSeat = Math.min(...nextTeams.map(t => {
      return getSeatCost(nextCatIdx, t.stars, G.academy);
    }));
    canAffordNext = G.money >= cheapestNextSeat;
  }
  */

  if (posCanAdvance && meetsNextReqs && !canAffordNext && isFormative) {
    showNoOfferScreen(catIdx, r, false, true); // fundsFailed=true
    return;
  }

  canAdvance = posCanAdvance && meetsNextReqs && canAffordNext;
  const canRepeat = canAdvance && isFormative && !isChampion;

  if (canRepeat) {
    showCategoryChoiceScreen(catIdx, r);
    return;
  }

  // Cannot advance (finished outside top 12) — forced repeat with message
  if (!canAdvance && G.catIndex < 5) {
    showNoOfferScreen(catIdx, r);
    return;
  }

  // Auto-advance
  if (canAdvance) {
    G.catIndex += 1;
    G.catIndex = Math.min(G.catIndex, 5);
  }

  G._prevCatIdx = catIdx;
  goToContracts(catIdx);
}

function showAcademyF2BlockEvent(pendingSteps = []) {
  const academy = ACADEMIES.find(a => a.id === G.academy);
  showEventScene({
    icon: `<img src="${academy.icon}" width="40" style="object-fit:contain">`,
    title: `Reunión con ${academy.name}`,
    desc: `Aunque tienes los puntos para subir a F1, los directivos de la academia te piden que hagas un año más en F2 para "terminar de desarrollarte", ya que no tienen asientos disponibles en F1 para ti en este momento.`,
    choices: [
      {
        text: 'Hacerles caso y seguir en F2',
        subtitle: 'Mantienes el favor de la academia, repitiendo categoría.',
        onClick: () => {
          G.catIndex = 4; // Stay in F2
          G.academyF2Repeated = true;
          G._nextSteps = pendingSteps.filter(s => s.type !== 'category_transition');
          processNextStep();
        }
      },
      {
        text: 'Romper el contrato y buscar asiento en F1',
        subtitle: 'Renuncias a la academia para subir a la F1 por tu cuenta. Te vetarán de sus equipos.',
        style: { borderColor: UI_COLORS.danger, color: UI_COLORS.danger },
        onClick: () => {
          G.academyBans = G.academyBans || [];
          G.academyBans.push(G.academy);
          G.academy = null;
          G.academyWarnings = 0;
          updateTopBar();
          G._nextSteps = [...pendingSteps];
          processNextStep();
        }
      }
    ]
  });
}

function showAcademyDropEvent(pendingSteps) {
  const academy = ACADEMIES.find(a => a.id === G.academy);
  showEventScene({
    icon: `<img src="${academy.icon}" width="40" style="object-fit:contain">`,
    title: 'Fin de Ciclo',
    desc: `Tu contrato con el equipo ha terminado. A pesar de tus esfuerzos los directivos de ${academy.name} sienten que tu techo de desarrollo no cumple con las expectativas para subirte al asiento. Han decidido no renovarte el apoyo, por lo que a partir de ahora eres agente libre. Podrás negociar con cualquier equipo de la parrilla.`,
    borderColor: UI_COLORS.danger,
    choices: [{
      text: 'Explorar el mercado',
      subtitle: 'Eres libre de fichar por quien quieras sin restricciones.',
      onClick: () => {
        G._seasonEventLogs.push(`Dejaste de pertenecer a la ${academy.name} tras finalizar tu contrato.`);
        G.academy = null;
        G.academyPromisedTeam = null;
        G.achievementsProgress = G.achievementsProgress || {};
        G.achievementsProgress['dropped_from_academy'] = true;
        updateTopBar();
        G.pendingAcademyInterview = 'f1_academy_dropped';
        G._nextSteps = [...pendingSteps];
        processNextStep();
      }
    }]
  });
}

function showAcademyMainTeamPromotionEvent(pendingSteps, promisedTeamName) {
  const academy = ACADEMIES.find(a => a.id === G.academy);
  showEventScene({
    icon: `<img src="${academy.icon}" width="40" style="object-fit:contain">`,
    title: `Llamada de ${academy.name}`,
    desc: `Has dominado a tu compañero durante todo tu contrato en el equipo. Los directivos de ${academy.name} han quedado impresionados con tu rendimiento constante y han decidido que es momento de dar el salto. ¡Te ofrecen un asiento en el equipo principal!`,
    borderColor: UI_COLORS.accent,
    choices: [{
      text: 'Aceptar el ascenso',
      subtitle: 'Firma con el equipo principal y gradúate de la academia.',
      style: { borderColor: UI_COLORS.accent, color: UI_COLORS.accent },
      onClick: () => {
        const oldTeamName = G.team ? G.team.name : null;
        const wasInF1 = G.catIndex === 5;
        
        const offerTeam = TEAMS['F1'].find(t => t.name === promisedTeamName);
        G.team = offerTeam;
        G.f1ContractYearsLeft = 2; // Un contrato de 2 años
        G.f1ContractH2HWins = 0;
        G.f1ContractH2HLosses = 0;
        if (G.catIndex === 5) refreshTeammate(true);
        
        // Displace AI teammate if needed
        if (G.aiRoster && offerTeam.name) {
          const newTeamDrivers = G.aiRoster.filter(d => d.cat === 'F1' && d.team === offerTeam.name);
          if (newTeamDrivers.length > 1) {
            const displaced = newTeamDrivers.find(d => !G.peer || d.id !== G.peer.id);
            if (displaced) {
              if (wasInF1 && oldTeamName && oldTeamName !== offerTeam.name) {
                displaced.team = oldTeamName;
                const stars = TEAMS['F1'].find(t => t.name === oldTeamName)?.stars || 3;
                displaced.contractYearsLeft = Math.floor(Math.random() * (stars >= 4 ? 4 : 2)) + 2;
              } else {
                G.aiRoster = G.aiRoster.filter(d => d.id !== displaced.id);
              }
            }
          }
        }
        
        const salary = offerTeam.stars >= 4 ? 2000000 : 1000000;
        G.money += salary; G.totalMoney += salary;
        
        G._seasonEventLogs = G._seasonEventLogs || [];
        G._seasonEventLogs.push(`🌟 ¡Te has graduado de la ${academy.name}! Al llegar al equipo principal, ya no eres un piloto junior, sino una estrella consagrada de la Fórmula 1.`);
        G.academy = null;
        updateTopBar();
        
        G.pendingAcademyInterview = 'f1_academy_promoted_main';
        G._nextSteps = [...pendingSteps];
        processNextStep();
      }
    }]
  });
}

function showAcademyPromisedSeatEvent(pendingSteps, promisedTeamName, champ) {
  const academy = ACADEMIES.find(a => a.id === G.academy);
  
  let desc = '';
  if (champ === 1) {
    desc = `¡Felicidades Campeón! Cumpliste con todo lo que te pedimos al repetir tu temporada en F2. Como recompensa a tu dedicación y talento, hemos decidido subirte directamente al primer equipo. ¡Tienes un asiento garantizado en ${promisedTeamName} para esta temporada!`;
  } else {
    desc = `Tu rendimiento durante la temporada ha convencido a los directivos. Estan convencidos de que estás listo para dar el siguiente paso y, aunque aun no hay lugar en el equipo, gracias a los lazos que mantenemos dentro de la Fórmula 1, hemos conseguido asegurarte un asiento en ${promisedTeamName}. Si lo haces bien, tendras prioridad para ocupar un asiento en nuestro equipo principal cuando se presente la oportunidad`;
  }

  showEventScene({
    icon: `<img src="${academy.icon}" width="40" style="object-fit:contain">`,
    title: 'El Ascenso Prometido',
    desc: desc,
    borderColor: UI_COLORS.accent,
    choices: [{
      text: '¡Firmar el contrato!',
      subtitle: 'Ir a firmar tu nuevo contrato en F1.',
      style: { borderColor: UI_COLORS.accent, color: UI_COLORS.accent },
      onClick: () => {
        const offerTeam = TEAMS['F1'].find(t => t.name === promisedTeamName);
        G.team = offerTeam;
        G.academyPromisedTeam = null;
        
        // Add post-season interview based on team
        if (champ === 1) {
          G.pendingAcademyInterview = 'f1_academy_sign_main';
          G.achievementsProgress = G.achievementsProgress || {};
          G.achievementsProgress['academy_straight_to_main'] = true;
        } else {
          G.pendingAcademyInterview = 'f1_academy_sign_filial';
        }
        
        // Graduarse si asciende directo al principal
        if (academy && academy.f1Teams[0] === offerTeam.name) {
          G._seasonEventLogs = G._seasonEventLogs || [];
          G._seasonEventLogs.push(`🌟 ¡Te has graduado de la ${academy.name}! Al firmar con el equipo principal, ya no eres un piloto junior, sino una estrella consagrada.`);
          G.academy = null;
          updateTopBar();
        }
        G.f1ContractYearsLeft = 1;
        G.f1ContractH2HWins = 0;
        G.f1ContractH2HLosses = 0;
        if (G.catIndex === 5) refreshTeammate(true);
        
        // Displace AI teammate if needed
        if (G.aiRoster && offerTeam.name) {
          const newTeamDrivers = G.aiRoster.filter(d => d.cat === 'F1' && d.team === offerTeam.name);
          if (newTeamDrivers.length > 1) {
            const displaced = newTeamDrivers.find(d => !G.peer || d.id !== G.peer.id);
            if (displaced) {
              G.aiRoster = G.aiRoster.filter(d => d.id !== displaced.id);
            }
          }
        }

        const salary = offerTeam.stars >= 4 ? 1500000 : 500000;
        G.money += salary; G.totalMoney += salary;
        G._prevCatIdx = 4;

        G._nextSteps = [...pendingSteps];
        processNextStep();
      }
    }]
  });
}

function showAcademyMutualTerminationEvent(pendingSteps = []) {
  const academy = ACADEMIES.find(a => a.id === G.academy);
  showEventScene({
    icon: `<img src="${academy.icon}" width="40" style="object-fit:contain">`,
    title: 'Rescisión de Mutuo Acuerdo',
    desc: `${academy.name} reconoce que tienes nivel para subir a F1, pero lamentablemente siguen sin tener un asiento disponible para ti. Han decidido liberarte de tu contrato en buenos términos para que busques tu oportunidad. No podrán ficharte este año, pero las puertas quedan abiertas para el futuro.`,
    borderColor: UI_COLORS.blue,
    choices: [{
      text: 'Agradecer y ser libre',
      subtitle: 'Te conviertes en agente libre.',
      onClick: () => {
        G.academyTempBans = G.academyTempBans || [];
        G.academyTempBans.push(G.academy);
        G.academy = null;
        G.academyWarnings = 0;
        G.achievementsProgress = G.achievementsProgress || {};
        G.achievementsProgress['dropped_from_academy'] = true;
        updateTopBar();
        G._nextSteps = [...pendingSteps];
        processNextStep();
      }
    }]
  });
}

function showAcademyEvent(pendingSteps = []) {
  let available = ACADEMIES.filter(a => !(G.academyBans || []).includes(a.id));
  if (available.length === 0) available = ACADEMIES;
  const academy = randFrom(available);

  showEventScene({
    icon: `<img src="${academy.icon}" width="40" style="object-fit:contain">`,
    title: `Invitación: ${academy.name}`,
    desc: `Tus grandes actuaciones te metieron en el radar de la academia de ${academy.name}. Te ofrecen unirte a su programa de jóvenes pilotos, con grandes beneficios pero también obligaciones.`,
    borderColor: UI_COLORS.accent,
    bgGradient: 'rgba(235, 180, 50, 0.15)',
    choices: [
      {
        text: `Unirse a la academia de ${academy.name}`,
        subtitle: 'Te facilitará el camino y los contratos, pero estarás atado a ellos.',
        style: { borderColor: UI_COLORS.accent, color: UI_COLORS.accent, boxShadow: '0 0 16px rgba(232,200,74,.25)' },
        onClick: () => {
          G.academy = academy.id;
          if (G.nemesis && Math.random() < 0.25) G.nemesis.academy = academy.id;
          G.academyWarnings = 0;
          updateTopBar();
          G._nextSteps = [...pendingSteps];
          processNextStep();
        }
      },
      {
        text: 'Rechazar',
        subtitle: 'Prefiero mantener mi independencia.',
        onClick: () => {
          G.achievementsProgress = G.achievementsProgress || {};
          G.achievementsProgress['rejected_academy'] = true;
          G._nextSteps = [...pendingSteps];
          processNextStep();
        }
      }
    ]
  });
}

function showGoldenBoyEvent(pendingSteps = []) {
  const topTeams = TEAMS['F1'].filter(t => t.stars >= 4);
  const offerTeam = randFrom(topTeams);

  showEventScene({
    icon: '🌟',
    title: 'Fichaje Estrella',
    desc: `Tus formidables actuaciones en categorías menores llamaron la atención de ${offerTeam.name}. Quieren saltarse los protocolos y ofrecerte un asiento inmediato en F1.`,
    borderColor: UI_COLORS.accent,
    bgGradient: 'rgba(235, 180, 50, 0.15)',
    choices: [
      {
        text: `Aceptar oferta de ${offerTeam.name}`,
        subtitle: 'Firma con un equipo Top inmediatamente.',
        style: { borderColor: UI_COLORS.accent, color: UI_COLORS.accent, boxShadow: '0 0 16px rgba(232,200,74,.25)' },
        onClick: () => {
          G.achievementsProgress = G.achievementsProgress || {};
          G.achievementsProgress['golden_boy_offer'] = true;
          G.team = offerTeam;
          G.f1ContractYearsLeft = Math.random() < 0.5 ? 1 : 2;
          G.f1ContractH2HWins = 0;
          G.f1ContractH2HLosses = 0;
          if (G.catIndex === 5) refreshTeammate(true);
          
          if (G.aiRoster && offerTeam.name) {
            const newTeamDrivers = G.aiRoster.filter(d => d.cat === 'F1' && d.team === offerTeam.name);
            if (newTeamDrivers.length > 1) {
              const displaced = newTeamDrivers.find(d => !G.peer || d.id !== G.peer.id);
              if (displaced) {
                G.aiRoster = G.aiRoster.filter(d => d.id !== displaced.id);
              }
            }
          }

          const salary = 2000000;
          G.money += salary; G.totalMoney += salary;

          G._prevCatIdx = 4;
          G._nextSteps = [...pendingSteps];
          processNextStep();
        }
      },
      {
        text: 'Rechazar y ver el mercado',
        subtitle: 'Gracias, pero prefiero elegir yo mismo.',
        onClick: () => {
          G._nextSteps = ['contracts', ...pendingSteps];
          processNextStep();
        }
      }
    ]
  });
}

function showCategoryChoiceScreen(oldCatIdx, r) {
  const currentCat = CATEGORIES[oldCatIdx];
  const nextCat = CATEGORIES[Math.min(oldCatIdx + 1, 5)];

  const screen = document.getElementById('screen-contracts');
  screen.querySelector('.stripe').style.display = 'block';
  document.querySelector('#screen-contracts .heading').textContent = '¿Qué hacés el año que viene?';
  document.querySelector('#screen-contracts .sub').textContent = `Terminaste ${r.champ}° en ${currentCat}. Podés subir o quedarte a perfeccionar.`;

  const list = document.getElementById('contracts-list');
  list.innerHTML = '';

  // Option: advance
  const advCard = document.createElement('div');
  advCard.className = 'card offer-card selectable';
  advCard.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <span style="font-size:28px">📈</span>
      <div><div class="heading" style="font-size:18px">Subir a ${nextCat}</div>
      <div class="sub" style="margin-top:2px">Nuevo desafío, más competencia, mayor salario</div></div>
    </div>
  `;
  advCard.onclick = () => {
    G.catIndex = Math.min(oldCatIdx + 1, 5);
    G._prevCatIdx = oldCatIdx;
    goToContracts(oldCatIdx);
  };
  list.appendChild(advCard);

  // Option: repeat
  const repCard = document.createElement('div');
  repCard.className = 'card offer-card selectable';
  repCard.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <span style="font-size:28px">🔄</span>
      <div><div class="heading" style="font-size:18px">Repetir ${currentCat}</div>
      <div class="sub" style="margin-top:2px">Más experiencia en esta categoría para llegar como favorito</div></div>
    </div>
  `;
  repCard.onclick = () => {
    // stay in same cat
    G._prevCatIdx = oldCatIdx;
    goToContracts(oldCatIdx, true);
  };
  list.appendChild(repCard);

  goto('screen-contracts');
}

function goToContracts(oldCatIdx, repeatCat = false, skipContracts = false) {
  // Al cambiar de categoría, reseteamos el contador de lealtad/mercenario
  if (G.catIndex !== oldCatIdx) {
    G.renewalsCount = 0;
    G.nonRenewalsCount = 0;
  }

  const steps = [];
  if (G.catIndex > oldCatIdx) {
    steps.push({ type: 'category_transition', oldCat: CATEGORIES[oldCatIdx], newCat: CATEGORIES[G.catIndex] });
  }
  
  if (!skipContracts) steps.push('contracts');
  steps.push('preseason');
  if (G._pendingFiredMsg) {
    steps.unshift(G._pendingFiredMsg);
    G._pendingFiredMsg = null;
  }

  // Refresh teammate every F1 season from aiRoster
  if (G.catIndex === 5 && skipContracts) {
    refreshTeammate();
  }

  // Academy Main Team Promotion (End of filial contract)
  if (oldCatIdx === 5 && G.catIndex === 5 && G.academy && !skipContracts) {
     const academy = ACADEMIES.find(a => a.id === G.academy);
     if (academy && academy.f1Teams.length > 1) {
       // if we are currently in a B-team
       const isBTeam = academy.f1Teams.slice(1).includes(G.team.name);
       if (isBTeam) {
         // Evaluamos todo el contrato usando las nuevas variables persistentes
         // f1ContractH2HLosses = veces que perdiste el H2H. f1ContractH2HWins = veces que ganaste
         const contractLost = G.f1ContractH2HLosses || 0;
         const contractWon = G.f1ContractH2HWins || 0;
         
         if (contractLost === 0 && contractWon > 0) {
            showAcademyMainTeamPromotionEvent(steps.filter(s => s !== 'contracts'), academy.f1Teams[0]);
            return;
         } else {
            showAcademyDropEvent(steps);
            return;
         }
       }
     }
  }

  // F2 -> F1 Academy logic
  if (oldCatIdx === 4 && G.catIndex === 5 && G.academy && !skipContracts) {
    const ovr = Math.round(Object.values(G.stats).reduce((a, b) => a + b) / 5);

    const academy = ACADEMIES.find(a => a.id === G.academy);
    const f1TeamsPool = TEAMS['F1'].filter(t => academy.f1Teams.includes(t.name));
    f1TeamsPool.sort((a,b) => b.stars - a.stars); // Sort highest stars first
    
    if (G.academyF2Repeated) {
      G.academyF2Repeated = false;
      const champ = G.lastResult.champ;
      if (champ <= 5) {
        if (champ === 1 && f1TeamsPool.length > 0) {
          G.academyPromisedTeam = f1TeamsPool[0].name; // Team A
        } else if (f1TeamsPool.length > 0) {
          G.academyPromisedTeam = f1TeamsPool[f1TeamsPool.length - 1].name; // Team B
        }
        showAcademyPromisedSeatEvent(steps.filter(s => s !== 'contracts'), G.academyPromisedTeam, champ);
        return;
      } else {
        showAcademyMutualTerminationEvent(steps);
        return;
      }
    } else {
      const validAcademyOffers = f1TeamsPool.filter(t => {
        const reqs = getTeamRequirements(t.stars, G.catIndex);
        return G.reputation >= reqs.rep && ovr >= reqs.ovr;
      });

      if (validAcademyOffers.length === 0) {
        showAcademyF2BlockEvent(steps);
        return;
      }
    }
  }

  // Golden Boy: check when entering F1 from F2
  if (oldCatIdx === 4 && G.catIndex === 5 && !G._goldenBoyChecked && !G.academy) {
    G._goldenBoyChecked = true;
    const formativeWins = G.seasons.filter(s => s.cat !== 'F1').reduce((acc, s) => acc + s.wins, 0);
    const f2SeasonsCount = G.seasons.filter(s => s.cat === 'F2').length;
    const top5F2 = G.lastResult && G.lastResult.champ <= 5;
    
    // Solo sale si estuviste menos de 3 temporadas en F2 (chico de oro = ascenso meteórico)
    if (top5F2 && formativeWins >= 5 && f2SeasonsCount < 3 && Math.random() < 0.5) {
      // Golden Boy event ignores 'contracts' step since it handles signing internally
      showGoldenBoyEvent(steps.filter(s => s !== 'contracts'));
      return;
    }
  }

  // Academy Offer: check when in Karting, F4 or FR
  if (!G.academy && !G.academyOffered && [0, 1, 2].includes(oldCatIdx)) {
    const catName = CATEGORIES[oldCatIdx];
    const seasonsInCat = G.seasons.filter(s => s.cat === catName).length;
    
    // Solo pueden ofrecerte la academia en tu primer o segundo año en la categoría
    if (seasonsInCat <= 2) {
      const top3 = G.lastResult && G.lastResult.champ <= 3;
      if (top3 && Math.random() < 0.25) {
        G.academyOffered = true;
        showAcademyEvent(steps);
        return;
      }
    }
  }

  G._nextSteps = steps;
  processNextStep();
}

function showNoOfferScreen(catIdx, r, reqsFailed = false, fundsFailed = false) {
  const cat = CATEGORIES[catIdx];
  const nextCat = CATEGORIES[Math.min(catIdx + 1, 5)];
  const screen = document.getElementById('screen-contracts');
  screen.querySelector('.stripe').style.display = 'block';
  document.querySelector('#screen-contracts .heading').textContent = fundsFailed ? 'Sin presupuesto' : 'Sin ofertas';
  document.querySelector('#screen-contracts .sub').textContent = '';

  const list = document.getElementById('contracts-list');
  list.innerHTML = '';

  let reason = `Terminaste ${r.champ}º en ${cat}. Los equipos de la categoría superior no te tuvieron en cuenta. Tendrás que repetir ${cat}.`;
  if (reqsFailed) {
    reason = `Terminaste ${r.champ}º en ${cat}, pero ningún equipo de ${nextCat} te ofrece un asiento. No cumplís los requisitos de reputación u OVR. Tendrás que repetir ${cat} y mejorar.`;
  } else if (fundsFailed) {
    reason = `Terminaste ${r.champ}º en ${cat} y los equipos de ${nextCat} te ofrecieron un asiento, pero NO TENÉS PRESUPUESTO para pagarlo. Te viste obligado a repetir ${cat}.`;
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.style.textAlign = 'center';
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px">🚫</div>
    <div class="heading" style="font-size:20px;margin-bottom:8px">${fundsFailed ? 'No hay presupuesto' : 'Nadie te buscó'}</div>
    <div class="sub" style="margin-bottom:16px">${reason}</div>
    <button class="btn btn-primary" id="btn-no-offer-ok">Aceptar y seguir</button>
  `;
  list.appendChild(card);

  document.getElementById('btn-no-offer-ok').onclick = () => {
    G._prevCatIdx = catIdx;
    goToContracts(catIdx, true);
  };

  goto('screen-contracts');
}

function showMessageScreen(title, desc) {
  let screen = document.getElementById('screen-message');
  if (!screen) {
    screen = document.createElement('div');
    screen.className = 'screen';
    screen.id = 'screen-message';
    screen.style.justifyContent = 'center';
    screen.innerHTML = `
      <div class="label" style="margin-bottom:8px">Notificación</div>
      <div class="card mb-24">
        <div class="heading" id="msg-title" style="margin-bottom:8px"></div>
        <div class="sub" id="msg-desc" style="line-height:1.5"></div>
      </div>
      <button class="btn btn-primary" onclick="processNextStep()" style="width:100%">Continuar →</button>
    `;
    document.getElementById('app').appendChild(screen);
  }
  document.getElementById('msg-title').innerHTML = title;
  document.getElementById('msg-desc').innerHTML = desc;
  goto('screen-message');
}

function processNextStep() {
  if (!G._nextSteps || G._nextSteps.length === 0) return;
  const step = G._nextSteps.shift();
  window._activeStepCallback = processNextStep;

  if (typeof step === 'object' && step.type === 'category_transition') {
    playCategoryTransition(step.oldCat, step.newCat, processNextStep);
  } else if (typeof step === 'object' && step.type === 'message') {
    showMessageScreen(step.title, step.desc);
  } else if (typeof step === 'string' && step.startsWith('event:')) {
    showInterview(step.split(':')[1]);
  } else if (step === 'contracts') {
    showContracts();
  } else if (step === 'preseason') {
    if (G._pendingTeammateChangeMsg) {
      const p = G._pendingTeammateChangeMsg;
      const title = '🏎️ Cambio en el Garaje';
      const resultText = p.h2hWins > p.h2hLosses ? 'a tu favor' : (p.h2hWins < p.h2hLosses ? 'en tu contra' : 'en empate');
      const nemesisColor = p.isNemesis ? 'color:var(--danger);' : 'color:#6366f1;';
      const desc = `Tu antiguo compañero, <strong>${p.oldName}</strong>, ${p.destination}.<br><br>El duelo interno durante estos años finalizó con un récord de <strong>${p.h2hWins} a ${p.h2hLosses}</strong> ${resultText}.<br><br>Tu nuevo compañero de equipo será <strong style="${nemesisColor}">${p.newName}</strong>.`;
      G._pendingTeammateChangeMsg = null;
      G._nextSteps.unshift('preseason');
      showMessageScreen(title, desc);
      return;
    }

    // Check Nemesis Progression
    if (G.nemesis && !G.nemesis.retired && G.aiRoster) {
      const nemDriver = G.aiRoster.find(d => d.id === G.nemesis.id);
      if (nemDriver) {
        const nemCatIdx = CATEGORIES.indexOf(nemDriver.cat);
        if (nemCatIdx < G.catIndex) {
          // Forcefully promote nemesis to player's category
          nemDriver.cat = CATEGORIES[G.catIndex];
          G.nemesis.cat = nemDriver.cat;
          
          const newCatTeams = TEAMS[nemDriver.cat];
          if (newCatTeams && newCatTeams.length > 0) {
            nemDriver.team = newCatTeams[Math.floor(Math.random() * newCatTeams.length)].name;
            // Kick an existing AI driver out of this team to make room
            const driversInTarget = G.aiRoster.filter(d => d.cat === nemDriver.cat && d.team === nemDriver.team && d.id !== nemDriver.id);
            if (driversInTarget.length >= (nemDriver.cat === 'F1' ? 2 : 3)) { // Assuming F1 has 2 seats, juniors have 3
              const toDisplace = driversInTarget.find(d => !G.peer || d.id !== G.peer.id);
              if (toDisplace) {
                // Completely remove the displaced driver to prevent them from racing as a 'Free Agent'
                G.aiRoster = G.aiRoster.filter(d => d.id !== toDisplace.id);
              }
            }
          } else {
            nemDriver.team = 'Privado';
          }
          
          let baseSkill = 30;
          if (G.catIndex === 5) baseSkill = 80;
          else if (G.catIndex === 4) baseSkill = 60;
          else if (G.catIndex === 3) baseSkill = 50;
          if (nemDriver.skill < baseSkill) nemDriver.skill = baseSkill;
          
        } else if (nemCatIdx > G.catIndex) {
          // Nemesis is ahead of player
          const flagKey = `nemesis_ahead_${G.year}`;
          if (!G.storyFlags[flagKey]) {
            G.storyFlags[flagKey] = true;
            G._nextSteps.unshift('event:nemesis_ahead_comment');
          }
        }
      }
    }

    const cat = CATEGORIES[G.catIndex];
    if (G._tempStarBonusCalculatedForYear !== G.year) {
      G._tempStarBonusCalculatedForYear = G.year;
      G._tempStarBonus = 0;
      const isRegChange = cat === 'F1' && G.lastRegChangeYear === (G.year - 1);
      
      let msgTitle = null;
      let msgDesc = null;

      if (isRegChange && G._shadowVerdictPending) {
        G._shadowVerdictPending = false;
        const stars = G.team.stars;
        let verdictLine;
        G.achievementsProgress = G.achievementsProgress || {};
        if (stars === 5) {
          verdictLine = '¡Cumplieron lo prometido! Tenés un cohete entre las manos.';
          G.achievementsProgress['shadow_success'] = true;
        }
        else if (stars === 4) verdictLine = 'No es el auto dominante que prometieron, pero vas a pelear arriba.';
        else if (stars === 3) {
          verdictLine = 'Te vendieron humo. El auto está en la mitad de la tabla.';
          G.achievementsProgress['shadow_scam'] = true;
        }
        else {
          verdictLine = '¡Te estafaron! El auto es una carreta. No vas a pelear por nada.';
          G.achievementsProgress['shadow_scam'] = true;
        }
        const oldTeamName = G._shadowOldTeam || 'tu antiguo equipo';
        msgTitle = '🚨 La Verdad del Pre-Contrato';
        msgDesc = `Se revelan los autos de la nueva era. Tu auto de <strong>${G.team.name}</strong> rinde al nivel de <strong>${stars} estrella${stars === 1 ? '' : 's'}</strong>.<br><br>${verdictLine}<br><br><span style="color:var(--accent2)">Tu antiguo equipo, ${oldTeamName}, te cerró las puertas para siempre.</span>`;
      } else if (isRegChange) {
        msgTitle = '⚠️ Nuevo Reglamento';
        msgDesc = `Los cambios técnicos entraron en vigor. Tras los test de pretemporada, se confirmó que tu auto rinde al nivel de <strong>${G.team.stars} estrellas</strong>.`;
      } else if (cat === 'F1' && Math.random() < 0.2) {
        const delta = Math.random() < 0.5 ? 1 : -1;
        if (G.team.stars + delta >= 1 && G.team.stars + delta <= 5) {
          G._tempStarBonus = delta;
          if (delta > 0) {
            msgTitle = '🚀 Desarrollo brillante en invierno';
            msgDesc = `Los ingenieros encontraron rendimiento extra en el simulador y túnel de viento. Tu auto rendirá como de <strong>${G.team.stars + 1} estrellas</strong> esta temporada.`;
          } else {
            msgTitle = '📉 Problemas en el túnel de viento';
            msgDesc = `Hubo problemas de correlación con el diseño. Tu auto rendirá peor de lo esperado, como de <strong>${G.team.stars - 1} estrellas</strong> esta temporada.`;
          }
        }
      }

      if (msgTitle) {
        G._nextSteps.unshift('preseason');
        showMessageScreen(msgTitle, msgDesc);
        return;
      }
    }

    // If nemesis was kicked out mid-season, find a new teammate for preseason
    if (G._pendingRefreshTeammate) {
      G._pendingRefreshTeammate = false;
      refreshTeammate();
    }
    // Ensure the pilot has a valid team for their current category
    const validTeams = TEAMS[CATEGORIES[G.catIndex]];
    if (!validTeams.find(t => t.name === G.team.name)) {
      G.team = randFrom(validTeams);
    }
    buildPreseason();
    goto('screen-preseason');
  }
}

// ═══════════════════════════════════════════════════════════
//  RANDOM EVENT
// ═══════════════════════════════════════════════════════════
const STAT_LABELS = { speed: 'Velocidad', quali: 'Clasificación', rain: 'Lluvia', tyres: 'Gestión', overtake: 'Adelantamientos' };

// ── TYPEWRITER ──
function typewriterRadio(elId, text, speed = 15) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (el._typewriterTimeout) clearTimeout(el._typewriterTimeout);
  el.textContent = '';
  el._fullText = text;
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      el._typewriterTimeout = setTimeout(tick, speed);
    }
  };
  tick();
}

function autocompleteRadio(elId) {
  const el = document.getElementById(elId);
  if (el && el._fullText) {
    if (el._typewriterTimeout) clearTimeout(el._typewriterTimeout);
    el.textContent = el._fullText;
  }
}

function showRandomEvent(forcedId = null) {
  resetEventChrome();
  const playerStars = G.team ? G.team.stars : 0;

  // Build candidate event pool — filter out special one-time or conditional events
  let pool = RANDOM_EVENTS.filter(ev => {
    if (ev.requireAcademy && !G.academy) return false;
    if (ev.minCat !== undefined && G.catIndex < ev.minCat) return false;
    if (ev.maxCat !== undefined && G.catIndex > ev.maxCat) return false;
    
    if (ev.id === 'pendrive') {
      // Only show if: player is in F1, on a 5-star team, and hasn't seen it this career
      if (G._pendriveUsed) return false;
      if (G.catIndex < 5) return false; // F1 only
      if (playerStars < 5) return false;
    }
    if (ev.id === 'rookie') {
      if (G.catIndex < 5) return false; // Only in F1
      if (G.age < 30) return false; // Player must be veteran
      if (!G.peer || (G.peer.yearsAsTeammate || 0) > 0) return false; // Teammate's first year with you
      
      const peerDriver = G.aiRoster ? G.aiRoster.find(d => d.id === G.peer.id) : null;
      if (!peerDriver || peerDriver.age > 22) return false; // Teammate must be young (rookie age)
    }
    if (ev.id === 'monaco' || ev.id === 'casino') {
      if (G.catIndex < 5) return false; // F1 only
      if (playerStars < 3) return false; // Only 3+ star teams can win Monaco
    }
    if (ev.id === 'fuga') {
      if (G.catIndex < 4) return false; // F2 or F1 only
    }
    if (ev.id === 'directiva') {
      if (G.catIndex < 5) return false; // F1 only
      if (G.f1ConsecutiveTitles < 3) return false; // Must have 3 CONSECUTIVE titles
      if (!G._pendingRegChange) return false; // Must be in a regulation change year
      if (G._directivaUsed) return false; // Only once per career
      if (Math.random() >= 0.5) return false; // 50% chance if conditions met
    }
    if (ev.id === 'peer_choque' || ev.id === 'peer_amigo' || ev.id === 'peer_numero1' || ev.id === 'peer_wall') {
      if (!G.peer) return false; // Peer must exist
      if (G.catIndex < 5) return false; // F1 only
      // peer_choque more likely when relationship is neutral or hostile
      if (ev.id === 'peer_choque' && G.peer.relationship > 30) return false;
      // peer_amigo more likely when relationship is neutral or friendly
      if (ev.id === 'peer_amigo' && G.peer.relationship < -30) return false;
      if (ev.id === 'peer_numero1') {
        if (!G.team || G.team.name !== G.peer.team) return false;
        if (G.peer.h2hWins <= G.peer.h2hLosses) return false;
      }
      if (ev.id === 'peer_wall' && G.peer.relationship >= -30) return false;
    }
    // Nemesis-only events
    if (ev.nemesisOnly) {
      if (!G.nemesis) return false;
      const nemDriver = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
      if (!nemDriver || nemDriver.cat !== CATEGORIES[G.catIndex]) return false; // Must be in same category
    }
    if (ev.nemesisTeammateOnly) {
      if (!G.nemesis || !G.peer) return false;
      if (G.peer.id !== G.nemesis.id) return false; // Must be your current teammate
    }
    if (ev.requireAcademyNemesis) {
      if (!G.academy || !G.nemesis || G.nemesis.academy !== G.academy) return false;
      const nemDriver = G.aiRoster && G.aiRoster.find(d => d.id === G.nemesis.id);
      if (!nemDriver || nemDriver.cat !== CATEGORIES[G.catIndex]) return false; // Must be in same category
    }
    return true;
  });
  if (pool.length === 0) pool = RANDOM_EVENTS;

  // Boost probability of peer events so they appear more often
  const peerEvents = pool.filter(ev => ev.id && ev.id.startsWith('peer_'));
  if (peerEvents.length > 0) {
    // Add them 3 more times to the pool to make them much more likely
    pool.push(...peerEvents, ...peerEvents, ...peerEvents);
  }

  // Resolve dynamic descriptions (e.g. pendrive engineer team name)
  let evTemplate;
  if (forcedId) {
    evTemplate = RANDOM_EVENTS.find(e => e.id === forcedId);
  }
  if (!evTemplate) evTemplate = randFrom(pool);
  // Deep-clone so we can safely mutate descriptions
  const ev = JSON.parse(JSON.stringify(evTemplate));

  if (G.peer) {
    ev.title = ev.title.replace(/\{\{PEER_NAME\}\}/g, G.peer.name);
    ev.desc = ev.desc.replace(/\{\{PEER_NAME\}\}/g, G.peer.name);
  }

  if (G.academy) {
    const ac = ACADEMIES.find(a => a.id === G.academy);
    if (ac) {
      ev.title = ev.title.replace(/\{\{ACADEMY_NAME\}\}/g, ac.name);
      ev.desc = ev.desc.replace(/\{\{ACADEMY_NAME\}\}/g, ac.name);
      ev.choices.forEach(ch => {
        ch.text = ch.text.replace(/\{\{ACADEMY_NAME\}\}/g, ac.name);
        if (ch.successDesc) ch.successDesc = ch.successDesc.replace(/\{\{ACADEMY_NAME\}\}/g, ac.name);
        if (ch.failDesc) ch.failDesc = ch.failDesc.replace(/\{\{ACADEMY_NAME\}\}/g, ac.name);
        if (ch.fixedDesc) ch.fixedDesc = ch.fixedDesc.replace(/\{\{ACADEMY_NAME\}\}/g, ac.name);
      });
    }
  }

  if (ev.id === 'pendrive') {
    G._pendriveUsed = true;
    // Pick a rival 5-star team that is NOT the player's team
    const rivals = TEAMS['F1'].filter(t => t.stars === 5 && t.name !== G.team.name);
    const rivalTeam = rivals.length > 0 ? randFrom(rivals).name : 'un equipo rival';
    ev.desc = ev.desc.replace('{{RIVAL_TEAM}}', rivalTeam);
    ev.choices[1].successDesc = ev.choices[1].successDesc.replace('{{RIVAL_TEAM}}', rivalTeam);
    ev.choices[1].failDesc   = ev.choices[1].failDesc.replace('{{RIVAL_TEAM}}', rivalTeam);
  }

  if (ev.id === 'directiva') {
    G._directivaUsed = true;
  }

  let evTitle = ev.title;
  let evDesc = ev.desc;
  
  if (G.nemesis) {
    const nStyle = `<span style="color:var(--danger);font-weight:bold">${G.nemesis.name}</span>`;
    const nemRegex = /tu n[éèe]mesis/gi;
    evTitle = evTitle.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(nemRegex, nStyle);
    evDesc = evDesc.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle)
                   .replace(/\{\{NEMESIS_CAT\}\}/g, G.nemesis.cat || 'otra categoría')
                   .replace(nemRegex, nStyle);
  }

  document.getElementById('ev-icon').textContent = ev.icon;
  document.getElementById('ev-title').innerHTML = evTitle;
  document.getElementById('ev-desc').innerHTML = evDesc;

  // Team Radio block
  const existingRadio = document.getElementById('ev-radio-block');
  if (existingRadio) existingRadio.remove();
  if (ev.radioMsg) {
    let radioMsg = ev.radioMsg.replace('{{PEER_NAME}}', G.peer ? G.peer.name : 'tu compañero');
    radioMsg = radioMsg.replace(/Piloto/g, G.name).replace(/PILOTO/g, G.name.toUpperCase());
    const radioBlock = document.createElement('div');
    radioBlock.id = 'ev-radio-block';
    radioBlock.innerHTML = `
      <div class="terminal-box success">
        <div style="font-size:10px;letter-spacing:2px;color:#22c55e;margin-bottom:6px;opacity:0.7">📻 TEAM RADIO ▬▬▬</div>
        <div id="ev-radio-text" style="line-height:1.5;min-height:1.2em"></div>
      </div>`;
    document.getElementById('ev-choices').insertAdjacentElement('beforebegin', radioBlock);
    typewriterRadio('ev-radio-text', radioMsg, 15);
  }

  const ch = document.getElementById('ev-choices');
  ch.innerHTML = '';
  ev.choices.forEach((c, index) => {
    const b = document.createElement('div');
    b.className = 'minigame-choice';

    // Compute stat-based delta or pureLuck resolution
    let resolvedDelta = c.delta || 0;
    let success = null;
    if (c.skillStat) {
      const statVal = G.stats[c.skillStat];
      const successChance = 0.25 + (statVal / 99) * 0.65;
      success = Math.random() < successChance;
      resolvedDelta = success ? c.skillBonus : c.skillFail;
    } else if (c.pureLuck) {
      success = Math.random() < c.baseBonus;
      resolvedDelta = success ? (c.skillBonus || 0) : (c.skillFail || 0);
    }

    let cText = c.text;
    if (G.nemesis) {
      const nStyle = `<span style="color:var(--danger);font-weight:bold">${G.nemesis.name}</span>`;
      cText = cText.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(/tu n[éèe]mesis/gi, nStyle);
    }

    const hintHtml = c.hint ? `<div style="font-size:12px;color:var(--accent);margin-top:4px">${c.hint}</div>` : '';
    b.innerHTML = `<h3>${cText}</h3>${hintHtml}`;

    b.onclick = () => {
      autocompleteRadio('ev-radio-text');
      let relChange = c.peerRelDelta || 0;
      if (success === false && c.peerRelFailDelta !== undefined) {
        relChange = c.peerRelFailDelta;
      }
      if (relChange && G.peer) {
        G.peer.relationship = clamp(G.peer.relationship + relChange, -100, 100);
        if (G.nemesis && G.peer.id === G.nemesis.id) G.peer.relationship = Math.min(G.peer.relationship, -100);
      }
      
      if (c.stat) {
        G.stats[c.stat] = clamp(G.stats[c.stat] + resolvedDelta, 1, G.potential);
      }
      
      // Handle base money cost (e.g. doctor)
      if (c.money) { G.money += c.money; G.totalMoney += Math.max(0, c.money); }
      // Handle conditional money for pureLuck outcomes
      if (c.pureLuck && success === true && c.successMoney) { G.money += c.successMoney; G.totalMoney += c.successMoney; }
      if (c.pureLuck && success === false && c.failMoney) { G.money += c.failMoney; G.totalMoney += Math.max(0, c.failMoney); }
      const resolvedMoney = c.money || (success === true && c.successMoney ? c.successMoney : 0) || (success === false && c.failMoney ? c.failMoney : 0);
      const deltaSign = resolvedDelta >= 0 ? '+' : '';
      const moneyText = resolvedMoney ? (resolvedMoney > 0 ? ` | +$${resolvedMoney.toLocaleString()}` : ` | -$${Math.abs(resolvedMoney).toLocaleString()}`) : '';
      const statLabelText = c.stat ? ` ${STAT_LABELS[c.stat]}` : '';
      const logText = `Evento: "${c.text}" ➔ ${deltaSign}${resolvedDelta}${statLabelText}${moneyText}`;

      // Pick narrative description
      let narrative = '';
      if (c.fixedDesc) {
        narrative = c.fixedDesc;
      } else if (success === true && c.successDesc) {
        narrative = c.successDesc;
      } else if (success === false && c.failDesc) {
        narrative = c.failDesc;
      }

      G._seasonEventLogs.push(logText);
      updateTopBar();
      
      if (c.nemesisSpark && !G.nemesis) {
        const catDrivers = G.aiRoster ? G.aiRoster.filter(d => d.cat === CATEGORIES[G.catIndex]) : [];
        if (catDrivers.length > 0) {
          catDrivers.sort((a,b) => b.skill - a.skill);
          addNemesisHeat(catDrivers[0], 100);
        }
      }

      if (G.nemesis && narrative) {
        const nStyle = `<span style="color:var(--danger);font-weight:bold">${G.nemesis.name}</span>`;
        narrative = narrative.replace(/\{\{NEMESIS_NAME\}\}/g, nStyle).replace(/tu n[éèe]mesis/gi, nStyle);
      }

      const outcomeIcon = resolvedDelta >= 0 ? '✅' : '💥';
      const statLine = `<div style="font-size:13px;color:var(--muted);margin-bottom:12px">${deltaSign}${resolvedDelta}${statLabelText}${moneyText}</div>`;
      const narrativeHtml = narrative
        ? `<div class="narrative-box" style="border-left-color: ${resolvedDelta >= 0 ? '#4ade80' : '#f87171'};">${narrative}</div>`
        : '';

      ch.innerHTML = `
        <div class="card result-card ${resolvedDelta >= 0 ? 'result-success' : 'result-fail'}" style="padding: 24px">
          <div style="font-size:32px;margin-bottom:8px;text-align:center">${outcomeIcon}</div>
          <div class="heading" style="font-size:18px;margin-bottom:4px;text-align:center">Resultado del evento</div>
          ${statLine}
          ${narrativeHtml}
          <button class="btn btn-primary" style="width:100%" onclick="processSeasonStep()">Continuar</button>
        </div>
      `;
    };
    ch.appendChild(b);
  });
  goto('screen-event');
}

// ═══════════════════════════════════════════════════════════
//  MINIGAME
// ═══════════════════════════════════════════════════════════
function showMinigame(forcedId = null) {
  let pool = MINIGAMES.filter(mg => {
    if (mg.id === 'midfield' && G.team && G.team.stars > 3) return false;
    if (mg.id === 'peer_ordenes') return G.peer && G.team && G.team.name === G.peer.team;
    if (mg.id === 'peer_brake_test') return G.peer && G.peer.relationship < -30;
    if (mg.id === 'peer_double_stack') return G.peer && G.catIndex === 5;
    if (mg.id === 'peer_turn_1') return G.peer && G.catIndex === 5 && G.team && G.team.stars >= 4;
    if (mg.id === 'peer_defense') return G.peer && G.catIndex === 5 && G.peer.relationship > 30 && G.team && G.team.stars >= 3;

    const canGiveWin = mg.choices.some(c => !c.noWinOnSuccess && !c.pureLuck || (c.pureLuck && !c.noWinOnSuccess));
    if (canGiveWin && G.catIndex === 5) {
      if (!G.team || G.team.stars < 3) return false;
    }
    return true;
  });
  if (pool.length === 0) {
    processSeasonStep();
    return;
  }
  let mg;
  if (forcedId) {
    mg = MINIGAMES.find(e => e.id === forcedId);
  }
  if (!mg) mg = randFrom(pool);
  document.getElementById('mg-icon').textContent = mg.icon;
  document.getElementById('mg-title').textContent = mg.title.replace('{{PEER_NAME}}', G.peer ? G.peer.name : 'tu compañero');
  document.getElementById('mg-desc').textContent = mg.desc.replace('{{PEER_NAME}}', G.peer ? G.peer.name : 'tu compañero');

  // Team Radio block
  const existingMgRadio = document.getElementById('mg-radio-block');
  if (existingMgRadio) existingMgRadio.remove();
  if (mg.radioMsg) {
    let radioMsg = mg.radioMsg.replace('{{PEER_NAME}}', G.peer ? G.peer.name : 'tu compañero');
    radioMsg = radioMsg.replace(/Piloto/g, G.name).replace(/PILOTO/g, G.name.toUpperCase());
    const radioBlock = document.createElement('div');
    radioBlock.id = 'mg-radio-block';
    radioBlock.innerHTML = `
      <div class="terminal-box success">
        <div style="font-size:10px;letter-spacing:2px;color:#22c55e;margin-bottom:6px;opacity:0.7">📻 TEAM RADIO ▬▬▬</div>
        <div id="mg-radio-text" style="line-height:1.5;min-height:1.2em"></div>
      </div>`;
    document.getElementById('mg-choices').insertAdjacentElement('beforebegin', radioBlock);
    typewriterRadio('mg-radio-text', radioMsg, 15);
  }

  // Remove any old stat hint
  const mgCard = document.querySelector('#screen-minigame .card');
  const existingHint = mgCard.querySelector('.stat-hint');
  if (existingHint) existingHint.remove();

  const ch = document.getElementById('mg-choices');
  ch.innerHTML = '';
  mg.choices.forEach((c, index) => {
    let successChance, pct, pctColor, skillText;

    if (c.pureLuck) {
      successChance = c.baseBonus;
      pct = Math.round(successChance * 100);
      pctColor = pct > 60 ? '#4ade80' : pct > 40 ? '#facc15' : '#f87171';
      skillText = `<span style="color:var(--accent)">🎲 Instinto / Suerte</span>`;
    } else {
      const statVal = G.stats[c.skillStat] || 50;
      successChance = clamp(c.baseBonus + (statVal / 99) * c.statBonus, 0.05, 0.95);
      pct = Math.round(successChance * 100);
      pctColor = pct > 60 ? '#4ade80' : pct > 40 ? '#facc15' : '#f87171';
      skillText = `<span style="color:var(--accent)">⚡ ${STAT_LABELS[c.skillStat]}: ${Math.round(statVal)}/99</span>`;
    }

    const b = document.createElement('div');
    b.className = 'minigame-choice';
    b.innerHTML = `
      <h3>${c.text}</h3>
      <p style="margin-bottom:6px">${c.desc}</p>
      <div style="font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        ${skillText}
        ${mg.hidePct ? '' : `<span style="color:var(--muted)">Éxito: <strong style="color:${pctColor}">${pct}%</strong></span>`}
      </div>`;
    b.onclick = () => {
      autocompleteRadio('mg-radio-text');
      G.storyFlags['minigame_' + mg.id] = index;
      
      // Inject immediate follow-up interview for team orders
      if (mg.id === 'peer_ordenes') {
        if (index === 0 && !G.storyFlags['interview_f1_team_orders_obey']) {
          G._seasonSteps.unshift('event:f1_team_orders_obey');
        } else if (index === 1 && !G.storyFlags['interview_f1_team_orders_ignore']) {
          G._seasonSteps.unshift('event:f1_team_orders_ignore');
        }
      }
      const success = Math.random() < successChance;
      let logText;
      const logName = c.pureLuck ? "Suerte" : STAT_LABELS[c.skillStat];
      const logStat = c.pureLuck ? "" : ` ${Math.round(G.stats[c.skillStat] || 50)}`;

      let repDelta = success ? (c.repDelta || 0) : (c.repFailDelta !== undefined ? c.repFailDelta : (c.repDelta || 0));
      let peerRelDelta = success ? (c.peerRelDelta || 0) : (c.peerRelFailDelta !== undefined ? c.peerRelFailDelta : (c.peerRelDelta || 0));
      let narrative = success ? (c.successDesc || '') : (c.failDesc || '');
      const isNeutralFail = !success && c.neutralFail;

      if (success && !c.noWinOnSuccess) {
        G.lastResult.wins = Math.min(G.lastResult.wins + 1, 99);
        G.wins++;
        G.lastResult.podiums = Math.max(G.lastResult.podiums, G.lastResult.wins);
        G.podiums++;
        if (c.onFailDnf) G._ach_survivor = true;
        if (c.pureLuck) {
          G._ach_luckyWin = true;
          G._ach_chaosCount = (G._ach_chaosCount || 0) + 1;
        }
        if (c.wasEscudero) G.wasEscudero = true;
        G._minigamePowerBonus = (G._minigamePowerBonus || 0) + 3;
        logText = `En pista: "${c.text}" [${logName}${logStat}${mg.hidePct ? '' : ' ➔ ' + pct + '%'}] ➔ ¡Éxito! +1 Victoria.`;
      } else if (success && c.noWinOnSuccess) {
        if (c.onFailDnf) G._ach_survivor = true;
        if (c.pureLuck) {
          G._ach_chaosCount = (G._ach_chaosCount || 0) + 1;
        }
        if (c.wasEscudero) G.wasEscudero = true;
        G._minigamePowerBonus = (G._minigamePowerBonus || 0) + 1;
        logText = `En pista: "${c.text}" [${logName}${logStat}${mg.hidePct ? '' : ' ➔ ' + pct + '%'}] ➔ ¡Completaste la carrera!`;
      } else if (isNeutralFail) {
        logText = `En pista: "${c.text}" [${logName}${logStat}${mg.hidePct ? '' : ' → ' + pct + '%'}] — Posición mantenida (Sin sobresaltos)`;
      } else {
        logText = `En pista: "${c.text}" [${logName}${logStat}${mg.hidePct ? '' : ' → ' + pct + '%'}] — Fallaste`;
        if (c.onFailDnf) {
          const didCrash = c.onFailDnf === true ? true : (Math.random() < c.onFailDnf);
          if (didCrash) {
            G.lastResult.dnfs++;
            G.dnfs++;
            logText += ' (Abandono)';
          } else {
            repDelta = Math.floor(repDelta / 4);
            peerRelDelta = Math.floor(peerRelDelta / 3);
            if (c.failSurviveDesc) narrative = c.failSurviveDesc;
          }
        }
      }
      
      if (repDelta) G.reputation += repDelta;
      if (c.moneyDelta) { G.money += c.moneyDelta; G.totalMoney += c.moneyDelta; }
      if (peerRelDelta && G.peer) {
        G.peer.relationship = clamp(G.peer.relationship + peerRelDelta, -100, 100);
        if (G.nemesis && G.peer.id === G.nemesis.id) G.peer.relationship = Math.min(G.peer.relationship, -100);
      }
      G._seasonEventLogs.push(logText);

      const narrativeHtml = narrative
        ? `<div class="narrative-box" style="border-left-color: ${success ? '#4ade80' : isNeutralFail ? '#9ca3af' : '#f87171'};">${narrative}</div>`
        : '';

      ch.innerHTML = `
        <div class="card result-card ${success ? 'result-success' : isNeutralFail ? 'result-neutral' : 'result-fail'}" style="padding: 24px">
          <div style="font-size:48px;margin-bottom:8px;text-align:center">${success ? (c.noWinOnSuccess ? '🏁' : '🏆') : isNeutralFail ? '😐' : '💥'}</div>
          <div class="heading" style="font-size:20px;margin-bottom:4px;text-align:center">${success ? '¡Éxito en pista!' : isNeutralFail ? 'Sin incidentes' : 'Mala suerte'}</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px;text-align:center">${logText}</div>
          ${narrativeHtml}
          <button class="btn btn-primary" style="width:100%" onclick="processSeasonStep()">Continuar</button>
        </div>
      `;
    };
    ch.appendChild(b);
  });
  goto('screen-minigame');
}

// ═══════════════════════════════════════════════════════════
//  INTERACTIVE MINIGAMES — Definitions
// ═══════════════════════════════════════════════════════════

const INTERACTIVE_MINIGAMES = [
  {
    id: 'img_traffic',
    label: '⚠️ Tráfico',
    icon: '⚠️',
    title: 'EVITA LOS AUTOS',
    situation: 'Hay tráfico lento en clasificación. Encontrá un hueco limpio para no arruinar tu vuelta.',
    instructions: 'Usá los botones para esquivar los autos lentos. Aguantá 10 segundos sin chocar.',
    minCat: 0, 
  },
  {
    id: 'img_strategy',
    label: '📊 Estrategia',
    icon: '📊',
    title: 'CÓDIGO DE LA ESTRATEGIA',
    situation: 'El equipo ideó una estrategia de paradas secreta para vencer a tus rivales, pero la encriptó en un código de 4 símbolos. Tenés que descifrarlo rápido antes de volver a pista.',
    instructions: 'Elegí 4 símbolos e intentá descifrar el código.<br>🟢 = Correcto<br>🟡 = Posición incorrecta<br>⚫ = Incorrecto<br>Tenés 5 intentos.',
    minCat: 1, 
  },
  {
    id: 'img_recon',
    label: '🎲 Reconocimiento',
    icon: '🎲',
    title: 'RECONOCIMIENTO DEL CIRCUITO',
    situation: 'Tu ingeniero te muestra rápidamente el mapa del circuito con las referencias clave (curvas, frenadas, marchas) y luego las oculta.',
    instructions: 'Memorizá la ubicación de cada referencia al inicio (3 segundos). Luego, encontrá todos los pares ocultos. Si te equivocás 5 veces, perdés el minijuego.',
    minCat: 0,
  },
  {
    id: 'img_reaction',
    label: '🚦 Largada',
    icon: '🚦',
    title: 'REFLEJOS EN LA LARGADA',
    situation: 'Esta por comenzar la carrera. Los 5 semáforos rojos se encienden uno por uno... y en cualquier momento se apagan. Tu reacción en ese instante puede ganarte o costarte la carrera.',
    instructions: 'Cuando los 5 semáforos se enciendan y luego se APAGUEN, presioná el botón grande lo más rápido posible. Si apretás antes que se apaguen, es FALSA LARGADA.',
    minCat: 1, 
  },
  {
    id: 'img_pitstop',
    label: '🔧 Pitstop',
    icon: '🔧',
    title: 'PARADA EN BOXES',
    situation: 'Tu ingeniero grita por la radio: "¡BOX BOX BOX!" Entrás al pit lane a toda velocidad. El equipo está listo, pero las cuatro ruedas necesitan cambiarse cuanto antes.',
    instructions: 'Tocá cada rueda del auto 3 veces para cambiar los neumaticos. Completá las 4 ruedas lo más rápido que puedas. El tiempo corre desde que empezás.',
    minCat: 1, // F4 onwards
  },
  {
    id: 'img_timing',
    label: '⚡ ERS',
    icon: '⚡',
    title: 'TIMING PERFECTO — ERS',
    situation: 'Estás pegado atrás de tu rival. Activás el ERS potencia extra. Si lo usás en el momento exacto, lo pasás. Si errás, perdés la oportunidad.',
    instructions: 'Una barra se mueve de izquierda a derecha rápido. Presioná el botón cuando el cursor esté dentro de la ZONA VERDE. Tenés que lograrlo 3 veces.',
    minCat: 4, // F2/F1 only
  },
  {
    id: 'img_sequence',
    label: '🧠 Trazado',
    icon: '🧠',
    title: 'MEMORIZAR EL TRAZADO',
    situation: 'Estás en el simulador del equipo, aprendiendo el circuito a ciegas. El ingeniero grita las curvas una por una. Tenés que recordarlas y reproducirlas en orden exacto.',
    instructions: 'Memorizá la secuencia de flechas que aparece en pantalla. Cuando desaparezca, repetí las flechas en el mismo orden tocando los botones. La secuencia crece con cada ronda.',
    minCat: 1,
  },
  {
    id: 'img_temp',
    label: '🌡️ Temperatura',
    icon: '🌡️',
    title: 'GESTIÓN DE TEMPERATURA',
    situation: 'Salio el Safety Car y paraste en boxes. Cuando salga, si tus neumáticos no están en temperatura, perdés agarre y quedas en desventaja.',
    instructions: 'La temperatura baja sola. Tocá el botón repetidamente para subirla. Mantenés el indicador dentro de la zona verde durante 6 segundos.',
    minCat: 1,
  },
  {
    id: 'img_defense',
    label: '🛡️ Defensa',
    icon: '🛡️',
    title: 'CERRAR LA PUERTA',
    situation: 'Es la última vuelta, estás peleando la posición y tu rival ataca tres veces buscando pasarte.',
    instructions: 'Cuando aparezca la flecha, tocá el botón correcto (⬅️ o ➡️) antes de que el medidor llegue al final. Sobrevivé los 3 intentos del rival.',
    minCat: 1,
  },
  {
    id: 'img_slipstream',
    label: '💨 Rebufo',
    icon: '💨',
    title: 'ATRAPAR EL REBUFO',
    situation: 'Llevas varias vueltas pegándote al rival. La única forma de pasarlo es usar su rebufo en la recta.',
    instructions: 'Tu auto debe mantenerse justo detrás del rival. Usá los botones ⬅️ y ➡️ para ajustar posición. Llenás la barra de rebufo al 100%.',
    minCat: 1,
  },
  {
    id: 'img_setup',
    label: '🔧 Setup',
    icon: '🔧',
    title: 'ENCONTRAR EL SETUP',
    situation: 'El auto tiene subviraje y bajo top speed. Tenés 3 intentos para encontrar el punto óptimo antes de clasificar.',
    instructions: 'Mové los 3 controles deslizables y presioná PROBAR. Necesitás llegar al 90% o más de efectividad.',
    minCat: 2,
  },
  {
    id: 'img_line',
    label: '✏️ Trazada',
    icon: '✏️',
    title: 'LA TRAZADA IDEAL',
    situation: 'Mónaco. Un error y el muro te espera. El simulador pide trazar la vuelta perfecta.',
    instructions: 'Arrastrá el cursor siguiendo exactamente la línea verde. Si te salís, vuelta invalidada. Tenes 5 segundos por curva. Completá las 3 sin errores.',
    minCat: 1,
  },
  {
    id: 'img_rain',
    label: '🌧️ Lluvia',
    icon: '🌧️',
    title: 'EL DILUVIO',
    situation: 'En plena carrera empieza a llover. Tu ingeniero grita: "¿Aguantamos en pista o entramos a poner Intermedias?" La decisión correcta puede ganarte posiciones. La equivocada, arruinarte la carrera.',
    instructions: 'El nivel de lluvia sube impredeciblemente. Presioná ENTRAR A BOXES en el momento justo: ni muy seco (destrozás los neumaticos) ni demasiado tarde (trompo). Tenés una sola oportunidad.',
    minCat: 1,
  },
  {
    id: 'img_tyres',
    label: '🛞 Neumáticos',
    icon: '🛞',
    title: 'CUIDAR EL CAUCHO',
    situation: 'Faltan 3 vueltas, tus neumaticos están al límite. El que viene atrás tiene gomas nuevas y acorta distancia. Si apretás a fondo, las gomas se funden. Si aflojás demasiado, te adelanta.',
    instructions: 'Presioná y soltá el botón de forma intermitente para gestionar el ritmo. Si el desgaste llega a 0, reventón. Si el rival te recorta toda la distancia, te pasa.',
    minCat: 1,
  },
  {
    id: 'img_reboot',
    label: '💻 Reboot',
    icon: '💻',
    title: 'FALLA ELECTRÓNICA',
    situation: 'En plena recta el volante se apaga. El auto pierde potencia. Tu ingeniero grita una secuencia de botones para reiniciar el MGU-K antes de llegar a la curva.',
    instructions: 'Memorizá la secuencia de 5 botones de colores que aparece en pantalla y repetila en orden exacto. Tenés 7 segundos desde que empieza la cuenta. Un solo error y el motor muere.',
    minCat: 4,
  },
  {
    id: 'img_comeback',
    label: '🚀 A Remontar',
    icon: '🚀',
    title: 'BUSCAR EL HUECO',
    situation: 'Mala clasificación. Estás en el fondo y tenés que adelantar a 5 autos lentos rápidamente antes de perder la estela de los líderes.',
    instructions: 'Deslizá el dedo o el mouse de lado a lado para moverte libremente. ¡Los rezagados se moverán intentando cerrarte el paso! Si los tocás, rompés el alerón. Pasá a los 5 para ganar.',
    minCat: 1,
  },
];

// ── Show Interactive Minigame Intro ──
function showInteractiveMinigame(forcedId = null) {
  // Filter by category
  const eligible = INTERACTIVE_MINIGAMES.filter(mg => {
    if (G.minigameCounts && G.minigameCounts[mg.id] >= 2) return false;
    if (G.minigameLastYearPlayed && G.minigameLastYearPlayed[mg.id] >= G.year - 1) return false;
    if (mg.requireAcademy && !G.academy) return false;
    if (G.catIndex < mg.minCat) return false;
    const winGames = ['img_reaction', 'img_pitstop', 'img_timing', 'img_defense', 'img_slipstream', 'img_strategy', 'img_comeback'];
    if (winGames.includes(mg.id) && (G.team.stars || 0) < 3) return false;
    if (mg.id === 'img_rain') return false; // temporarily disabled
    return true;
  });
  if (eligible.length === 0) { processSeasonStep(); return; }

  let mg = null;
  if (forcedId) mg = INTERACTIVE_MINIGAMES.find(m => m.id === forcedId);
  if (!mg) mg = randFrom(eligible);

  // Registrar que este minijuego salió
  if (!G.minigameCounts) G.minigameCounts = {};
  if (!G.minigameLastYearPlayed) G.minigameLastYearPlayed = {};
  G.minigameCounts[mg.id] = (G.minigameCounts[mg.id] || 0) + 1;
  G.minigameLastYearPlayed[mg.id] = G.year;

  document.getElementById('img-intro-label').textContent = mg.label;
  document.getElementById('img-intro-icon').textContent = mg.icon;
  document.getElementById('img-intro-title').textContent = mg.title;
  document.getElementById('img-intro-situation').textContent = mg.situation;
  document.getElementById('img-intro-instructions').textContent = mg.instructions;

  const btn = document.getElementById('img-intro-btn');
  btn.onclick = () => {
    goto('screen-img-play');
    document.getElementById('img-play-label').textContent = mg.label;
    // Launch the specific minigame
    switch (mg.id) {
      case 'img_traffic':     startTrafficGame();     break;
      case 'img_strategy':    startStrategyGame();    break;
      case 'img_recon':       startReconGame();       break;
      case 'img_reaction':    startReactionGame();    break;
      case 'img_pitstop':     startPitstopGame();     break;
      case 'img_timing':      startTimingGame();      break;
      case 'img_sequence':    startSequenceGame();    break;
      case 'img_temp':        startTempGame();        break;
      case 'img_defense':     startDefenseGame();     break;
      case 'img_slipstream':  startSlipstreamGame();  break;
      case 'img_setup':       startSetupGame();       break;
      case 'img_line':        startLineGame();        break;
      case 'img_rain':        startRainGame();        break;
      case 'img_tyres':       startTyresGame();       break;
      case 'img_reboot':      startRebootGame();      break;
      case 'img_comeback':    startComebackGame();    break;
    }
  };
  goto('screen-img-intro');
}

// ── Common: Show Result ──
function showIMGResult(success, title, detail, narrative, givesWin = true) {
  const area = document.getElementById('img-game-area');
  const icon = success ? (givesWin ? '🏆' : '✅') : '💥';
  const color = success ? '#4ade80' : '#f87171';
  area.innerHTML = `
    <div class="card card-center">
      <div style="font-size:56px;margin-bottom:12px">${icon}</div>
      <div class="heading" style="font-size:22px;color:${color};margin-bottom:8px">${title}</div>
      <div class="sub" style="margin-bottom:14px">${detail}</div>
      ${narrative ? `<div class="narrative-box" style="border-left-color: ${color};">${narrative}</div>` : ''}
      <button class="btn btn-primary" onclick="processSeasonStep()">CONTINUAR</button>
    </div>
  `;

  if (success) {
    G._minigamesWon = (G._minigamesWon || 0) + 1;
    if (givesWin) {
      G.lastResult.wins = Math.min((G.lastResult.wins || 0) + 1, 99);
      G.wins++;
      G.lastResult.podiums = Math.max(G.lastResult.podiums || 0, G.lastResult.wins);
      G.podiums++;
      // +3 de poder para la temporada
      G._minigamePowerBonus = (G._minigamePowerBonus || 0) + 3;
      G._seasonEventLogs.push(`🏆 Minijuego interactivo: ¡Éxito! +1 Victoria`);
    } else {
      // +1 de poder para la temporada
      G._minigamePowerBonus = (G._minigamePowerBonus || 0) + 1;
      G._seasonEventLogs.push(`✅ Minijuego interactivo: ¡Éxito!`);
    }
  } else {
    G._seasonEventLogs.push(`💥 Minijuego interactivo: Fallaste`);
  }
}

// 📊
//  STRATEGY - Mastermind
// 📊
// 🚦
//  TRAFFIC - Esquivar autos
// 🚦
function startTrafficGame() {
  const area = document.getElementById('img-game-area');
  
  area.innerHTML = `
    <div style="font-size:36px;margin-bottom:6px">🚦</div>
    <div class="heading" style="font-size:20px;margin-bottom:4px">TRÁFICO LENTO</div>
    <div class="label" style="color:var(--muted);margin-bottom:16px" id="img-traffic-timer">Quedan 10.0s</div>
    
    <div id="img-traffic-box" style="position:relative; width:240px; height:300px; background:#1a1c23; border:2px solid #363a45; border-radius:12px; margin: 0 auto 24px; overflow:hidden;">
      <!-- Lane dividers -->
      <div style="position:absolute; width:2px; height:300px; left:80px; top:0; background:rgba(255,255,255,0.1); border-left: 2px dashed rgba(255,255,255,0.2);"></div>
      <div style="position:absolute; width:2px; height:300px; left:160px; top:0; background:rgba(255,255,255,0.1); border-left: 2px dashed rgba(255,255,255,0.2);"></div>
      
      <!-- Player -->
      <div id="img-traffic-player" style="position:absolute; width:40px; height:40px; font-size:32px; left:100px; top:250px; display:flex; align-items:center; justify-content:center; transition: left 0.1s ease; transform: rotate(90deg);">🏎️</div>
    </div>

    <div style="display:flex; gap:12px; justify-content:center;">
      <button class="btn btn-secondary" style="font-size:24px; padding: 12px 24px;" onclick="window._imgTrafficMove(0)">⬅️</button>
      <button class="btn btn-secondary" style="font-size:24px; padding: 12px 24px;" onclick="window._imgTrafficMove(1)">⏺️</button>
      <button class="btn btn-secondary" style="font-size:24px; padding: 12px 24px;" onclick="window._imgTrafficMove(2)">➡️</button>
    </div>
  `;
  
  let playerLane = 1;
  let done = false;
  const pEl = document.getElementById('img-traffic-player');
  
  window._imgTrafficMove = (lane) => {
    if (done) return;
    playerLane = lane;
    pEl.style.left = (lane * 80 + 20) + 'px';
  };

  const keyHandler = (e) => {
    if (done) return;
    if (e.key === 'ArrowLeft' && playerLane > 0) window._imgTrafficMove(playerLane - 1);
    if (e.key === 'ArrowRight' && playerLane < 2) window._imgTrafficMove(playerLane + 1);
  };
  document.addEventListener('keydown', keyHandler);

  let enemies = [];
  const box = document.getElementById('img-traffic-box');
  let startTime = Date.now();
  let lastSpawn = startTime;
  let animId;

  const cleanup = () => {
    done = true;
    document.removeEventListener('keydown', keyHandler);
    cancelAnimationFrame(animId);
  };

  const tick = () => {
    if (done) return;
    const now = Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(0, 10000 - elapsed);
    
    document.getElementById('img-traffic-timer').textContent = `Quedan ${(remaining/1000).toFixed(1)}s`;

    if (remaining === 0) {
      cleanup();
      setTimeout(() => {
        let statGains = '';
        if (G.stats) {
          G.stats.quali = clamp(G.stats.quali + 1, 0, 99);
          statGains = 'Clasificación +1';
        }
        showIMGResult(true, '¡Hueco Encontrado!', `Esquivaste todo el tráfico. (${statGains})`, 'Conseguiste una vuelta limpia y tu tiempo fue inmejorable.', false);
      }, 300);
      return;
    }

    if (now - lastSpawn > 1100) {
      lastSpawn = now;
      const numCars = Math.random() < 0.4 ? 2 : 1;
      const shuffledLanes = shuffle([0, 1, 2]);
      for (let i = 0; i < numCars; i++) {
        const lane = shuffledLanes[i];
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.fontSize = '32px';
        el.style.left = (lane * 80 + 20) + 'px';
        el.style.top = '-40px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.transform = 'rotate(-90deg)';
        el.textContent = '🚙'; 
        box.appendChild(el);
        enemies.push({ el, lane, y: -40 });
      }
    }

    const speed = 4; 
    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      en.y += speed;
      en.el.style.top = en.y + 'px';
      
      if (en.lane === playerLane && en.y > 210 && en.y < 290) {
        cleanup();
        en.el.style.transform = 'none';
        pEl.style.transform = 'none';
        en.el.textContent = '💥';
        pEl.textContent = '💥';
        setTimeout(() => {
          showIMGResult(false, '¡Choque!', 'Te llevaste puesto a un rezagado.', 'El auto quedó dañado y tuviste que abortar la vuelta rápida.', false);
        }, 800);
        return;
      }

      if (en.y > 300) {
        en.el.remove();
        enemies.splice(i, 1);
      }
    }

    animId = requestAnimationFrame(tick);
  };

  animId = requestAnimationFrame(tick);
}

function startStrategyGame() {
  const area = document.getElementById('img-game-area');
  const SYMBOLS = ['🛞', '⚡', '⛽', '🌧️', '🏎️', '🔧'];
  const MAX_ATTEMPTS = 5;
  const CODE_LEN = 4;
  
  const secret = [];
  for (let i = 0; i < CODE_LEN; i++) secret.push(randFrom(SYMBOLS));

  let attempts = 0;
  let currentGuess = [];
  let pastGuesses = [];
  let done = false;

  const render = () => {
    let rowsHtml = '';
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const isActive = (i === attempts && !done);
      const isPast = i < attempts;
      
      let slots = '';
      for (let j = 0; j < CODE_LEN; j++) {
        const val = isPast ? pastGuesses[i].guess[j] : (isActive && j < currentGuess.length ? currentGuess[j] : '');
        let bg = '#252830';
        let border = isActive ? '#e8c84a' : '#363a45';
        
        if (isPast) {
          const fb = pastGuesses[i].feedback[j];
          if (fb === '🟢') { bg = '#10b981'; border = '#047857'; }
          else if (fb === '🟡') { bg = '#f59e0b'; border = '#b45309'; }
          else if (fb === '⚫') { bg = '#1e2025'; border = '#111827'; }
        }
        
        slots += `<div style="width:64px;height:64px;border-radius:12px;background:${bg};border:3px solid ${border};display:flex;align-items:center;justify-content:center;font-size:36px;transition:all 0.3s;">${val}</div>`;
      }

      rowsHtml += `
        <div style="display:flex; gap: 12px; align-items:center; justify-content:center; margin-bottom: 12px; opacity: ${isPast || isActive ? 1 : 0.4}">
          ${slots}
        </div>
      `;
    }

    let buttonsHtml = '';
    SYMBOLS.forEach(sym => {
      buttonsHtml += `<button class="btn btn-secondary img-strat-sym" data-sym="${sym}" style="font-size:32px; padding: 0; width:72px; height:64px; display:flex; align-items:center; justify-content:center; border-radius:12px;">${sym}</button>`;
    });

    area.innerHTML = `
      <div style="font-size:42px;margin-bottom:6px">📊</div>
      <div class="heading" style="font-size:24px;margin-bottom:4px">CÓDIGO DE LA ESTRATEGIA</div>
      <div class="label" style="color:var(--muted);margin-bottom:24px">Intento ${Math.min(attempts + 1, MAX_ATTEMPTS)} de ${MAX_ATTEMPTS}</div>
      
      <div style="margin-bottom: 32px;">
        ${rowsHtml}
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; max-width: 260px; margin: 0 auto 24px;">
        ${buttonsHtml}
      </div>
      
      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn btn-secondary" id="img-strat-undo" ${currentGuess.length === 0 || done ? 'disabled' : ''}>🔙 Borrar</button>
        <button class="btn btn-primary" id="img-strat-submit" ${currentGuess.length < CODE_LEN || done ? 'disabled' : ''}>Validar</button>
      </div>
    `;

    document.querySelectorAll('.img-strat-sym').forEach(btn => {
      btn.onclick = () => {
        if (done || currentGuess.length >= CODE_LEN) return;
        currentGuess.push(btn.dataset.sym);
        render();
      };
    });
    
    const undoBtn = document.getElementById('img-strat-undo');
    if (undoBtn) undoBtn.onclick = () => {
      if (done || currentGuess.length === 0) return;
      currentGuess.pop();
      render();
    };
    
    const submitBtn = document.getElementById('img-strat-submit');
    if (submitBtn) submitBtn.onclick = () => {
      if (done || currentGuess.length < CODE_LEN) return;
      
      const feedback = new Array(CODE_LEN).fill('⚫');
      const secCopy = [...secret];
      const guessCopy = [...currentGuess];
      
      // Exact matches
      for (let i = 0; i < CODE_LEN; i++) {
        if (guessCopy[i] === secCopy[i]) {
          feedback[i] = '🟢';
          secCopy[i] = null;
          guessCopy[i] = null; // Mark as handled
        }
      }
      
      // Wrong positions
      for (let i = 0; i < CODE_LEN; i++) {
        if (guessCopy[i] !== null) {
          const idx = secCopy.indexOf(guessCopy[i]);
          if (idx !== -1) {
            feedback[i] = '🟡';
            secCopy[idx] = null;
          }
        }
      }

      pastGuesses.push({ guess: [...currentGuess], feedback });
      const isWin = feedback.every(f => f === '🟢');
      
      attempts++;
      currentGuess = [];
      render();

      if (isWin) {
        done = true;
        setTimeout(() => {
          showIMGResult(true, '¡Código Descifrado!', 'Estrategia alternativa activada', 'El plan funcionó a la perfección y tomaste la punta de la carrera por sorpresa.', true);
        }, 600);
      } else if (attempts >= MAX_ATTEMPTS) {
        done = true;
        setTimeout(() => {
          showIMGResult(false, 'Código Incorrecto', 'El equipo se confundió en los boxes', `La estrategia fue un desastre. El código era ${secret.join('')}`, false);
        }, 600);
      }
    };
  };

  render();
}

// ══════════════════════════════════════════════════════════// 🧠
//  0. RECON - Memotest del circuito
// 🎲
function startReconGame() {
  const area = document.getElementById('img-game-area');
  const ICONS = ['⤴️', '⚠️', '⚙️', '⚡', '🏎️', '🏁', '🛞', '🟢'];
  let deck = [...ICONS, ...ICONS];
  deck = shuffle(deck);

  let firstSelection = null;
  let secondSelection = null;
  let matches = 0;
  let mistakes = 0;
  const MAX_MISTAKES = 5;
  let locked = true; 
  let done = false;

  area.innerHTML = `
    <style>
      .recon-card {
        aspect-ratio: 1;
        background: #252830;
        border: 2px solid #363a45;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        cursor: pointer;
        user-select: none;
        transition: transform 0.3s, background 0.3s;
      }
      .recon-card.revealed {
        background: #28506B;
        transform: rotateY(180deg);
      }
      .recon-card.matched {
        background: #10b981;
        border-color: #047857;
        transform: rotateY(180deg);
      }
      .recon-card .icon {
        display: none;
      }
      .recon-card.revealed .icon, .recon-card.matched .icon {
        display: block;
        transform: rotateY(180deg);
      }
    </style>
    <div style="font-size:36px;margin-bottom:6px">🎲</div>
    <div class="heading" style="font-size:20px;margin-bottom:4px">RECONOCIMIENTO DEL CIRCUITO</div>
    <div class="label" style="color:var(--muted);margin-bottom:16px" id="img-recon-msg">Memorizá las posiciones...</div>
    <div style="font-size:20px; font-weight:bold; color:var(--accent); margin-bottom:12px" id="img-recon-mistakes">Errores: 0 / 5</div>
    
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; max-width: 320px; margin: 0 auto; perspective: 1000px;" id="img-recon-grid">
    </div>
  `;

  const grid = document.getElementById('img-recon-grid');
  
  const cards = [];
  deck.forEach((icon, i) => {
    const card = document.createElement('div');
    card.className = 'recon-card revealed';
    card.innerHTML = `<div class="icon">${icon}</div>`;
    card.dataset.icon = icon;
    card.dataset.index = i;
    
    card.onclick = () => handleCardClick(card);
    cards.push(card);
    grid.appendChild(card);
  });

  setTimeout(() => {
    if (done) return;
    cards.forEach(c => c.className = 'recon-card');
    locked = false;
    const msg = document.getElementById('img-recon-msg');
    if(msg) msg.textContent = '¡Encontrá los pares!';
  }, 3000);

  const handleCardClick = (card) => {
    if (locked || done) return;
    if (card.classList.contains('revealed') || card.classList.contains('matched')) return;

    card.classList.add('revealed');

    if (!firstSelection) {
      firstSelection = card;
    } else {
      secondSelection = card;
      locked = true;

      if (firstSelection.dataset.icon === secondSelection.dataset.icon) {
        setTimeout(() => {
          if (done) return;
          firstSelection.classList.remove('revealed');
          firstSelection.classList.add('matched');
          secondSelection.classList.remove('revealed');
          secondSelection.classList.add('matched');
          matches++;
          firstSelection = null;
          secondSelection = null;
          locked = false;
          
          if (matches === 8) {
            endGame(true);
          }
        }, 300);
      } else {
        mistakes++;
        const el = document.getElementById('img-recon-mistakes');
        if (el) el.textContent = `Errores: ${mistakes} / ${MAX_MISTAKES}`;
        
        setTimeout(() => {
          if (done) return;
          firstSelection.classList.remove('revealed');
          secondSelection.classList.remove('revealed');
          firstSelection = null;
          secondSelection = null;
          
          if (mistakes >= MAX_MISTAKES) {
            endGame(false);
          } else {
            locked = false;
          }
        }, 700);
      }
    }
  };

  const endGame = (win) => {
    done = true;
    locked = true;
    
    if (win) {
      G._minigamesWon = (G._minigamesWon || 0) + 1;
      let statGains = '';
      if (Math.random() < 0.5) {
        G.stats.speed = clamp(G.stats.speed + 1, 0, 99);
        statGains = 'Velocidad +1';
      } else {
        G.stats.quali = clamp(G.stats.quali + 1, 0, 99);
        statGains = 'Clasificación +1';
      }
      G._minigamePowerBonus = (G._minigamePowerBonus || 0) + 1;
      showIMGResult(true, '¡Memoria perfecta!', `Reconociste todo el circuito. (${statGains})`, 'Te sentís con mucha confianza y encontrás el límite de la pista más rápido que el resto.', false);
    } else {
      showIMGResult(false, 'Demasiados errores', 'Se te mezclaron las referencias.', 'Saliste a la pista sin tener claros los puntos de frenada y te costó encontrar el ritmo en las primeras vueltas.', false);
    }
  };
}

// ══════════════════════════════════════════════════════════
//  1. REACTION — Semáforos
// ══════════════════════════════════════════════════════════
function startReactionGame() {
  const area = document.getElementById('img-game-area');
  area.innerHTML = `
    <div class="img-lights-row">
      <div class="img-light" id="rl0"></div>
      <div class="img-light" id="rl1"></div>
      <div class="img-light" id="rl2"></div>
      <div class="img-light" id="rl3"></div>
      <div class="img-light" id="rl4"></div>
    </div>
    <div style="margin-bottom:20px">
      <div class="label" style="color:var(--muted);margin-bottom:4px" id="react-status">Esperá los semáforos...</div>
    </div>
    <button id="img-react-btn">LARGADA</button>
  `;

  const btn = document.getElementById('img-react-btn');
  let phase = 'waiting'; // waiting | lights_on | go | done
  let lightOnTime = null;
  let falseStart = false;
  let lightTimers = [];

  // Light on sequence: 0.6s between each
  for (let i = 0; i < 5; i++) {
    const t = setTimeout(() => {
      document.getElementById('rl' + i).classList.add('on');
    }, 800 + i * 600);
    lightTimers.push(t);
  }

  // Lights off after a random delay (3.5s to 5.5s from start)
  const offDelay = 800 + 4 * 600 + 800 + Math.random() * 2000;
  const offTimer = setTimeout(() => {
    if (phase === 'done') return;
    phase = 'go';
    lightOnTime = Date.now();
    for (let i = 0; i < 5; i++) {
      const el = document.getElementById('rl' + i);
      if (el) { el.classList.remove('on'); el.classList.add('green'); }
    }
    document.getElementById('react-status').textContent = '¡¡AHORA!!';
    btn.classList.add('active-green');
    btn.textContent = 'LARGADA';

    // Auto-fail if too slow (2s window)
    setTimeout(() => {
      if (phase === 'go') {
        phase = 'done';
        btn.disabled = true;
        showIMGResult(false, '¡Reacción lenta!',
          'Tu reacción superó los 2 segundos. Perdiste varias posiciones en la salida.',
          'El pelotón te cerró y quedaste atrapado en el tráfico del inicio.');
      }
    }, 2000);
  }, offDelay);

  lightTimers.push(offTimer);

  btn.onclick = () => {
    if (phase === 'done') return;
    if (phase !== 'go') {
      // FALSE START
      phase = 'done';
      lightTimers.forEach(clearTimeout);
      btn.disabled = true;
      for (let i = 0; i < 5; i++) {
        const el = document.getElementById('rl' + i);
        if (el) el.classList.remove('on');
      }
      showIMGResult(false, '¡Falsa Largada!',
        'Apretaste antes que se apagaran los semáforos. Tenes una penalizacion de stop-and-go.',
        'El comisario de pista levantó la bandera negra y blanca. Pasás por el pitlane y carrera arruinada.');
      return;
    }
    // Valid press
    phase = 'done';
    btn.disabled = true;
    const reaction = Date.now() - lightOnTime;
    const ms = reaction;
    let success = false, title, detail, narrative;
    if (ms < 200) {
      title = '¡REACCIÓN PERFECTA!'; detail = `${ms}ms — Nivel de campeón`;
      narrative = 'Salida limpia y explosiva. Para la segunda curva ya estás dos posiciones arriba.';
      success = true;
    } else if (ms < 300) {
      title = '¡Buena largada!'; detail = `${ms}ms — Muy rápido`;
      narrative = 'Salida limpia. Mantenés tu posición y el auto sale perfectamente.';
      success = true;
    } else if (ms < 500) {
      title = 'Largada aceptable'; detail = `${ms}ms — Normal`;
      narrative = 'Salida decente, nada especial. El pelotón sale parejo.';
      success = false;
    } else {
      title = 'Largada lenta'; detail = `${ms}ms — Tarde`;
      narrative = 'Perdiste dos posiciones en la salida. El auto del lado te tapó completamente.';
      success = false;
    }
    showIMGResult(success, title, detail, narrative, success ? false : true);
  };
}

// ══════════════════════════════════════════════════════════
//  2. PITSTOP — Click wheels
// ══════════════════════════════════════════════════════════
function startPitstopGame() {
  const area = document.getElementById('img-game-area');
  area.innerHTML = `
    <div id="img-pitstop-timer" style="margin-bottom:8px">0.000s</div>
    <div class="label" style="margin-bottom:16px;color:var(--muted)" id="ps-status">Tocá cada rueda 3 veces</div>
    <div class="img-car-top">
      <div class="img-car-body"></div>
      <div class="img-car-cockpit"></div>
      <!-- FL, FR, RL, RR -->
      <div class="img-wheel-btn active" id="ps-fl" style="top:20px;left:10px">FL<br>0/3</div>
      <div class="img-wheel-btn" id="ps-fr" style="top:20px;right:10px">FR<br>0/3</div>
      <div class="img-wheel-btn" id="ps-rl" style="bottom:20px;left:10px">RL<br>0/3</div>
      <div class="img-wheel-btn" id="ps-rr" style="bottom:20px;right:10px">RR<br>0/3</div>
    </div>
  `;

  const wheels = [
    { id: 'ps-fl', label: 'FL', clicks: 0 },
    { id: 'ps-fr', label: 'FR', clicks: 0 },
    { id: 'ps-rl', label: 'RL', clicks: 0 },
    { id: 'ps-rr', label: 'RR', clicks: 0 },
  ];
  const NEEDED = 3;
  let currentWheel = 0;
  let started = false;
  let startTime = null;
  let timerInterval = null;

  const timerEl = document.getElementById('img-pitstop-timer');
  const statusEl = document.getElementById('ps-status');

  const updateTimer = () => {
    if (!startTime) return;
    const elapsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = elapsed.toFixed(3) + 's';
  };

  wheels.forEach((w, wi) => {
    const el = document.getElementById(w.id);
    el.onclick = () => {
      if (wi !== currentWheel) return; // must do in order
      if (!started) {
        started = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 33);
      }
      w.clicks++;
      el.textContent = w.label + '\n' + w.clicks + '/3';
      if (w.clicks >= NEEDED) {
        el.classList.remove('active');
        el.classList.add('done');
        el.textContent = '✓';
        currentWheel++;
        if (currentWheel < wheels.length) {
          document.getElementById(wheels[currentWheel].id).classList.add('active');
          statusEl.textContent = `Rueda ${wheels[currentWheel].label} — 0/3`;
        } else {
          // Done!
          clearInterval(timerInterval);
          const elapsed = (Date.now() - startTime) / 1000;
          timerEl.textContent = elapsed.toFixed(3) + 's';
          const success = elapsed <= 3.0;
          let title, detail, narrative;
          if (elapsed < 2.0) {
            title = '¡PITSTOP RÉCORD!'; detail = `${elapsed.toFixed(3)}s — Impresionante`;
            narrative = 'El equipo te aplaude. Ese pitstop se transmitirá en todos los highlights del fin de semana.';
          } else if (elapsed < 3.0) {
            title = 'Buen pitstop'; detail = `${elapsed.toFixed(3)}s — Eficiente`;
            narrative = 'Salís limpio del pit lane y recuperás tu posición sin problemas.';
          } else if (elapsed < 4.5) {
            title = 'Pitstop lento'; detail = `${elapsed.toFixed(3)}s — Mejorable`;
            narrative = 'La demora en boxes te costó dos posiciones. Salís al tráfico de mitad de parrilla.';
          } else {
            title = 'Pitstop desastroso'; detail = `${elapsed.toFixed(3)}s — Muy lento`;
            narrative = 'Una rueda no calzó bien. Perdiste varias posiciones y la carrera está cuesta arriba.';
          }
          setTimeout(() => showIMGResult(success, title, detail, narrative), 400);
        }
      } else {
        statusEl.textContent = `Rueda ${w.label} — ${w.clicks}/3`;
      }
    };
  });
}

// ══════════════════════════════════════════════════════════
//  3. TIMING BAR — ERS
// ══════════════════════════════════════════════════════════
function startTimingGame() {
  const area = document.getElementById('img-game-area');

  const ATTEMPTS = 3;
  let attempt = 0;
  let hits = 0;
  let animFrame = null;
  let cursorPos = 0;
  let direction = 1;
  const SPEED = 1.2; // % per frame at 60fps
  // Zone: centered, width 14%
  const ZONE_START = 43;
  const ZONE_END = 57;

  const render = () => {
    area.innerHTML = `
      <div style="font-size:36px;margin-bottom:8px">⚡</div>
      <div class="heading" style="font-size:20px;margin-bottom:4px">ERS — ATACAR</div>
      <div class="label" style="color:var(--muted);margin-bottom:20px">Intento ${attempt + 1} de ${ATTEMPTS}</div>
      <div id="img-timing-bar-wrap">
        <div id="img-timing-zone" style="left:${ZONE_START}%;width:${ZONE_END - ZONE_START}%"></div>
        <div id="img-timing-cursor" style="left:${cursorPos}%"></div>
      </div>
      <button id="img-timing-press-btn">¡ AHORA ! ( TOQUE / CLICK )</button>
      <div class="label" style="margin-top:16px;color:var(--muted)">Aciertos: ${hits}/${ATTEMPTS}</div>
    `;

    document.getElementById('img-timing-press-btn').onclick = onPress;
    startCursor();
  };

  const startCursor = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    const loop = () => {
      cursorPos += SPEED * direction;
      if (cursorPos >= 100) { cursorPos = 100; direction = -1; }
      if (cursorPos <= 0)   { cursorPos = 0;   direction = 1; }
      const el = document.getElementById('img-timing-cursor');
      if (el) {
        el.style.left = cursorPos + '%';
        animFrame = requestAnimationFrame(loop);
      }
    };
    animFrame = requestAnimationFrame(loop);
  };

  const onPress = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    const inZone = cursorPos >= ZONE_START && cursorPos <= ZONE_END;
    if (inZone) hits++;
    attempt++;

    const feedbackColor = inZone ? '#4ade80' : '#f87171';
    const feedbackText = inZone ? '✓ ¡Perfecto!' : '✗ Fallaste';
    const cursor = document.getElementById('img-timing-cursor');
    if (cursor) { cursor.style.background = feedbackColor; cursor.style.boxShadow = '0 0 16px ' + feedbackColor; }

    setTimeout(() => {
      if (attempt >= ATTEMPTS || !inZone) {
        const success = hits === 3;
        let title, detail, narrative;
        if (success) {
          title = '¡ERS Perfecto!'; detail = '3/3 — Timing impecable';
          narrative = 'Activaste el ERS en el momento exacto las tres veces. Pasaste a tu rival como si estuviera parado.';
        } else {
          title = '¡Error de Timing!'; detail = 'Te anticipaste o tardaste de más';
          narrative = 'Activaste el ERS en una zona muy complicada para adelantar, desperdiciaste la energía y perdiste la oportunidad de pasar al rival.';
        }
        showIMGResult(success, title, detail, narrative);
      } else {
        render();
      }
    }, 500);
  };

  render();
}

// ══════════════════════════════════════════════════════════
//  4. SEQUENCE — Memorizar trazado
// ══════════════════════════════════════════════════════════
function startSequenceGame() {
  const area = document.getElementById('img-game-area');
  const ARROWS = ['⬆️','⬇️','⬅️','➡️'];
  const KEYS = ['up','down','left','right'];
  const MAX_ROUNDS = 5;
  let sequence = [];
  let playerIndex = 0;
  let round = 0;
  let score = 0;
  let showing = false;
  let done = false;

  const addToSequence = () => {
    sequence.push(Math.floor(Math.random() * 4));
  };

  const showSequence = () => {
    showing = true;
    playerIndex = 0;
    const display = document.getElementById('img-seq-display');
    if (!display) return;
    display.innerHTML = '';

    let i = 0;
    const showNext = () => {
      if (i >= sequence.length) {
        showing = false;
        display.innerHTML = '❔';
        document.getElementById('img-seq-status').textContent = '¡Tu turno! Repetí la secuencia';
        enableButtons(true);
        return;
      }
      display.innerHTML = '';
      const span = document.createElement('span');
      span.className = 'img-seq-arrow-shown';
      span.textContent = ARROWS[sequence[i]];
      display.appendChild(span);
      i++;
      setTimeout(showNext, 650);
    };
    setTimeout(showNext, 400);
  };

  const enableButtons = (en) => {
    KEYS.forEach(k => {
      const btn = document.getElementById('img-seq-' + k);
      if (btn) btn.style.opacity = en ? '1' : '0.4';
    });
  };

  const renderUI = () => {
    area.innerHTML = `
      <div style="font-size:36px;margin-bottom:6px">🧠</div>
      <div class="heading" style="font-size:20px;margin-bottom:4px">MEMORIZAR TRAZADO</div>
      <div class="label" style="color:var(--muted);margin-bottom:16px">Ronda ${round + 1} de ${MAX_ROUNDS}</div>
      <div class="img-seq-display" id="img-seq-display">
        <span style="color:var(--muted);font-size:14px">Memorizá...</span>
      </div>
      <div class="label" style="color:var(--accent);margin-bottom:14px" id="img-seq-status">Observá la secuencia</div>
      <div class="img-seq-btns">
        <div class="img-seq-btn" id="img-seq-up" style="opacity:0.4">⬆️</div>
        <div class="img-seq-btn" id="img-seq-down" style="opacity:0.4">⬇️</div>
        <div class="img-seq-btn" id="img-seq-left" style="opacity:0.4">⬅️</div>
        <div class="img-seq-btn" id="img-seq-right" style="opacity:0.4">➡️</div>
      </div>
      <div class="label" style="color:var(--muted)">Puntaje: ${score}/${MAX_ROUNDS}</div>
    `;

    KEYS.forEach((k, ki) => {
      document.getElementById('img-seq-' + k).onclick = () => onInput(ki);
    });
  };

  const onInput = (idx) => {
    if (showing || done) return;
    const el = document.getElementById('img-seq-' + KEYS[idx]);
    const correct = sequence[playerIndex] === idx;

    if (correct) {
      el.classList.add('correct');
      setTimeout(() => el.classList.remove('correct'), 300);
      playerIndex++;
      document.getElementById('img-seq-status').textContent = `${playerIndex}/${sequence.length} ✓`;

      if (playerIndex >= sequence.length) {
        // Round complete!
        score++;
        round++;
        enableButtons(false);
        if (round >= MAX_ROUNDS) {
          done = true;
          setTimeout(() => {
            const success = true;
            const title = '¡Memoria perfecta!';
            const detail = `${score}/${MAX_ROUNDS} rondas`;
            const narrative = 'Memorizaste cada curva del circuito a la perfección. Tu velocidad en calificación mejora notablemente.';
            showIMGResult(success, title, detail, narrative, false);
          }, 600);
        } else {
          addToSequence();
          document.getElementById('img-seq-status').textContent = '¡Ronda superada! Siguiente...';
          setTimeout(() => {
            renderUI();
            showSequence();
          }, 800);
        }
      }
    } else {
      // Wrong!
      el.classList.add('wrong');
      enableButtons(false);
      done = true;
      setTimeout(() => {
        const success = false;
        const title = 'Mal día en el simulador';
        const detail = 'Equivocaste la secuencia';
        const narrative = 'Un error de memoria te costó caro. Salís al circuito real sin la confianza necesaria y perdés ritmo.';
        showIMGResult(success, title, detail, narrative);
      }, 700);
    }
  };

  // Start
  addToSequence();
  renderUI();
  showSequence();
}

// ════════════════════════════════════════════════════════
//  5. TEMPERATURE — Callentar gomas Safety Car
// ════════════════════════════════════════════════════════
function startTempGame() {
  const area = document.getElementById('img-game-area');
  const GOAL_DURATION = 6000; // ms inside zone
  const TOTAL_TIME = 15000; // 15 seconds limit
  const ZONE_MIN = 38;
  const ZONE_MAX = 62;
  let temp = 25; // starts cold
  const DECAY = 0.15; // deg per frame @ 60fps
  const BOOST = 2.5;  // deg per tap
  let timeInZone = 0;
  let elapsedTime = 0;
  let lastFrame = null;
  let animId = null;
  let done = false;

  area.innerHTML = `
    <div style="font-size:36px;margin-bottom:8px">🌡️</div>
    <div class="heading" style="font-size:20px;margin-bottom:4px">TEMPERATURA DE NEUMATICOS</div>
    <div class="label" style="color:var(--muted);margin-bottom:14px">Mantené los neumaticos en la zona verde</div>
    <div id="img-temp-bar-wrap" style="position:relative;width:100%;height:38px;background:#1a1a2e;border-radius:20px;overflow:hidden;margin-bottom:12px;border:1px solid rgba(255,255,255,0.1)">
      <div id="img-temp-zone" style="position:absolute;left:${ZONE_MIN}%;width:${ZONE_MAX-ZONE_MIN}%;top:0;height:100%;background:rgba(74,222,128,0.25);border-left:2px solid var(--success);border-right:2px solid var(--success)"></div>
      <div id="img-temp-fill" style="position:absolute;left:0;top:0;height:100%;width:${temp}%;background:linear-gradient(90deg,#60a5fa,#4ade80);border-radius:20px;transition:width 0.05s"></div>
      <div id="img-temp-val" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:12px;color:white;font-weight:bold">${Math.round(temp)}%</div>
    </div>
    <div id="img-temp-timer" style="font-size:20px;color:var(--accent);margin-bottom:6px;font-weight:bold">6.0s restantes en zona</div>
    <div id="img-temp-global-timer" style="font-size:14px;color:var(--text);margin-bottom:18px">Tiempo total: 15.0s</div>
    <button id="img-temp-btn" class="btn btn-primary" style="font-size:22px;padding:22px 0;width:100%">🔥 CALENTAR</button>
  `;

  const btn = document.getElementById('img-temp-btn');
  btn.onclick = () => { if (!done) temp = Math.min(100, temp + BOOST); };

  const loop = (ts) => {
    if (!lastFrame) lastFrame = ts;
    const dt = ts - lastFrame;
    lastFrame = ts;
    if (done) return;

    elapsedTime += dt;
    temp = Math.max(0, temp - DECAY * (dt / 16.67));
    
    const fill = document.getElementById('img-temp-fill');
    const val = document.getElementById('img-temp-val');
    const timerEl = document.getElementById('img-temp-timer');
    const gTimerEl = document.getElementById('img-temp-global-timer');
    if (!fill) return;

    fill.style.width = temp + '%';
    fill.style.background = temp >= ZONE_MIN && temp <= ZONE_MAX
      ? 'linear-gradient(90deg,#4ade80,#22c55e)'
      : 'linear-gradient(90deg,#60a5fa,#3b82f6)';
    if (val) val.textContent = Math.round(temp) + '%';

    if (temp >= ZONE_MIN && temp <= ZONE_MAX) {
      timeInZone += dt;
    } else {
      timeInZone = Math.max(0, timeInZone - dt * 0.5);
    }
    const remaining = Math.max(0, (GOAL_DURATION - timeInZone) / 1000);
    const totalRemaining = Math.max(0, (TOTAL_TIME - elapsedTime) / 1000);
    if (timerEl) timerEl.textContent = remaining.toFixed(1) + 's restantes en zona';
    if (gTimerEl) gTimerEl.textContent = 'Tiempo total: ' + totalRemaining.toFixed(1) + 's';

    if (timeInZone >= GOAL_DURATION) {
      done = true;
      showIMGResult(true, '¡Neumaticos a Temperatura!', 'Neumaticos listas para atacar',
        'Los neumaticos están perfectamente calientes. Cuando el Safety Car se fue, tenés agarre total y atacás la primera curva con confianza.', false);
      return;
    }
    
    if (elapsedTime >= TOTAL_TIME) {
      done = true;
      showIMGResult(false, 'Se Acabó el Tiempo', 'No lograste calentar los neumaticos a tiempo',
        'El Safety Car se fue y tus neumaticos seguían fríos. Perdiste todo el agarre y un par de posiciones en la relargada.');
      return;
    }

    if (temp <= 0) {
      done = true;
      showIMGResult(false, 'neumaticos Fríos', 'Los neumaticos se enfriaron demasiado',
        'Sin calor en los neumaticos, perdés grip instantáneamente al reiniciarse la carrera. Dos autos te adelantan antes de la primera curva.');
      return;
    }
    animId = requestAnimationFrame(loop);
  };
  animId = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════════════════
//  6. DEFENSE — Cerrar la Puerta
// ════════════════════════════════════════════════════════
function startDefenseGame() {
  const area = document.getElementById('img-game-area');
  const TOTAL_ATTACKS = 3;
  const ATTACK_TIME = 900; // ms to react
  let attack = 0;
  let done = false;
  let attackDir = null;
  let attackTimer = null;
  let fillAnim = null;

  const render = () => {
    area.innerHTML = `
      <div style="font-size:36px;margin-bottom:8px">🛡️</div>
      <div class="heading" style="font-size:20px;margin-bottom:4px">CERRANDO LA PUERTA</div>
      <div class="label" style="color:var(--muted);margin-bottom:16px">Ataque ${attack + 1} de ${TOTAL_ATTACKS}</div>
      <div id="img-def-indicator" style="font-size:56px;text-align:center;margin-bottom:20px;min-height:70px;transition:all 0.2s">❓</div>
      <div id="img-def-bar-wrap" style="width:100%;height:14px;background:#1a1a2e;border-radius:8px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1)">
        <div id="img-def-bar" style="height:100%;width:100%;background:#ef4444;border-radius:8px;transition:none"></div>
      </div>
      <div style="display:flex;gap:16px">
        <button id="img-def-left" class="btn btn-secondary" style="flex:1;font-size:32px;padding:20px 0">⬅️</button>
        <button id="img-def-right" class="btn btn-secondary" style="flex:1;font-size:32px;padding:20px 0">➡️</button>
      </div>
      <div class="label" style="color:var(--muted);margin-top:12px">Bloqueados: ${attack}/3</div>
    `;

    document.getElementById('img-def-left').onclick = () => tryBlock('left');
    document.getElementById('img-def-right').onclick = () => tryBlock('right');
    startAttack();
  };

  const startAttack = () => {
    attackDir = Math.random() < 0.5 ? 'left' : 'right';
    const indicator = document.getElementById('img-def-indicator');
    // Brief delay before showing direction
    setTimeout(() => {
      if (done) return;
      if (indicator) indicator.textContent = attackDir === 'left' ? '⬅️' : '➡️';
      // Animate bar shrinking
      const bar = document.getElementById('img-def-bar');
      if (bar) {
        bar.style.transition = `width ${ATTACK_TIME}ms linear`;
        bar.style.width = '0%';
      }
      attackTimer = setTimeout(() => {
        if (done) return;
        // Time ran out
        done = true;
        showIMGResult(false, '¡Puerta Abierta!', 'Reaccionaste demasiado lento',
          'El rival se coló por el hueco. Para la siguiente curva ya estás una posición atrás.');
      }, ATTACK_TIME);
    }, 600);
  };

  const tryBlock = (dir) => {
    if (done || attackDir === null) return;
    clearTimeout(attackTimer);
    const correct = dir === attackDir;
    if (correct) {
      attackDir = null;
      attack++;
      const indicator = document.getElementById('img-def-indicator');
      if (indicator) { indicator.textContent = '✅'; indicator.style.color = '#4ade80'; }
      setTimeout(() => {
        if (attack >= TOTAL_ATTACKS) {
          done = true;
          showIMGResult(true, '¡Defensa Perfecta!', `${TOTAL_ATTACKS}/${TOTAL_ATTACKS} ataques bloqueados`,
            'No le diste ni un centímetro. El rival llega a la línea de meta mordiéndose los guantes.');
        } else {
          render();
        }
      }, 600);
    } else {
      done = true;
      showIMGResult(false, '¡Lado Equivocado!', 'Bloqueo incorrecto',
        'Te tiraste para el lado equivocado y dejaste la puerta abierta. El rival no perdonó.');
    }
  };

  render();
}

// ════════════════════════════════════════════════════════
//  7. SLIPSTREAM — Rebufo
// ════════════════════════════════════════════════════════
function startSlipstreamGame() {
  const area = document.getElementById('img-game-area');
  const TRACK_W = 280;
  const CAR_W = 44;
  const MAX_OFFSET = (TRACK_W - CAR_W) / 2;
  const TOTAL_TIME = 10000;
  let elapsedTime = 0;
  let rivalX = 0;       // -MAX_OFFSET to MAX_OFFSET
  let playerX = 0;
  const RIVAL_SPEED = 1.1;
  const PLAYER_SPEED = 18;
  let rivalDir = 1;
  let fillPct = 0;
  const FILL_RATE = 1.0;  // per frame when aligned
  const DRAIN_RATE = 2.2; // per frame when misaligned
  const ALIGN_THRESHOLD = 28; // px difference allowed
  let animId = null;
  let done = false;
  let lastTs = null;

  area.innerHTML = `
    <div style="font-size:36px;margin-bottom:6px">💨</div>
    <div class="heading" style="font-size:20px;margin-bottom:4px">ATRAPAR EL REBUFO</div>
    <div class="label" style="color:var(--muted);margin-bottom:12px">Quedáte justo detrás del rival antes que acabe la recta</div>
    <div id="img-slip-track" style="position:relative;width:${TRACK_W}px;height:120px;background:#1a1a2e;border-radius:12px;margin:0 auto 14px;border:1px solid rgba(255,255,255,0.15);overflow:hidden">
      <div id="img-slip-rival" style="position:absolute;top:8px;font-size:28px;transform:translateX(-50%);left:50%">🏎️</div>
      <div id="img-slip-player" style="position:absolute;bottom:8px;font-size:28px;transform:translateX(-50%);left:50%;filter:hue-rotate(120deg)">🏎️</div>
    </div>
    <div class="label" style="color:var(--muted);margin-bottom:6px;display:flex;justify-content:space-between">
      <span>Rebufo:</span>
      <span id="img-slip-timer">10.0s</span>
    </div>
    <div style="width:100%;height:20px;background:#1a1a2e;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);margin-bottom:18px">
      <div id="img-slip-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#60a5fa,#a78bfa);border-radius:10px;transition:width 0.08s"></div>
    </div>
    <div style="display:flex;gap:12px">
      <button id="img-slip-left" class="btn btn-secondary" style="flex:1;font-size:28px;padding:18px 0">⬅️</button>
      <button id="img-slip-right" class="btn btn-secondary" style="flex:1;font-size:28px;padding:18px 0">➡️</button>
    </div>
  `;

  let nextDirChange = 800 + Math.random() * 1500;

  document.getElementById('img-slip-left').onclick  = () => { playerX = Math.max(-MAX_OFFSET, playerX - PLAYER_SPEED); };
  document.getElementById('img-slip-right').onclick = () => { playerX = Math.min(MAX_OFFSET,  playerX + PLAYER_SPEED); };

  const loop = (ts) => {
    if (!lastTs) lastTs = ts;
    const realDt = ts - lastTs;
    const dt = realDt / 16.67;
    lastTs = ts;
    if (done) return;

    elapsedTime += realDt;
    
    rivalX += RIVAL_SPEED * rivalDir * dt;
    if (rivalX >= MAX_OFFSET) { rivalX = MAX_OFFSET; rivalDir = -1; }
    if (rivalX <= -MAX_OFFSET) { rivalX = -MAX_OFFSET; rivalDir = 1; }

    if (elapsedTime > nextDirChange) {
      // Cambia de dirección de forma impredecible si no está muy cerca de los bordes
      if (Math.abs(rivalX) < MAX_OFFSET * 0.8) {
        rivalDir = Math.random() > 0.5 ? 1 : -1;
      }
      nextDirChange = elapsedTime + 400 + Math.random() * 1200;
    }

    const rivalEl  = document.getElementById('img-slip-rival');
    const playerEl = document.getElementById('img-slip-player');
    const fillEl   = document.getElementById('img-slip-fill');
    const timerEl  = document.getElementById('img-slip-timer');
    if (!rivalEl) return;

    const trackCenter = TRACK_W / 2;
    rivalEl.style.left  = (trackCenter + rivalX) + 'px';
    playerEl.style.left = (trackCenter + playerX) + 'px';

    const diff = Math.abs(rivalX - playerX);
    if (diff <= ALIGN_THRESHOLD) {
      fillPct = Math.min(100, fillPct + FILL_RATE * dt);
      rivalEl.style.filter = 'none';
    } else {
      fillPct = Math.max(0, fillPct - DRAIN_RATE * dt);
      rivalEl.style.filter = 'brightness(0.6)';
    }
    if (fillEl) fillEl.style.width = fillPct + '%';
    
    const rem = Math.max(0, (TOTAL_TIME - elapsedTime) / 1000);
    if (timerEl) timerEl.textContent = rem.toFixed(1) + 's';

    if (fillPct >= 100) {
      done = true;
      showIMGResult(true, '¡REBUFO CONSEGUIDO!', 'Velocidad perfecta — adelantamiento logrado',
        'Te mantuviste por detras el tiempo justo. Activás el DRS y volás por la recta, pasándolo antes del final.');
      return;
    }
    
    if (elapsedTime >= TOTAL_TIME) {
      done = true;
      showIMGResult(false, 'Se Acabó la Recta', 'No lograste enganchar el rebufo',
        'Se terminó la recta antes de que pudieras ganar suficiente velocidad. El rival defendió su posición y te dejó sin el impulso necesario para intentar el adelantamiento.');
      return;
    }
    
    animId = requestAnimationFrame(loop);
  };
  animId = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════════════════
//  8. SETUP — Encontrar el Setup
// ════════════════════════════════════════════════════════
function startSetupGame() {
  const area = document.getElementById('img-game-area');
  const PARAMS = [
    { name: 'Aerón', id: 'aero' },
    { name: 'Suspensión', id: 'susp' },
    { name: 'Frenos', id: 'brak' },
  ];
  // Secret optimal values (0-100)
  const optimal = PARAMS.map(() => 20 + Math.floor(Math.random() * 60));
  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  let playerVals = [50, 50, 50];
  let hints = ['', '', ''];
  let done = false;

  const calcScore = () => {
    let total = 0;
    PARAMS.forEach((_, i) => {
      total += 100 - Math.abs(playerVals[i] - optimal[i]);
      // Update hints for next render
      const diff = optimal[i] - playerVals[i];
      if (Math.abs(diff) <= 5) hints[i] = '✅';
      else if (diff > 0) hints[i] = '⬆️ Subir';
      else hints[i] = '⬇️ Bajar';
    });
    return Math.round(total / PARAMS.length);
  };

  const render = () => {
    area.innerHTML = `
      <div style="font-size:36px;margin-bottom:6px">🔧</div>
      <div class="heading" style="font-size:20px;margin-bottom:4px">SETUP DEL AUTO</div>
      <div class="label" style="color:var(--muted);margin-bottom:16px">Intento ${attempts + 1} de ${MAX_ATTEMPTS} — Necesitás 90%+</div>
      ${PARAMS.map((p, i) => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="label">${p.name} ${hints[i] ? `<span style="color:var(--accent);font-size:11px;margin-left:6px">${hints[i]}</span>` : ''}</span>
            <span class="label" style="color:var(--accent)" id="img-setup-val-${p.id}">${playerVals[i]}</span>
          </div>
          <input type="range" min="0" max="100" value="${playerVals[i]}" id="img-setup-${p.id}"
            style="width:100%;accent-color:var(--accent)" data-idx="${i}">
        </div>
      `).join('')}
      <button id="img-setup-try" class="btn btn-primary" style="width:100%;margin-top:8px">PROBAR EN PISTA</button>
      <div id="img-setup-feedback" style="margin-top:12px;min-height:24px"></div>
    `;

    PARAMS.forEach((p, i) => {
      const el = document.getElementById('img-setup-' + p.id);
      if(el) {
        el.oninput = () => {
          playerVals[i] = parseInt(el.value);
          const valEl = document.getElementById('img-setup-val-' + p.id);
          if (valEl) valEl.textContent = playerVals[i];
        };
      }
    });

    document.getElementById('img-setup-try').onclick = () => {
      if (done) return;
      attempts++;
      const score = calcScore();
      if (score >= 90) {
        done = true;
        render(); // render final hints
        showIMGResult(true, '¡Setup Perfecto!', `${score}% de efectividad`,
          'El auto responde exactamente como querías. En la vuelta rápida te sentiste en casa.', false);
      } else if (attempts >= MAX_ATTEMPTS) {
        done = true;
        render(); // render final hints
        showIMGResult(false, 'Setup Mediocre', `${score}% de efectividad — Quedó el auto armado a medias`,
          'Sin tiempo para más vueltas. Salís a clasificar sabiendo que el auto no está en su mejor punto.');
      } else {
        render();
        const fb = document.getElementById('img-setup-feedback');
        const hint = score >= 75 ? '✅ Muy cerca, ajustá un poco más' : score >= 55 ? '🟡 Por buen camino, pero falta' : '❌ Lejos del óptimo, replanteá todo';
        if (fb) fb.innerHTML = `<div class="label" style="color:var(--accent);font-size:18px">${score}% — ${hint}</div>`;
      }
    };
  };

  render();
}

// ════════════════════════════════════════════════════════
//  9. LINE — Trazada Ideal
// ════════════════════════════════════════════════════════
function startLineGame() {
  const area = document.getElementById('img-game-area');
  const CURVES = [
    { name: 'Curva 1 - Sainte-Devôte', path: [{x:10,y:70},{x:30,y:68},{x:55,y:55},{x:70,y:35},{x:80,y:15}] },
    { name: 'Curva 2 - Massenet', path: [{x:85,y:75},{x:75,y:55},{x:55,y:35},{x:30,y:20},{x:10,y:15}] },
    { name: 'Curva 3 - Loews (Horquilla)', path: [{x:10,y:20},{x:30,y:20},{x:60,y:25},{x:75,y:50},{x:65,y:75},{x:40,y:82},{x:15,y:75}] },
  ];
  let curveIdx = 0;
  let done = false;
  let timerInterval = null;

  const renderCurve = () => {
    if (timerInterval) clearInterval(timerInterval);
    let timeLeft = 5.0;

    const c = CURVES[curveIdx];
    area.innerHTML = `
      <div style="font-size:36px;margin-bottom:6px">🏁</div>
      <div class="heading" style="font-size:18px;margin-bottom:2px">TRAZADA IDEAL</div>
      <div class="label" style="color:var(--muted);margin-bottom:8px">${c.name}</div>
      <canvas id="img-line-canvas" width="280" height="140"
        style="display:block;margin:0 auto 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:#111827;touch-action:none"></canvas>
      <div id="img-line-timer" style="font-size:24px; font-weight:bold; color:var(--text); margin-bottom:4px">5.0s</div>
      <div id="img-line-status" class="label" style="color:var(--accent);margin-bottom:10px">Arrastrá siguiendo la línea verde</div>
      <div style="font-size:12px;color:var(--muted)">Curva ${curveIdx+1} de ${CURVES.length}</div>
    `;

    timerInterval = setInterval(() => {
      if (done || succeeded || failed) {
         clearInterval(timerInterval);
         return;
      }
      timeLeft -= 0.1;
      const tEl = document.getElementById('img-line-timer');
      if (tEl) tEl.textContent = Math.max(0, timeLeft).toFixed(1) + 's';

      if (timeLeft <= 0.01) {
         clearInterval(timerInterval);
         failed = true;
         done = true;
         drawing = false;
         if (tEl) tEl.style.color = '#f87171';
         const status = document.getElementById('img-line-status');
         if (status) { status.textContent = '❌ ¡Tiempo Agotado!'; status.style.color = '#f87171'; }
         setTimeout(() => {
           showIMGResult(false, 'Tiempo Agotado', 'Fuiste demasiado lento', 'Tardaste demasiado en trazar la curva y el comisario te invalidó la vuelta.');
         }, 900);
      }
    }, 100);

    const canvas = document.getElementById('img-line-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Convert % coords to px
    const pts = c.path.map(p => ({ x: p.x / 100 * W, y: p.y / 100 * H }));

    // Draw ideal path (thick zone + thin center)
    const drawPath = () => {
      ctx.clearRect(0, 0, W, H);
      // Zone
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = 'rgba(74,222,128,0.25)';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      // Center line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Start dot
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      // End dot
      ctx.beginPath();
      ctx.arc(pts[pts.length-1].x, pts[pts.length-1].y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    };

    drawPath();

    // Check if point is near the path
    const distToSegment = (px, py, ax, ay, bx, by) => {
      const dx = bx - ax, dy = by - ay;
      const lenSq = dx*dx + dy*dy;
      if (lenSq === 0) return Math.hypot(px-ax, py-ay);
      const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / lenSq));
      return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
    };
    const isOnPath = (px, py) => {
      for (let i = 0; i < pts.length - 1; i++) {
        if (distToSegment(px, py, pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y) <= 14) return true;
      }
      return false;
    };
    const nearEnd = (px, py) => Math.hypot(px - pts[pts.length-1].x, py - pts[pts.length-1].y) <= 18;
    const nearStart = (px, py) => Math.hypot(px - pts[0].x, py - pts[0].y) <= 22;

    let drawing = false;
    let failed = false;
    let succeeded = false;
    let startedOnPath = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      if (e.touches) {
        return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
      }
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };

    const onStart = (e) => {
      e.preventDefault();
      if (done || succeeded || failed) return;
      const pos = getPos(e);
      if (!nearStart(pos.x, pos.y)) {
        const status = document.getElementById('img-line-status');
        if (status) status.textContent = '⚠️ Empezá desde el punto verde';
        return;
      }
      drawing = true;
      startedOnPath = true;
    };
    const onMove = (e) => {
      e.preventDefault();
      if (!drawing || failed || succeeded) return;
      const pos = getPos(e);
      if (!isOnPath(pos.x, pos.y)) {
        failed = true;
        drawing = false;
        ctx.fillStyle = 'rgba(239,68,68,0.25)';
        ctx.fillRect(0, 0, W, H);
        const status = document.getElementById('img-line-status');
        if (status) { status.textContent = '❌ ¡Te saliste!'; status.style.color = '#f87171'; }
        setTimeout(() => {
          if (!done) {
            done = true;
            showIMGResult(false, 'Vuelta Invalidada', 'Te saliste de pista',
              'Los comisarios muestran la bandera amarilla. Tu vuelta queda invalidada y perdés la posibilidad de clasificar mejor.');
          }
        }, 900);
        return;
      }
      // Draw player path
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250,204,21,0.7)';
      ctx.fill();

      if (nearEnd(pos.x, pos.y)) {
        succeeded = true;
        drawing = false;
        curveIdx++;
        if (curveIdx >= CURVES.length) {
          done = true;
          setTimeout(() => showIMGResult(true, '¡Trazada Perfecta!', '3/3 curvas completadas',
            'Pasaste Mónaco como si fueras un local. Cada curva era exactamente lo que el ingeniero esperó.'), 500);
        } else {
          const status = document.getElementById('img-line-status');
          if (status) { status.textContent = '✅ ¡Curva perfecta! Siguiente...'; status.style.color = '#4ade80'; }
          setTimeout(renderCurve, 900);
        }
      }
    };
    const onEnd = (e) => { drawing = false; };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);
  };

  renderCurve();
}

// ════════════════════════════════════════════════════════
//  10. RAIN — El Diluvio
// ════════════════════════════════════════════════════════
function startRainGame() {
  const area = document.getElementById('img-game-area');
  const SAFE_MIN = 45;
  const SAFE_MAX = 70;
  const TOO_WET  = 92;
  let rainLevel = 0;
  let done = false;
  let animId = null;
  let lastTs = null;
  let speed = 0.18;
  let spikeTimer = 30;

  area.innerHTML = `
    <div style="font-size:36px;margin-bottom:6px">🌧️</div>
    <div class="heading" style="font-size:20px;margin-bottom:4px">EL DILUVIO</div>
    <div class="label" style="color:var(--muted);margin-bottom:14px">Entrá a boxes en el momento justo — ni seco ni inundado</div>
    <div style="position:relative;width:100%;height:44px;background:#1a1a2e;border-radius:22px;overflow:hidden;margin-bottom:6px;border:1px solid rgba(255,255,255,0.1)">
      <div style="position:absolute;left:0;top:0;height:100%;width:${SAFE_MIN}%;background:rgba(250,204,21,0.12);border-right:2px solid #facc15"></div>
      <div style="position:absolute;left:${SAFE_MIN}%;width:${SAFE_MAX - SAFE_MIN}%;top:0;height:100%;background:rgba(74,222,128,0.18);border-right:2px solid var(--success)"></div>
      <div style="position:absolute;left:${SAFE_MAX}%;width:${100 - SAFE_MAX}%;top:0;height:100%;background:rgba(248,113,113,0.12);"></div>
      <div id="img-rain-fill" style="position:absolute;left:0;top:0;height:100%;width:0%;background:linear-gradient(90deg,#facc15,#4ade80);border-radius:22px"></div>
      <div id="img-rain-cursor" style="position:absolute;top:10%;left:0%;width:3px;height:80%;background:white;border-radius:2px;box-shadow:0 0 6px white"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:14px;padding:0 4px">
      <span style="color:var(--warning)">🌦 Muy seco</span>
      <span style="color:var(--success)">✅ Zona ideal</span>
      <span style="color:var(--fail)">🌊 Trompo</span>
    </div>
    <div id="img-rain-status" style="font-size:15px;color:var(--accent);margin-bottom:20px;text-align:center;min-height:20px">La lluvia empieza a caer...</div>
    <button id="img-rain-btn" class="btn btn-primary" style="font-size:17px;padding:20px 0;width:100%;background:linear-gradient(135deg,#60a5fa,#3b82f6)">🔧 ENTRAR A BOXES — PONER INTERMEDIAS</button>
  `;

  document.getElementById('img-rain-btn').onclick = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(animId);
    const lvl = rainLevel;
    if (lvl < SAFE_MIN) {
      showIMGResult(false, '¡Demasiado Pronto!', 'La pista todavía estaba seca',
        'Entraste cuando apenas llovizneaba. Las Intermedias en asfalto seco se degradaron al instante. Perdiste 4 posiciones.', false);
    } else if (lvl <= SAFE_MAX) {
      showIMGResult(true, '¡Timing Perfecto!', 'Las Intermedias en el momento justo',
        'Leíste la pista como un maestro. Saliste de boxes en el momento exacto y ganaste tres posiciones sobre los que entraron tarde.', false);
    } else {
      showIMGResult(false, '¡Demasiado Tarde!', 'La pista ya estaba inundada',
        'Aguantaste demasiado. En la última curva antes del pit lane el auto sobregiró y tocaste el muro de boxes. Posición arruinada.', false);
    }
  };

  const loop = (ts) => {
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 16.67;
    lastTs = ts;
    if (done) return;

    spikeTimer -= dt;
    const spike = spikeTimer <= 0 && Math.random() < 0.4;
    if (spikeTimer <= 0) spikeTimer = 40 + Math.random() * 70;

    rainLevel = Math.min(100, rainLevel + speed * (spike ? 3.8 : 1) * dt);

    const fill   = document.getElementById('img-rain-fill');
    const cursor = document.getElementById('img-rain-cursor');
    const status = document.getElementById('img-rain-status');
    if (!fill) return;

    fill.style.width = rainLevel + '%';
    fill.style.background = rainLevel < SAFE_MIN
      ? 'linear-gradient(90deg,#facc15,#fbbf24)'
      : rainLevel <= SAFE_MAX
        ? 'linear-gradient(90deg,#4ade80,#22c55e)'
        : 'linear-gradient(90deg,#f87171,#ef4444)';
    if (cursor) cursor.style.left = rainLevel + '%';
    if (status) {
      if (rainLevel < SAFE_MIN) { status.textContent = spike ? '⚡ ¡Aguacero repentino!' : 'Llovizna leve...'; status.style.color = '#facc15'; }
      else if (rainLevel <= SAFE_MAX) { status.textContent = '🟢 ¡ZONA IDEAL! ¡Entrá ahora!'; status.style.color = '#4ade80'; }
      else { status.textContent = '🔴 ¡PISTA INUNDADA!'; status.style.color = '#f87171'; }
    }

    if (rainLevel >= TOO_WET) {
      done = true;
      showIMGResult(false, 'Trompo en la Recta', 'Aguantaste demasiado en pista',
        'El agua superó el límite. Acuaplaning en la recta principal. Tres vueltas en la grava.', false);
      return;
    }
    animId = requestAnimationFrame(loop);
  };
  animId = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════════════════
//  11. TYRES — Cuidar el Caucho
// ════════════════════════════════════════════════════════
function startTyresGame() {
  const area = document.getElementById('img-game-area');
  const TOTAL_LAPS  = 3;
  const LAP_MS      = 2500;
  const DECAY_PRESS = 0.55;   // tyre wear per frame when pressing
  const DECAY_SAVE  = 0.09;  // tyre wear per frame when not pressing
  const RIVAL_CLOSE = 0.35;  // gap closed per frame when saving
  const RIVAL_OPEN  = 0.5;   // gap opened per frame when pressing
  let tyreWear = 100;
  let gap = 100;             // px rival is behind
  const GAP_MAX = 150;
  let lap = 1;
  let lapStart = null;
  let pressing = false;
  let done = false;
  let lastTs = null;
  let animId = null;

  area.innerHTML = `
    <div style="font-size:36px;margin-bottom:4px">🛞</div>
    <div class="heading" style="font-size:20px;margin-bottom:4px">CUIDAR EL CAUCHO</div>
    <div class="label" style="color:var(--muted);margin-bottom:10px">Mantené al rival atrás sin fundir las gomas</div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <span class="label" style="font-size:13px">Desgaste de gomas:</span>
      <span id="img-tyr-wear-val" style="color:var(--success);font-weight:bold">100%</span>
    </div>
    <div style="width:100%;height:20px;background:#1a1a2e;border-radius:10px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(255,255,255,0.1)">
      <div id="img-tyr-wear-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:10px;transition:width 0.05s"></div>
    </div>

    <div style="position:relative;width:100%;height:52px;background:#1a1a2e;border-radius:10px;overflow:hidden;margin-bottom:8px;border:1px solid rgba(255,255,255,0.12)">
      <div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:10px;color:var(--muted);letter-spacing:1px">RIVAL</div>
      <div id="img-tyr-rival" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:26px;transition:right 0.08s">🏎️</div>
      <div id="img-tyr-player" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:26px;opacity:0.4">🏎️</div>
    </div>

    <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:14px">
      <span>Vuelta <span id="img-tyr-lap" style="color:white;font-weight:bold">1</span>/${TOTAL_LAPS}</span>
      <span id="img-tyr-status" style="color:var(--accent)">Gestioná el ritmo</span>
    </div>

    <button id="img-tyr-btn" class="btn btn-primary" style="font-size:17px;padding:20px 0;width:100%">🔥 APRETAR (mantener pulsado para ir más rápido)</button>
  `;

  const btn = document.getElementById('img-tyr-btn');
  btn.addEventListener('pointerdown', () => { pressing = true; });
  btn.addEventListener('pointerup',   () => { pressing = false; });
  btn.addEventListener('pointerleave',() => { pressing = false; });

  const loop = (ts) => {
    if (!lastTs) { lastTs = ts; lapStart = ts; }
    const dt = (ts - lastTs) / 16.67;
    lastTs = ts;
    if (done) return;

    if (pressing) {
      tyreWear = Math.max(0, tyreWear - DECAY_PRESS * dt);
      gap      = Math.min(GAP_MAX, gap + RIVAL_OPEN  * dt);
    } else {
      tyreWear = Math.max(0, tyreWear - DECAY_SAVE * dt);
      gap      = Math.max(0, gap - RIVAL_CLOSE * dt);
    }

    // Lap counter
    if (ts - lapStart >= LAP_MS) {
      lapStart = ts;
      lap++;
      if (lap > TOTAL_LAPS) {
        done = true;
        showIMGResult(true, '¡Gomas Vivas al Final!', `${TOTAL_LAPS}/${TOTAL_LAPS} vueltas completadas`,
          'Cada vuelta fue un duelo de ajedrez. Las gomas llegaron al límite pero todavía había agarre. Bandera a cuadros superando al rival.', false);
        return;
      }
    }

    const wEl  = document.getElementById('img-tyr-wear-bar');
    const wvEl = document.getElementById('img-tyr-wear-val');
    const rEl  = document.getElementById('img-tyr-rival');
    const sEl  = document.getElementById('img-tyr-status');
    const lEl  = document.getElementById('img-tyr-lap');
    if (!wEl) return;

    const pct = Math.round(tyreWear);
    wEl.style.width      = pct + '%';
    wEl.style.background = pct > 50 ? 'linear-gradient(90deg,#4ade80,#22c55e)'
                         : pct > 20 ? 'linear-gradient(90deg,#facc15,#f59e0b)'
                         :            'linear-gradient(90deg,#f87171,#ef4444)';
    if (wvEl) { wvEl.textContent = pct + '%'; wvEl.style.color = pct > 50 ? '#4ade80' : pct > 20 ? '#facc15' : '#f87171'; }
    if (rEl)  rEl.style.right = (16 + gap) + 'px';
    if (lEl)  lEl.textContent = Math.min(lap, TOTAL_LAPS);
    if (sEl)  sEl.textContent = pressing ? '🔥 A fondo...' : gap < 20 ? '⚠️ ¡Rival encima!' : '💨 Gestionando';

    if (tyreWear <= 0) {
      done = true;
      showIMGResult(false, '¡Reventón!', 'Las gomas no aguantaron',
        'El compuesto cedió en la frenada más dura. El auto se fue de cola y terminaste en la grava.', false);
      return;
    }
    if (gap <= 0) {
      done = true;
      showIMGResult(false, '¡Te Pasaron!', 'El rival aprovechó las gomas frescas',
        'Aflojaste un segundo en la última curva y fue suficiente para que se colara por el interior.', false);
      return;
    }

    animId = requestAnimationFrame(loop);
  };
  animId = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════════════════
//  12. REBOOT — Falla Electrónica
// ════════════════════════════════════════════════════════
function startRebootGame() {
  const area = document.getElementById('img-game-area');
  const BTNS = [
    { id: 'A', bg: '#f87171', color: '#000' },
    { id: 'B', bg: '#60a5fa', color: '#000' },
    { id: 'C', bg: '#4ade80', color: '#000' },
    { id: 'D', bg: '#facc15', color: '#000' },
    { id: 'E', bg: '#c084fc', color: '#000' },
    { id: 'F', bg: '#fb923c', color: '#000' },
  ];
  const SEQ_LEN    = 5;
  const TIME_LIMIT = 7000;
  const sequence   = Array.from({ length: SEQ_LEN }, () => BTNS[Math.floor(Math.random() * BTNS.length)].id);
  let playerSeq    = [];
  let phase        = 'show';
  let done         = false;
  let startTime    = null;
  let timerIv      = null;

  const slotHtml = (id) => {
    const b = BTNS.find(x => x.id === id);
    return `<div style="width:46px;height:46px;border-radius:10px;background:${b.bg};display:flex;align-items:center;justify-content:center;font-weight:900;color:${b.color};font-size:20px">${b.id}</div>`;
  };
  const emptySlot = `<div style="width:46px;height:46px;border-radius:10px;background:rgba(255,255,255,0.06);border:2px dashed rgba(255,255,255,0.18)"></div>`;

  const render = () => {
    const isInput = phase === 'input';
    area.innerHTML = `
      <div style="font-size:36px;margin-bottom:4px">⚙️</div>
      <div class="heading" style="font-size:20px;margin-bottom:4px">FALLA ELECTRÓNICA</div>
      <div class="label" style="color:var(--muted);margin-bottom:12px">${isInput ? 'Repetí la secuencia exacta — sin errores' : 'Memorizá la secuencia del MGU-K'}</div>

      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px;min-height:56px;align-items:center" id="img-rb-display">
        ${isInput
          ? playerSeq.map(slotHtml).join('') + emptySlot.repeat(SEQ_LEN - playerSeq.length)
          : sequence.map(slotHtml).join('')
        }
      </div>

      ${isInput ? `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px">
            <span>Tiempo restante</span>
            <span id="img-rb-timer" style="color:var(--accent);font-weight:bold">7.0s</span>
          </div>
          <div style="width:100%;height:8px;background:#1a1a2e;border-radius:4px;overflow:hidden">
            <div id="img-rb-bar" style="height:100%;width:100%;background:var(--accent);border-radius:4px;transition:width 0.1s"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${BTNS.map(b => `<button onclick="window._rebootPress('${b.id}')" class="btn" style="padding:22px 0;font-size:22px;font-weight:900;background:${b.bg};color:${b.color};border:none;border-radius:12px">${b.id}</button>`).join('')}
        </div>
      ` : `
        <div class="label" style="color:var(--muted);margin-bottom:18px;text-align:center">Tomá tu tiempo. Cuando estés listo, empezá el reboot.</div>
        <button id="img-rb-ready" class="btn btn-primary" style="width:100%;padding:18px 0;font-size:16px">✅ YA LO TENGO — INICIAR REBOOT</button>
      `}
    `;

    if (!isInput) {
      document.getElementById('img-rb-ready').onclick = () => {
        phase = 'input';
        render();
        startTime = performance.now();
        timerIv = setInterval(() => {
          if (done) { clearInterval(timerIv); return; }
          const rem = Math.max(0, (TIME_LIMIT - (performance.now() - startTime)) / 1000);
          const pct = rem / (TIME_LIMIT / 1000) * 100;
          const tEl = document.getElementById('img-rb-timer');
          const bEl = document.getElementById('img-rb-bar');
          if (tEl) tEl.textContent = rem.toFixed(1) + 's';
          if (bEl) { bEl.style.width = pct + '%'; bEl.style.background = rem > 3 ? 'var(--accent)' : rem > 1.5 ? '#facc15' : '#f87171'; }
          if (rem <= 0) {
            clearInterval(timerIv);
            if (!done) { done = true; showIMGResult(false, '¡Tiempo Agotado!', 'El motor se apagó definitivamente', 'La cuenta regresiva llegó a cero. El auto se detuvo en plena recta. Abandono.', false); }
          }
        }, 100);
      };
    }
  };

  window._rebootPress = (id) => {
    if (done || phase !== 'input') return;
    playerSeq.push(id);
    const pos = playerSeq.length - 1;
    if (playerSeq[pos] !== sequence[pos]) {
      done = true;
      clearInterval(timerIv);
      showIMGResult(false, 'Secuencia Incorrecta', 'El motor no arrancó',
        'Botón equivocado. El reinicio falló y el motor se apagó definitivamente. Abandonaste en plena recta.', false);
      return;
    }
    if (playerSeq.length >= SEQ_LEN) {
      done = true;
      clearInterval(timerIv);
      showIMGResult(true, '¡Sistema Reiniciado!', 'El MGU-K volvió a la vida',
        'Secuencia perfecta. El volante se iluminó y el motor rugió de vuelta. Perdiste solo 2 segundos y mantuviste tu posición en carrera.', false);
      return;
    }
    render();
  };

  render();
}

function showFlash(text) {
  const f = document.createElement('div');
  f.className = 'flash-number';
  f.textContent = text;
  f.style.fontSize = '36px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

// -------------------------------------------------------------------------
//  12. COMEBACK - A Remontar
// -------------------------------------------------------------------------
function startComebackGame() {
  const area = document.getElementById('img-game-area');
  area.innerHTML = `
    <div style="font-size:36px;margin-bottom:6px">🚀</div>
    <div class="heading" style="font-size:18px;margin-bottom:2px">A REMONTAR</div>
    <div class="label" id="img-cb-status" style="color:var(--muted);margin-bottom:8px">Autos superados: 0 / 5</div>
    <canvas id="img-cb-canvas" width="300" height="240"
      style="display:block;margin:0 auto 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:#111827;cursor:ew-resize;touch-action:none"></canvas>
    <div style="font-size:13px;color:var(--muted)">Deslizá para esquivar al auto que te frena</div>
  `;

  const canvas = document.getElementById('img-cb-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  
  let carsPassed = 0;
  let targetCars = 5;
  
  // Free movement variables
  let playerX = W / 2;
  let oppX = W / 2 + (Math.random() > 0.5 ? 60 : -60);
  let oppY = -50;
  
  let oppSpeedY = 2.0; 
  let oppTrackSpeed = 0.02; // How strongly the opponent tracks the player
  
  let gridOffset = 0;
  let isGameOver = false;
  let animFrame;
  let lastTime = 0;
  
  // Controls
  const onMove = (e) => {
    if (e.cancelable) e.preventDefault();
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const scaleX = W / rect.width;
    playerX = (clientX - rect.left) * scaleX;
    // Clamp inside canvas
    playerX = Math.max(20, Math.min(W - 20, playerX));
  };
  
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('touchmove', onMove, {passive: false});

  const loop = (timestamp) => {
    if (isGameOver) return;
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    
    // Scale by dt to ensure smooth movement
    const timeScale = dt / 16.66;
    gridOffset = (gridOffset + oppSpeedY * 2 * timeScale) % 40;
    oppY += oppSpeedY * timeScale;
    
    // Opponent AI: tracks player smoothly
    if (oppY > 0 && oppY < H - 50) {
       // Only start tracking intensely as difficulty goes up
       const currentTrackSpeed = oppTrackSpeed + (carsPassed * 0.015);
       oppX += (playerX - oppX) * currentTrackSpeed * timeScale;
    }
    
    // Collision / Pass check
    const hitbox = 35; // Size of the collision check
    if (oppY > H - 60 && oppY < H - 20) {
       if (Math.abs(oppX - playerX) < hitbox) {
          isGameOver = true;
          drawScene(true); 
          setTimeout(() => {
            showIMGResult(false, '¡Choque!', 'Le diste de atrás', 'Calculaste mal, el auto lento se movió y rompiste el alerón delantero. Perdiste muchísimo tiempo.');
          }, 1000);
          return;
       }
    }
    
    if (oppY > H) {
       carsPassed++;
       const statusEl = document.getElementById('img-cb-status');
       if (statusEl) statusEl.textContent = `Autos superados: ${carsPassed} / ${targetCars}`;
       if (carsPassed >= targetCars) {
          isGameOver = true;
          drawScene(false);
          setTimeout(() => {
            showIMGResult(true, '¡Remontada Épica!', 'Pasaste a los 5 autos', 'Encontraste los huecos milimétricos y no perdiste nada de tiempo. ¡Pudiste alcanzar a los líderes!');
          }, 500);
          return;
       }
       // Spawn next
       oppY = -50;
       // Spawn opponent far away from player's current side to give a brief moment
       oppX = playerX > W/2 ? 30 : W - 30;
       oppSpeedY += 0.8; // Drops faster
    }
    
    drawScene(false);
    animFrame = requestAnimationFrame(loop);
  };
  
  const drawScene = (crashed) => {
    ctx.clearRect(0,0,W,H);
    
    // Grid (Vertical lanes & horizontal speed lines)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    // 4 vertical lines to simulate perspective lanes
    ctx.beginPath(); ctx.moveTo(W/4, 0); ctx.lineTo(W/4, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3*W/4, 0); ctx.lineTo(3*W/4, H); ctx.stroke();
    
    for(let y = gridOffset - 40; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Player
    ctx.fillText('🏎️', playerX, H - 40);
    
    // Opponent
    ctx.fillText('🚙', oppX, oppY);
    
    if (crashed) {
      ctx.font = '40px sans-serif';
      ctx.fillText('💥', playerX, H - 50);
    }
  };
  
  animFrame = requestAnimationFrame(loop);
}
// ═══════════════════════════════════════════════════════════
//  CONTRACTS
// ═══════════════════════════════════════════════════════════

// Check if player meets at least one team's requirements in a given category index
function canMeetNextCatReqs(nextCatIdx) {
  if (nextCatIdx === 5 && G.academy && G.academyF2Repeated && G.lastResult && G.lastResult.champ <= 5) return true;
  
  const ovr = Math.round(Object.values(G.stats).reduce((a, b) => a + b) / 5);
  const nextCatTeams = TEAMS[CATEGORIES[nextCatIdx]] || [];
  const agentModOvr = G.upgrades.includes('agent') ? -2 : 0;
  const agentModRep = G.upgrades.includes('agent') ? 0.9 : 1;

  return nextCatTeams.some(t => {
    const reqs = getTeamRequirements(t.stars, nextCatIdx);
    return G.reputation >= reqs.rep && ovr >= reqs.ovr;
  });
}
function showContracts() {
  const cat = CATEGORIES[G.catIndex];
  const allTeams = TEAMS[cat] || TEAMS['F1'];
  
  // Rep & OVR requirements logic
  const ovr = Math.round(Object.values(G.stats).reduce((a, b) => a + b) / 5);

  const poolData = generateOfferPool(cat, ovr, allTeams);
  let offerPool = poolData.offerPool;
  const isLockedShadowMarket = poolData.isLockedShadowMarket;
  const isAcademyLocked = poolData.isAcademyLocked;

  // For junior categories: sort so affordable offers appear first
  // [DESACTIVADO A PEDIDO DEL JUGADOR]
  /*
  if (G.catIndex < 5) {
    offerPool.sort((a, b) => {
      const aCost = getSeatCost(G.catIndex, a.stars, G.academy);
      const bCost = getSeatCost(G.catIndex, b.stars, G.academy);
      const aAfford = G.money >= aCost ? 0 : 1;
      const bAfford = G.money >= bCost ? 0 : 1;
      return aAfford - bAfford;
    });
  }
  */


  const list = document.getElementById('contracts-list');
  list.innerHTML = '';

  // Restore the heading in case showCategoryChoiceScreen changed it
  if (isLockedShadowMarket) {
    document.querySelector('#screen-contracts .heading').textContent = '🕵️ El pre-contrato secreto';
    document.querySelector('#screen-contracts .sub').textContent = 'No hay vuelta atrás. Esta es la única oferta sobre la mesa.';
  } else {
    document.querySelector('#screen-contracts .heading').textContent = 'Ofertas de equipos';
    document.querySelector('#screen-contracts .sub').textContent = `Elegí dónde correr la próxima temporada en ${cat}`;
  }

  offerPool.forEach(team => {
    const isF1 = G.catIndex === 5;

    // === PAY-TO-DRIVE (Junior) vs SALARY (F1) ===
    const starIdx = clamp((team.stars || 3) - 3, 0, 2); // 3⭐=0, 4⭐=1, 5⭐=2
    
    // [DESACTIVADO A PEDIDO DEL JUGADOR]
    /*
    let seatCost = isF1 ? 0 : (SEAT_COSTS[G.catIndex] || SEAT_COSTS[4])[starIdx];
    const academyDiscount = (!isF1 && G.academy) ? 0.50 : 1.0;
    const rawCost = seatCost;
    seatCost = Math.round(seatCost * academyDiscount);
    */
    let seatCost = 0;
    const rawCost = 0;

    // F1 salary (kept from original)
    const salary = [30000, 80000, 150000, 300000, 500000, 2000000][G.catIndex];
    let salarySpin = Math.round(salary * (0.8 + Math.random() * 0.6) / 10000) * 10000;
    if (G.upgrades.includes('agent')) salarySpin = Math.round(salarySpin * 1.15);

    // const canAfford = isF1 || G.money >= seatCost;
    const canAfford = true;
    const probIdx = clamp(team.stars - 1, 0, 4);
    const isRegChange = cat === 'F1' && G.lastRegChangeYear === (G.year - 1);
    const stars = isRegChange ? '❓❓❓❓❓' : '★'.repeat(team.stars) + '☆'.repeat(5 - team.stars);
    // F1 contracts last 2-3 years
    const contractYears = isF1 ? (Math.random() < 0.5 ? 2 : 3) : 1;
    const contractLabel = isF1 ? `📋 Contrato: ${contractYears} temporadas` : '';
    const salaryTotal = isF1 ? `Total: ${fmt$(salarySpin * contractYears)}` : '';

    const reqRep = isRegChange ? '❓' : getTeamRequirements(team.stars, G.catIndex).rep;
    const reqOvr = isRegChange ? '❓' : getTeamRequirements(team.stars, G.catIndex).ovr;

    const isRenewal = (G.team && team.name === G.team.name);
    const prevChamp = (G.lastResult && G.lastResult.cat === 'F1') ? G.lastResult.champ : 20;
    // We mark it as opportunity if we are champion, it's a 5 star team, and it's NOT our renewal team (unless we want to?)
    const isOpportunity = (prevChamp === 1 && team.stars === 5 && !isRenewal);

    let badges = '';
    if (isRenewal) badges += '<span class="badge badge-green" style="font-size:10px;margin-left:6px;vertical-align:middle">Renovación</span>';
    if (isOpportunity) badges += '<span class="badge" style="background-color:#fbbf24;color:#000;font-size:10px;margin-left:6px;vertical-align:middle;padding:2px 6px;border-radius:4px;font-weight:bold">OPORTUNIDAD</span>';
    if (G._nemesisSeatTarget && team.name === G._nemesisSeatTarget) badges += '<span class="badge" style="background-color:var(--danger);color:#fff;font-size:10px;margin-left:6px;vertical-align:middle;padding:2px 6px;border-radius:4px;font-weight:bold">⚔️ CODICIADO</span>';
    
    let prospectiveTeammate = null;
    let prospectiveSkill = null;
    let isNemesisTeammate = false;
    if (isF1 && G.aiRoster) {
      let teamDrivers = G.aiRoster.filter(d => d.cat === 'F1' && d.team === team.name);
      
      if (G._nemesisSeatTarget && team.name === G._nemesisSeatTarget && G.nemesis) {
        teamDrivers = teamDrivers.filter(d => d.id !== G.nemesis.id);
      }
      
      if (teamDrivers.length > 0) {
        // Sort highest skill first
        teamDrivers.sort((a,b) => b.skill - a.skill);
        let ptDriver = teamDrivers[0];
        
        // If nemesis is in this team, they will ALWAYS be the teammate
        if (G.nemesis) {
          const nemInTeam = teamDrivers.find(d => d.id === G.nemesis.id);
          if (nemInTeam) {
            ptDriver = nemInTeam;
            isNemesisTeammate = true;
          }
        }
        
        prospectiveTeammate = ptDriver.name;
        prospectiveSkill = Math.round(ptDriver.skill);
      }
    }

    if (prospectiveTeammate) {
      const badgeColor = isNemesisTeammate ? '#ef4444' : '#6366f1';
      badges += `<span class="badge" style="background-color:${badgeColor};color:#fff;font-size:10px;margin-left:6px;vertical-align:middle;padding:2px 6px;border-radius:4px;font-weight:bold;text-transform:uppercase;">Compañero: ${prospectiveTeammate} (${prospectiveSkill})</span>`;
    }

    const c = document.createElement('div');

    if (isF1) {
      // ── F1: Holographic premium card ──
      c.className = 'card offer-card selectable holo-card' + (isOpportunity ? ' opportunity' : '');
      const color = TEAM_COLORS[team.name] || 'var(--accent)';
      c.style.setProperty('--team-color', color);

      const logoHtml = team.logo
        ? `<div style="width:56px;height:48px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:4px;box-shadow:inset 0 0 5px rgba(0,0,0,0.3)"><img src="${team.logo}" alt="${team.name}" style="max-width:48px;max-height:38px;object-fit:contain"></div>`
        : `<div style="width:56px;height:48px;border-radius:8px;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🏎️</div>`;

      c.innerHTML = `
        <div class="holo-content">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:12px">
              ${logoHtml}
              <div>
                <div class="heading" style="font-size:20px; text-shadow: 0 0 8px var(--team-color)">${team.name} ${badges}</div>
                <div style="font-size:12px;color:var(--muted);margin-top:2px">📍 ${cat} | Req: ⭐ ${reqRep} / OVR ${reqOvr}</div>
                ${team.focus ? `<div style="font-size:12px;margin-top:2px;color:${team.focus === 'desarrollo' ? '#60a5fa' : team.focus === 'ganar' ? '#f87171' : '#facc15'}">${team.focus === 'desarrollo' ? '📚 Prioriza desarrollo' : team.focus === 'ganar' ? '🏆 Prioriza ganar' : '⚖️ Equilibrado'}</div>` : ''}
              </div>
            </div>
            <div class="offer-star">${stars}</div>
          </div>
          <hr class="thin" style="margin: 10px 0; border-color: rgba(255,255,255,0.05)">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <div style="font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:1px">Sueldo Anual</div>
              <div style="font-family:'Barlow Condensed', sans-serif; font-size:22px; font-weight:bold; color:var(--green); text-shadow: 0 0 5px rgba(74,232,122,0.3)">${fmt$(salarySpin)}</div>
              ${salaryTotal ? `<div style="font-size:11px; color:var(--muted); margin-top:2px">${salaryTotal}</div>` : ''}
            </div>
            <div style="text-align:right">
              <div style="font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:1px">Contrato</div>
              <div style="font-size:14px; font-weight:bold; color:var(--accent); margin-top:4px">${contractLabel ? contractLabel.replace('⏳ Contrato: ', '') : '1 temporada'}</div>
              <div style="font-size:11px; color:var(--muted); margin-top:6px">Prob. Ganar: <span style="color:#fff">${isRegChange ? '❓' : WIN_PROBS[probIdx]}</span></div>
            </div>
          </div>
        </div>
      `;

    } else {
      // 🏎️ Formativas: Pay-to-Drive layout
      c.className = 'card offer-card selectable' + (!canAfford ? ' disabled' : '');
      if (!canAfford) {
        c.style.opacity = '0.5';
        c.style.cursor = 'not-allowed';
      }
      const logoHtml = team.logo
        ? `<div style="width:56px;height:48px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:4px"><img src="${team.logo}" alt="${team.name}" style="max-width:48px;max-height:38px;object-fit:contain"></div>`
        : `<div style="width:56px;height:48px;border-radius:8px;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🏎</div>`;
      const discountHtml = (G.academy && rawCost > seatCost)
        ? `<span style="text-decoration:line-through;color:var(--muted);font-size:14px;margin-right:6px">${fmt$(rawCost)}</span>`
        : '';
      const affordHtml = !canAfford
        ? `<div style="margin-top:6px;padding:4px 8px;border-radius:4px;background:rgba(239,68,68,0.15);color:var(--fail);font-size:11px;font-weight:bold">⛔ Fondos insuficientes</div>`
        : '';
      c.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:12px">
            ${logoHtml}
            <div>
              <div class="heading" style="font-size:20px">${team.name} ${badges}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">🏎️ ${cat} | Req: 🏆 ${reqRep} / OVR ${reqOvr}</div>
              ${team.focus ? `<div style="font-size:12px;margin-top:2px;color:${team.focus === 'desarrollo' ? '#60a5fa' : team.focus === 'ganar' ? '#f87171' : '#facc15'}">${team.focus === 'desarrollo' ? '📈 Prioriza desarrollo' : team.focus === 'ganar' ? '🏁 Prioriza ganar' : '⚖️ Equilibrado'}</div>` : ''}
            </div>
          </div>
          <div class="offer-star">${stars}</div>
        </div>
        <!-- [DESACTIVADO A PEDIDO DEL JUGADOR: Asientos formativos gratis]
        <div class="result-row" style="padding:8px 0;border-color:var(--border)">
          <div class="r-label">💸 Costo del asiento</div>
          <div class="r-val" style="font-size:17px;color:var(--fail)">${discountHtml}${fmt$(seatCost)}${G.academy ? ' <span style="font-size:11px;color:var(--success)">(-50% academia)</span>' : ''}</div>
        </div>
        -->
        <div class="result-row" style="padding:8px 0;border-color:transparent">
          <div class="r-label">Prob. de ganar</div>
          <div class="offer-prob">${isRegChange ? '❓' : WIN_PROBS[probIdx]}</div>
        </div>
        ${affordHtml}
      `;
    }
    c.onclick = () => {
      if (!canAfford) return; // Locked — not enough money
      if (!isF1) {
        // Pay-to-drive: deduct seat cost
        G.money -= seatCost;
        G.totalMoney -= seatCost; // doesn't count as earnings
      } else {
        // F1: add signing bonus (10% of salary)
        G.money += Math.round(salarySpin * 0.1);
        G.totalMoney += Math.round(salarySpin * 0.1);
      }
      if (G.team && team.name === G.team.name) {
        G.renewalsCount++;
        G.nonRenewalsCount = 0;
      } else {
        G.nonRenewalsCount++;
        G.renewalsCount = 0;
      }
      const oldTeamName = G.team ? G.team.name : null;
      if (G._nemesisSeatTarget === team.name) {
        G._stoleNemesisSeatThisYear = true;
      }
      G.team = team;
      G.academyPromisedTeam = null;
      G._nemesisSeatTarget = null; // Clear seat steal target once signed
      
      const wasInF1 = G.seasons.length > 0 && G.seasons[G.seasons.length - 1].cat === 'F1';
      
      if (isF1 && G.academy) {
        const academyObj = ACADEMIES.find(a => a.id === G.academy);
        if (academyObj) {
          if (academyObj.f1Teams[0] === team.name) {
            G._seasonEventLogs = G._seasonEventLogs || [];
            G._seasonEventLogs.push(`🎓 ¡Te has graduado de la ${academyObj.name}! Al firmar con el equipo principal, ya no eres un piloto junior, sino una estrella consagrada de la Fórmula 1.`);
            G.academy = null;
            if (!wasInF1) {
              G.pendingAcademyInterview = 'f1_academy_sign_main';
              G.achievementsProgress = G.achievementsProgress || {};
              G.achievementsProgress['academy_straight_to_main'] = true;
            }
            updateTopBar();
          } else if (academyObj.f1Teams.slice(1).includes(team.name)) {
            // Firmó con el equipo filial
            if (!wasInF1) G.pendingAcademyInterview = 'f1_academy_sign_filial';
          } else {
            // Firmó con otro equipo de F1 por fuera de la academia
            if (!wasInF1) G.pendingAcademyInterview = 'f1_academy_leave';
            G.academy = null;
            updateTopBar();
          }
        }
      }
      if (isF1) {
        G.f1ContractYearsLeft = contractYears - 1;
        G.f1ContractH2HWins = 0;
    G.f1ContractH2HLosses = 0;
      }
      
      if (isF1) {
        refreshTeammate(oldTeamName !== null && oldTeamName !== team.name);
        
        // Handle the AI driver that the player just displaced from their new team
        if (G.aiRoster && team.name) {
          const newTeamDrivers = G.aiRoster.filter(d => d.cat === 'F1' && d.team === team.name);
          // If there are 2 AIs in this team, one is the peer, the other is displaced
          if (newTeamDrivers.length > 1) {
            const displaced = newTeamDrivers.find(d => !G.peer || d.id !== G.peer.id);
            if (displaced) {
              if (wasInF1 && oldTeamName && oldTeamName !== team.name) {
                // Swap them into the seat the player just vacated
                displaced.team = oldTeamName;
                const stars = TEAMS['F1'].find(t => t.name === oldTeamName)?.stars || 3;
                displaced.contractYearsLeft = Math.floor(Math.random() * (stars >= 4 ? 4 : 2)) + 2;
              } else if (!wasInF1 || oldTeamName === team.name) {
                // Player came from F2, so F1 was full. The displaced driver is out.
                G.aiRoster = G.aiRoster.filter(d => d.id !== displaced.id);
              }
            }
          }
        }
        G._stoleNemesisSeatThisYear = false; // Reset the flag
      }
      if (isLockedShadowMarket) {
        // The secret pre-contract is now official — set up next season's "was it worth it" reveal
        G._shadowVerdictPending = true;
        G._shadowSecretTeam = null;
      }
      
      const finishLogic = () => {
        updateTopBar();
        processNextStep();
      };
      
      if (isF1) {
        c.style.overflow = 'hidden';
        const stamp = document.createElement('div');
        stamp.textContent = 'FIRMADO';
        stamp.className = 'contract-stamp';
        c.appendChild(stamp);
        
        requestAnimationFrame(() => {
          stamp.classList.add('stamped');
          c.classList.add('stamp-shake');
          setTimeout(finishLogic, 700);
        });
      } else {
        finishLogic();
      }
    };
    list.appendChild(c);
  });

  if (isAcademyLocked) {
    const academy = ACADEMIES.find(a => a.id === G.academy);
    const breakBtn = document.createElement('div');
    breakBtn.className = 'card offer-card selectable';
    breakBtn.style.border = '1px solid var(--danger)';
    breakBtn.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:56px;height:48px;border-radius:8px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">✂️</div>
          <div>
            <div class="heading" style="font-size:18px;color:var(--danger)">Romper contrato con la academia ${academy.name}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">Ver ofertas de TODOS los equipos (${academy.name} no se lo va a tomar bien)</div>
          </div>
        </div>
      </div>
    `;
    breakBtn.onclick = () => {
      G.academyBans = G.academyBans || [];
      G.academyBans.push(G.academy);
      G.academy = null;
      G.academyWarnings = 0;
      updateTopBar();
      // Reload contracts screen without academy restriction
      showContracts();
    };
    list.appendChild(breakBtn);
  }

  if (G.age >= 34) {
    const retBtn = document.createElement('button');
    retBtn.className = 'btn btn-secondary';
    retBtn.style.width = '100%';
    retBtn.style.marginTop = '16px';
    retBtn.style.border = '1px solid var(--danger)';
    retBtn.style.color = 'var(--danger)';
    retBtn.innerHTML = '🏁 Retirarse y ver legado';
    retBtn.onclick = () => { showRetirement(); };
    list.appendChild(retBtn);
  }

  goto('screen-contracts');
}

// ═══════════════════════════════════════════════════════════
//  UPGRADES SCREEN
// ═══════════════════════════════════════════════════════════
function formatAbbrev(num) {
  if (num >= 1000000) return 'US$ ' + (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1000) return 'US$ ' + (num / 1000).toFixed(0) + 'K';
  return 'US$ ' + num;
}

function buildUpgradesScreen() {
  const el = document.getElementById('upgrades-list');
  document.getElementById('upgrade-money').textContent = fmt$(G.money);
  el.innerHTML = '';

  const tiers = [
    { id: 'lujo', title: '💎 Estilo de Vida (Lujo)' },
    { id: 'staff', title: '👔 Personal Exclusivo (Staff)' },
    { id: 'basica', title: '🔧 Mejoras de Rendimiento (Básicas)' }
  ];

  tiers.forEach(tier => {
    const tierUpgrades = UPGRADES.filter(u => u.tier === tier.id);
    if (tierUpgrades.length === 0) return;

    
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = 'font-size:16px; font-weight:bold; color:var(--text); margin-top:20px; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:4px;';
      titleDiv.textContent = tier.title;
      el.appendChild(titleDiv);


    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = tier.id === 'lujo' ? '1fr' : 'repeat(2, 1fr)';
    grid.style.gap = '10px';
    grid.style.marginBottom = '20px';

    tierUpgrades.forEach(u => {
      const owned = G.upgrades.includes(u.id);
      const canBuy = !owned && G.money >= u.cost;
      
      const item = document.createElement('div');
      item.className = 'upgrade-item tier-' + u.tier + (owned ? ' owned' : '');
      item.style.margin = '0';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.cursor = owned ? 'default' : (canBuy ? 'pointer' : 'not-allowed');
      if (!owned && canBuy) {
          item.onclick = (e) => {
            const card = e.currentTarget;
            card.style.pointerEvents = 'none'; // prevent double click
            card.classList.add('result-success'); // Reuse the green flash animation
            
            const priceEl = card.querySelector('.upg-price');
            if (priceEl) {
              priceEl.textContent = '✔ Adquirido';
              priceEl.style.opacity = '0.5';
            }
            
            // Apply purchase
            G.money -= u.cost;
            G.upgrades.push(u.id);
            for (const [k, v] of Object.entries(u.stats)) G.stats[k] = Math.min(99, G.stats[k] + v);
            updateTopBar();
            checkAchievements();
            
            // Wait for animation before rebuilding UI
            setTimeout(() => {
              buildUpgradesScreen();
            }, 500);
          };
      }
      
      item.innerHTML = `
        <div style="display:flex; align-items:flex-start; margin-bottom:8px; width:100%;">
          <div class="upgrade-icon" style="font-size:24px; margin-right:12px; filter: drop-shadow(0 0 4px rgba(255,255,255,0.1));">${u.icon}</div>
          <div class="upgrade-info" style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <h4 style="margin:0; font-size:14px;">${u.name}</h4>
              <div class="upg-price" style="font-size:12px; font-weight:bold; color:var(--text); opacity: ${owned ? 0.5 : 1}; margin-left:8px;">${owned ? '✔ Adquirido' : formatAbbrev(u.cost)}</div>
            </div>
            <p style="margin:0; font-size:11px; opacity:0.7; line-height:1.4;">${u.desc}</p>
          </div>
        </div>
      `;
      grid.appendChild(item);
    });
    
    el.appendChild(grid);
  });
}

// override goto to build upgrades dynamically
const _origGoto = goto;
window.goto = function (id) {
  if (id === 'screen-upgrades') buildUpgradesScreen();
  _origGoto(id);
};

// ═══════════════════════════════════════════════════════════
//  RETIREMENT
// ═══════════════════════════════════════════════════════════
function showRetirement(reason = null) {
  G.isRetired = true;
  G._retirementReason = reason;
  checkAchievements('retirement');
  document.getElementById('ret-name').textContent = `${G.flag} ${G.name}`;
  const startYear = G.seasons[0]?.year || G.year;
  document.getElementById('ret-years').textContent = `${startYear} — ${G.year}`;

  // Legacy
  const totalWins = G.wins;
  const f1Seasons = G.seasons.filter(s => s.cat === 'F1').length;
  let legacyClass, legacyIcon, legacyTitle, legacyCompare;
  
  // Apply personality descriptors
  let persText = '';
  if (G.personality.aggressiveness > 40) persText += 'Agresivo y temerario. ';
  else if (G.personality.aggressiveness < -40) persText += 'Limpio y calculador. ';
  if (G.personality.media > 40) persText += 'Un ídolo de las masas y la TV. ';
  else if (G.personality.media < -40) persText += 'Alejado de los micrófonos, enfocado en la pista. ';
  if (G.personality.team > 40) persText += 'Un verdadero jugador de equipo. ';
  else if (G.personality.team < -40) persText += 'Egoísta y despiadado con sus compañeros. ';

  if (totalWins === 0 && f1Seasons === 0) { 
    legacyClass = 'legacy-promise'; legacyIcon = '🌱'; legacyTitle = 'Promesa'; 
    legacyCompare = 'Como muchos talentos que no lograron dar el salto.';
  } else if (f1Seasons > 0 && G.f1Titles === 0 && totalWins < 10) { 
    legacyClass = 'legacy-good'; legacyIcon = '🏅'; legacyTitle = 'Piloto de F1'; 
    legacyCompare = 'Recordando a pilotos como Nico Hülkenberg o Romain Grosjean, sólidos pero sin la corona.';
  } else if (G.f1Titles === 0 && totalWins >= 10) {
    legacyClass = 'legacy-champion'; legacyIcon = '💎'; legacyTitle = 'Rey sin Corona';
    legacyCompare = 'Al nivel de Stirling Moss o Gilles Villeneuve, leyendas eternas sin título mundial.';
  } else if (G.f1Titles === 1) { 
    legacyClass = 'legacy-champion'; legacyIcon = '🏆'; legacyTitle = 'Campeón del Mundo'; 
    legacyCompare = 'A la par de Jenson Button o Nico Rosberg. Alcanzaste la cima absoluta.';
  } else if (G.f1Titles === 2) {
    legacyClass = 'legacy-champion'; legacyIcon = '🏆'; legacyTitle = 'Bicampeón'; 
    legacyCompare = 'En la mesa de Mika Häkkinen y Fernando Alonso. Talento generacional.';
  } else if (G.f1Titles === 3 || G.f1Titles === 4) {
    legacyClass = 'legacy-legend'; legacyIcon = '⭐'; legacyTitle = 'Leyenda'; 
    legacyCompare = 'Un histórico como Ayrton Senna, Alain Prost o Sebastian Vettel.';
  } else if (G.f1Titles >= 5 && G.f1Titles <= 7) {
    legacyClass = 'legacy-legend'; legacyIcon = '👑'; legacyTitle = 'Mito de la F1'; 
    legacyCompare = 'A la altura de Juan Manuel Fangio, Michael Schumacher y Lewis Hamilton.';
  } else {
    legacyClass = 'legacy-legend'; legacyIcon = '🐐'; legacyTitle = 'El Mejor de Todos los Tiempos'; 
    legacyCompare = 'Incomparable. Destrozaste todos los récords de la historia de la Fórmula 1.';
  }

  // Sobreescribir con apodos dinámicos si aplican
  if (G.wasEscudero) {
    if (G.f1Titles === 0) {
      legacyClass = 'legacy-good'; legacyIcon = '🛡️'; legacyTitle = 'El Escudero';
      legacyCompare = 'Fiel compañero, sacrificaste tus propias chances de gloria para asegurar campeonatos de equipo y de tu rival.';
    } else {
      legacyClass = 'legacy-champion'; legacyIcon = '⚔️'; legacyTitle = 'El Heredero';
      legacyCompare = 'Después de años a la sombra como escudero, reclamaste el trono y demostraste que eras un campeón por derecho propio.';
    }
  }

  G._legacyTitle = legacyTitle;
  G._legacyClass = legacyClass;

  document.getElementById('ret-legacy-banner').innerHTML = `
    <div class="legacy-banner ${legacyClass}" style="padding: 20px; border-radius: 12px; text-align: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1)">
      <div class="legacy-icon" style="font-size: 48px; margin-bottom: 8px">${legacyIcon}</div>
      <div class="legacy-title" style="font-size: 24px; font-weight: bold; margin-bottom: 8px">${legacyTitle}</div>
      <div style="font-size: 14px; color: var(--muted); font-style: italic">${legacyCompare}</div>
    </div>
  `;

  if (persText) {
      document.getElementById('ret-legacy-banner').insertAdjacentHTML('afterend', `<div class="card mb-16" style=";background:rgba(74, 144, 232, 0.1);border-color:var(--blue);text-align:center"><div style="font-size:14px;color:var(--blue);margin-bottom:4px;font-weight:bold;letter-spacing:1px">PERFIL DEL PILOTO</div><div style="font-size:15px">${persText}</div></div>`);
  }

  const f1TeamsData = [];
    G.seasons.filter(s => s.cat === 'F1').forEach(s => {
      if (!f1TeamsData.some(t => t.name === s.teamName)) {
        f1TeamsData.push({ name: s.teamName, logo: s.teamLogo });
      }
    });
    const teamsHtml = f1TeamsData.length > 0 
      ? f1TeamsData.map(t => (t.logo ? `<img src="${t.logo}" title="${t.name}" style="height:20px; width:20px; object-fit:contain; margin-right:4px; border-radius:2px">` : `<span style="font-size:12px; margin-right:4px">${t.name}</span>`)).join('') 
      : 'Ninguno';

    document.getElementById('ret-stats-rows').innerHTML = `
      <div class="result-row"><div class="r-label">Años activos</div><div class="r-val">${G.seasons.length}</div></div>
      <div class="result-row"><div class="r-label">Equipos F1</div><div class="r-val" style="display:flex; align-items:center; flex-wrap:wrap">${teamsHtml}</div></div>
      <div class="result-row"><div class="r-label">Victorias</div><div class="r-val">${G.wins}</div></div>
    <div class="result-row"><div class="r-label">Podios</div><div class="r-val">${G.podiums}</div></div>
    <div class="result-row"><div class="r-label">Poles</div><div class="r-val">${G.poles}</div></div>
    <div class="result-row"><div class="r-label">Abandonos</div><div class="r-val">${G.dnfs}</div></div>
    <div class="result-row"><div class="r-label">Dinero total</div><div class="r-val">${fmt$(G.totalMoney)}</div></div>
  `;

  const f1Teams = G.seasons.filter(s => s.cat === 'F1').map(s => s.teamName);
  const bestSeason = G.careerBest;
  const f1TitlesHtml = G.f1Titles > 0
    ? `<div class="result-row"><div class="r-label">🏆 Títulos de F1</div><div class="r-val good">${G.f1Titles}</div></div>`
    : '';
  const epicTitlesHtml = G.epicTitles > 0
    ? `<div class="result-row"><div class="r-label" style="color:#c084fc">💎 Títulos Épicos</div><div class="r-val" style="color:#c084fc;font-weight:bold">${G.epicTitles}</div></div>`
    : '';
  document.getElementById('ret-history-rows').innerHTML = `
    <div class="result-row"><div class="r-label">Mejor temporada</div><div class="r-val">${bestSeason ? bestSeason.year : '—'}</div></div>
    <div class="result-row"><div class="r-label">Llegó a F1</div><div class="r-val">${f1Seasons > 0 ? 'Sí ✓' : 'No'}</div></div>
    <div class="result-row"><div class="r-label">Temporadas F1</div><div class="r-val">${f1Seasons}</div></div>
    ${f1TitlesHtml}
    ${epicTitlesHtml}
  `;

  // Timeline
  let timelineHtml = '';
  
  if (f1Seasons > 0) {
    // Build the living Hall of Champions table
    const champMap = Object.assign({}, G.aiChampions || {});
    if (G.f1Titles > 0) champMap[G.name] = G.f1Titles;
    const champList = Object.entries(champMap)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        if (a[0] === G.name) return -1;
        if (b[0] === G.name) return 1;
        return 0;
      })
      .slice(0, 6);
    const maxTitles = champList[0] ? champList[0][1] : 1;
    const champRows = champList.map(([name, titles], i) => {
      const isPlayer = name === G.name;
      const bar = Math.round((titles / maxTitles) * 100);
      const color = isPlayer ? 'var(--accent)' : titles >= 7 ? '#ffd700' : titles >= 5 ? '#c084fc' : titles >= 3 ? '#60a5fa' : 'var(--muted)';
      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
          <div style="width:28px;text-align:center;font-size:15px">${medal}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:${isPlayer?'bold':'normal'};color:${isPlayer?'var(--accent)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isPlayer ? '🏁 ' : ''}${name}</div>
            <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:4px;overflow:hidden">
              <div style="height:100%;width:${bar}%;background:${color};border-radius:2px"></div>
            </div>
          </div>
          <div style="font-size:16px;font-weight:bold;color:${color};min-width:36px;text-align:right">${titles}🏆</div>
        </div>`;
    }).join('');
    const champHtml = `
      <div class="section-title">🏆 Top Campeones de la Historia</div>
      <div class="card" style="margin-bottom:24px;padding:8px 16px">
        ${champRows || '<div style="color:var(--muted);text-align:center;padding:12px">Sin datos aún.</div>'}
      </div>
    `;
    document.getElementById('ret-history-rows').parentElement.insertAdjacentHTML('afterend', champHtml);
  }
  G.seasons.forEach(s => {
    let positionColor = '';
    if (s.champ === 1) positionColor = 'color: #ffd700;'; // Oro
    else if (s.champ === 2) positionColor = 'color: #c0c0c0;'; // Plata
    else if (s.champ === 3) positionColor = 'color: #cd7f32;'; // Bronce

    const logoHtml = s.teamLogo ? `<img src="${s.teamLogo}" style="height:20px; width:20px; object-fit:contain; margin-right:8px" />` : '';

    timelineHtml += `
      <div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="width:60px;font-weight:600;color:var(--text)">${s.year}</div>
        <div style="flex-grow:1">
          <div style="font-size:14px;color:var(--text);display:flex;align-items:center">${logoHtml}${s.teamName} <span style="color:var(--muted);font-size:12px;margin-left:4px">(${s.cat})</span></div>
          <div style="font-size:12px;color:var(--muted)">Victorias: ${s.wins} | Podios: ${s.podiums}</div>
        </div>
        <div style="font-size:16px;font-weight:bold;${positionColor}">${s.champ}°</div>
      </div>
    `;
  });
  document.getElementById('ret-timeline-rows').innerHTML = timelineHtml;

  goto('screen-retirement');
}

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
function average(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
// ─────────────────────────────────────────────
//  NEMESIS SYSTEM
// ─────────────────────────────────────────────
const NEMESIS_ORIGIN_MESSAGES = [
  n => `En la vuelta de regreso a boxes, despues de una carrera, ${n} emparejó su auto con el tuyo y te hizo un gesto agresivo. Las declaraciones cruzadas de todo el año acaban de explotar. La prensa lo tiene claro: esto es personal.`,
  n => `En la conferencia de prensa, ${n} se giró hacia las cámaras y dijo: "Hay pilotos en esta categoría que no deberían estar acá". Todos saben a quién se refería. La guerra acaba de empezar.`,
  n => `Después de la última carrera, ${n} se bajó del podio antes de que pudieras subir y se fue al motorhome sin saludarte. El jefe de tu equipo sacudió la cabeza. Esto ya tiene nombre.`,
  n => `Una fuente anónima filtró a la prensa que ${n} fue a la dirección para que te sancionaran por una maniobra. No lo consiguió, pero el mensaje fue claro.`,
  n => `Después de que lo adelantaras con una maniobra audaz en la última curva, ${n} tiró el casco contra el suelo en los boxes. El mundo del motor habla solo de eso.`,
];

function addNemesisHeat(driver, amount) {
  if (!driver) return;
  if (G.nemesis) return; // Already fixed, no more accumulation
  if (!G.nemesisHeat) G.nemesisHeat = {};
  G.nemesisHeat[driver.id] = (G.nemesisHeat[driver.id] || 0) + amount;
  if (G.nemesisHeat[driver.id] >= 100) {
    checkNemesisBorn(driver);
  }
}

function checkNemesisBorn(driver) {
  if (G.nemesis) return;
  G.nemesis = { id: driver.id, name: driver.name, h2hWins: 0, h2hLosses: 0, retired: false, cat: driver.cat || '' };
  
  if (G.peer && G.peer.id === driver.id) {
    G.peer.relationship = -100;
  }
  
  if (G.academy && Math.random() < 0.25) G.nemesis.academy = G.academy;
  const msgFn = NEMESIS_ORIGIN_MESSAGES[Math.floor(Math.random() * NEMESIS_ORIGIN_MESSAGES.length)];
  G._seasonSteps = G._seasonSteps || [];
  G._seasonSteps.unshift('nemesis_born:' + driver.id);
  updateTopBar();
}

function getNemesisDriver() {
  if (!G.nemesis || !G.aiRoster) return null;
  return G.aiRoster.find(d => d.id === G.nemesis.id) || null;
}

function fmt$(n) { return '$' + Math.round(n).toLocaleString('es-AR'); }

// ═══════════════════════════════════════════════════════════
//  HALL OF FAME
// ═══════════════════════════════════════════════════════════

function endCareerAndSave() {
  const hofStr = localStorage.getItem('f1_hall_of_fame');
  const hof = hofStr ? JSON.parse(hofStr) : [];
  
  const f1Teams = G.seasons.filter(s => s.cat === 'F1');
  const bestTeam = f1Teams.length > 0 ? f1Teams[f1Teams.length - 1].teamName : (G.seasons[G.seasons.length - 1]?.teamName || 'Ninguno');

  const profile = {
    name: G.name,
    nickname: G.nickname,
    number: G.number,
    flag: G.flag,
    f1Titles: G.f1Titles,
    wins: G.wins,
    podiums: G.podiums,
    poles: G.poles,
    reputation: G.reputation,
    legacyTitle: G._legacyTitle || 'Piloto',
    legacyClass: G._legacyClass || 'legacy-promise',
    bestTeam: bestTeam,
    date: new Date().toLocaleDateString(),
    peerName: G.peer ? G.peer.name : null,
    peerWins: G.peer ? G.peer.h2hLosses : 0, // from player perspective: peer's losses are player's wins
    peerLosses: G.peer ? G.peer.h2hWins : 0
  };

  hof.push(profile);
  localStorage.setItem('f1_hall_of_fame', JSON.stringify(hof));

  location.reload();
}

function showHallOfFame() {
  const hofStr = localStorage.getItem('f1_hall_of_fame');
  const hof = hofStr ? JSON.parse(hofStr) : [];
  
  // Sort by reputation descending
  hof.sort((a, b) => b.reputation - a.reputation);

  const list = document.getElementById('hof-list');
  if (hof.length === 0) {
    list.innerHTML = `<div style="text-align:center;color:var(--muted);margin-top:40px;font-style:italic">El Salón de la Fama está vacío. Jugá una carrera hasta el retiro para aparecer acá.</div>`;
  } else {
    list.innerHTML = '';
    hof.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '12px';
      
      let rankIcon = '';
      if (idx === 0) rankIcon = '🥇';
      else if (idx === 1) rankIcon = '🥈';
      else if (idx === 2) rankIcon = '🥉';
      else rankIcon = `#${idx + 1}`;

      const nameDisplay = p.nickname ? `${p.flag} ${p.name} "${p.nickname}" #${p.number}` : `${p.flag} ${p.name} #${p.number}`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div style="display:flex; align-items:center; gap:8px">
            <span style="font-size:24px; font-weight:bold; width:30px; text-align:center; color:var(--muted)">${rankIcon}</span>
            <div>
              <div class="heading" style="font-size:18px">${nameDisplay}</div>
              <div style="font-size:13px; color:var(--muted)">${p.legacyTitle} | Equipo: ${p.bestTeam}</div>
            </div>
          </div>
          <div class="legacy-banner ${p.legacyClass}" style="padding: 4px 8px; border-radius: 4px; font-size:12px; font-weight:bold;">Rep: ${p.reputation}</div>
        </div>
        <div style="display:flex; gap:16px; font-size:13px; color:var(--text); padding-top:8px; border-top:1px solid var(--border)">
          <div>🏆 Mundiales: <strong>${p.f1Titles}</strong></div>
          <div>🏁 Victorias: <strong>${p.wins}</strong></div>
          <div>🍾 Podios: <strong>${p.podiums}</strong></div>
          <div>⏱️ Poles: <strong>${p.poles}</strong></div>
        </div>
        ${p.peerName ? `<div style="font-size:12px; color:var(--muted); padding-top:8px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05)">⚔️ Último compañero: <strong>${p.peerName}</strong> (H2H: ${p.peerWins} a ${p.peerLosses})</div>` : ''}
    `;
    list.appendChild(card);
  });
  }
  
  goto('screen-hof');
}

// ═══════════════════════════════════════════════════════════
//  PEER (COMPAÑERO / RIVAL GENERACIONAL)
// ═══════════════════════════════════════════════════════════

const FIRST_NAMES = ["Oliver", "Jack", "Harry", "Jacob", "Charlie", "Thomas", "George", "Oscar", "James", "William", "Noah", "Leo", "Lucas", "Mateo", "Alex", "David", "Juan", "Pedro", "Pablo", "Diego", "Carlos", "Luis", "Fernando", "Jorge", "Javier", "Arthur", "Louis", "Jules", "Hugo", "Enzo", "Max", "Lando", "Charles", "Pierre", "Esteban", "Yuki", "Kevin", "Nico", "Lance", "Logan", "Valtteri", "Guanyu"];
const EMOJI_AVATARS = ['👨🏻', '🧔🏽‍♂️', '👱🏼‍♂️', '🧑🏾‍🦲', '👨🏽', '🧔🏼‍♂️', '👱🏻‍♂️', '👨🏼‍🦱', '👱🏽', '👦🏻', '👦🏽', '🧔🏻', '👨🏾‍🦲'];
const LAST_NAMES = ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Wood", "Jackson", "Clarke", "García", "Martínez", "López", "González", "Rodríguez", "Fernández", "Pérez", "Gómez", "Sánchez", "Romero", "Sosa", "Torres", "Álvarez", "Ruiz", "Ramírez", "Flores", "Benítez", "Acosta", "Medina", "Herrera", "Suárez", "Dupont", "Dubois", "Lefebvre", "Leroy", "Roux", "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker"];

function refreshTeammate(playerChangedTeam = false) {
  if (!G.aiRoster || !G.team) return;
  let catDrivers = G.aiRoster.filter(d => d.cat === 'F1' && d.team === G.team.name);
  if (catDrivers.length === 0) { G.peer = null; return; }

  // If the player explicitly stole the nemesis's seat, exclude the nemesis from being a candidate for teammate
  if (G._stoleNemesisSeatThisYear && G.nemesis) {
    catDrivers = catDrivers.filter(d => d.id !== G.nemesis.id);
    if (catDrivers.length === 0) { G.peer = null; return; }
  }

  // Pick highest-skill teammate
  catDrivers.sort((a, b) => b.skill - a.skill);
  let newTm = catDrivers[0];

  // If nemesis is in the team, ALWAYS pick them to avoid displacing them!
  let nemesisInTeam = null;
  if (G.nemesis) {
    nemesisInTeam = catDrivers.find(d => d.id === G.nemesis.id);
  }

  // If current peer is still in the team, keep them to avoid flip-flopping!
  const currentPeerStillInTeam = G.peer ? catDrivers.find(d => d.id === G.peer.id) : null;
  
  if (nemesisInTeam) {
    newTm = nemesisInTeam;
    if (G.peer && G.peer.id === nemesisInTeam.id) {
      G.peer.skill = nemesisInTeam.skill;
      G.peer.age = nemesisInTeam.age;
      G.peer.team = G.team.name;
      return;
    }
  } else if (currentPeerStillInTeam) {
    newTm = currentPeerStillInTeam;
    G.peer.skill = currentPeerStillInTeam.skill;
    G.peer.age = currentPeerStillInTeam.age;
    G.peer.team = G.team.name;
    return;
  }

  // Teammate changed!
  // Show the message only if the PLAYER stayed in the same team (teammate left, not player).
  // playerChangedTeam=true means the player moved, so the "old teammate" story doesn't apply.
  if (G.peer && !playerChangedTeam && G.seasons.filter(s => s.cat === 'F1').length > 0) {
     const oldPeerInRoster = G.aiRoster.find(d => d.id === G.peer.id);
     let destination = 'se retiró del automovilismo';
     if (oldPeerInRoster) {
         if (oldPeerInRoster.cat === 'F1') destination = `fichó por ${oldPeerInRoster.team}`;
         else destination = `quedó fuera de la F1 (ahora corre en ${oldPeerInRoster.cat})`;
     } else if (G.peer.age && G.peer.age <= 37) {
         const otherSeries = ['el WEC (Campeonato Mundial de Resistencia)', 'IMSA', 'el RALLY', 'la Fórmula E', 'NASCAR', 'la IndyCar'];
         destination = `dejó la F1 y se fue a competir en ${otherSeries[Math.floor(Math.random() * otherSeries.length)]}`;
     }
     
     G._pendingTeammateChangeMsg = {
         oldName: G.peer.name,
         destination: destination,
         h2hWins: G.peer.h2hLosses, // Inverted: player's wins are peer's losses
         h2hLosses: G.peer.h2hWins, // Inverted: player's losses are peer's wins
         newName: (newTm.flag || '🏳️') + ' ' + newTm.name,
         isNemesis: G.nemesis && newTm.id === G.nemesis.id
     };
  }

  // New teammate: fresh slate
  const prevName = G.peer ? G.peer.name : null;
  G.peer = {
    id: newTm.id,
    name: newTm.name,
    nat: { name: 'Unknown', flag: newTm.flag || '🏳️' },
    team: G.team.name,
    relationship: 0,
    h2hWins: 0,
    h2hLosses: 0,
    yearsAsTeammate: 0,
    skill: newTm.skill || 50,
    age: newTm.age || 20,
    avatar: newTm.avatar || EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)]
  };
  // If the new teammate IS the nemesis, freeze the relationship at war-level and add heat
  if (G.nemesis && G.peer.id === G.nemesis.id) {
    G.peer.relationship = -100;
  }
  G._lastTeammateLeft = prevName;
}

// ═══════════════════════════════════════════════════════════
//  HOLO-CARD EFFECTS
// ═══════════════════════════════════════════════════════════
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.holo-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouseX', `${x}px`);
    card.style.setProperty('--mouseY', `${y}px`);
  });
});

document.addEventListener('touchstart', e => {
  const card = e.target.closest('.holo-card');
  if (card) card.classList.add('touch-hover');
}, {passive: true});

document.addEventListener('touchend', e => {
  const card = e.target.closest('.holo-card');
  if (card) card.classList.remove('touch-hover');
}, {passive: true});

document.addEventListener('touchcancel', e => {
  const card = e.target.closest('.holo-card');
  if (card) card.classList.remove('touch-hover');
}, {passive: true});


// ═══════════════════════════════════════════════════════════
//  LOGROS (ACHIEVEMENTS)
// ═══════════════════════════════════════════════════════════
const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const TIER_LABELS = { platinum: 'Platino', gold: 'Oro', silver: 'Plata', bronze: 'Bronce' };

const ACHIEVEMENTS = [
  // Nuevos logros agregados
  { id: 'golden_boy_f1', name: 'La Gran Apuesta', desc: 'Llegaste a la Fórmula 1 a través de una oferta unica de un equipo top.', icon: '⭐', tier: 'gold', condition: () => (G.achievementsProgress || {})['golden_boy_offer'] },
  { id: 'academy_straight_to_main', name: 'El Elegido', desc: 'Subiste al equipo principal de la academia directamente desde la F2.', icon: '🪄', tier: 'gold', condition: () => (G.achievementsProgress || {})['academy_straight_to_main'] },
  { id: 'no_help_needed', name: 'No necesito ayuda', desc: 'Ganaste el campeonato del mundo tras haber rechazado la oferta de una academia.', icon: '🦾', tier: 'platinum', condition: () => G.f1Titles > 0 && (G.achievementsProgress || {})['rejected_academy'] },
  { id: 'shadow_scam', name: 'La Estafa', desc: 'Aceptaste un pre contrato y el auto resultó ser poco competitivo.', icon: '🤡', tier: 'silver', condition: () => (G.achievementsProgress || {})['shadow_scam'] },
  { id: 'shadow_success', name: 'La Decisión Correcta', desc: 'Aceptaste un pre contrato y el auto resultó ser un misil.', icon: '🔮', tier: 'silver', condition: () => (G.achievementsProgress || {})['shadow_success'] },
  { id: 'king_of_eras', name: 'El Rey de Cada Era', desc: 'Ganaste campeonatos bajo 3 reglamentos diferentes.', icon: '📜', tier: 'gold', condition: () => ((G.achievementsProgress || {})['reg_changes_won'] || []).length >= 3 },
  { id: 'look_at_me_now', name: 'Ahora Mírame', desc: 'Ganaste el campeonato mundial de F1 después de haber sido expulsado de una academia.', icon: '🔥', tier: 'gold', condition: () => G.f1Titles > 0 && (G.achievementsProgress || {})['dropped_from_academy'] },
  // Platino
  { id: 'undefeated_h2h', name: 'Imbatible en el equipo', desc: 'Terminaste tu carrera deportiva sin haber perdido nunca un duelo de compañeros.', icon: '🤝', tier: 'platinum', condition: () => G.isRetired && G.seasons.length > 0 && (G.careerH2HLosses || 0) === 0 },
  { id: 'fangio', name: 'Como Fangio!', desc: 'Ganaste el campeonato del mundo con cuatro equipos diferentes.', icon: '🏆', tier: 'platinum', condition: () => new Set(G.seasons.filter(s => s.champ === 1 && s.cat === 'F1').map(s => s.teamName)).size >= 4 },
  { id: 'goat', name: 'Máxima Gloria', desc: 'El mejor de todos los tiempos. Ganaste 8 campeonatos mundiales.', icon: '🐐', tier: 'platinum', condition: () => G.f1Titles >= 8 },
  { id: 'most_wins', name: 'El Más Ganador', desc: 'Nadie ganó más carreras que vos. Superaste las 105 victorias en F1.', icon: '🥇', tier: 'platinum', condition: () => G.seasons.filter(s => s.cat === 'F1').reduce((a, b) => a + b.wins, 0) > 105 },
  { id: 'all_cats', name: '¿Qué es eso? ¿Lo puedo ganar?', desc: 'Saliste campeón en todas las categorías (Karting, F4, FR, F3, F2 y F1).', icon: '👑', tier: 'platinum', condition: () => ['Karting', 'F4', 'Formula Regional', 'F3', 'F2', 'F1'].every(c => G.seasons.some(s => s.cat === c && s.champ === 1)) },
  { id: 'dynasty', name: 'Dinastía', desc: 'Construiste una era de dominio. Ganaste 5 campeonatos consecutivos.', icon: '🏛️', tier: 'platinum', condition: () => {
    let maxConsecutive = 0, current = 0;
    G.seasons.filter(s => s.cat === 'F1').forEach(s => {
      if (s.champ === 1) { current++; maxConsecutive = Math.max(maxConsecutive, current); }
      else { current = 0; }
    });
    return maxConsecutive >= 5;
  }},
  { id: 'from_nothing', name: 'De la Nada a la Gloria', desc: 'Te uniste a un equipo de 2 estrellas o menos y ganaste el campeonato con ellos.', icon: '🚀', tier: 'platinum', condition: () => {
    const f1Seasons = G.seasons.filter(s => s.cat === 'F1');
    const titleSeasons = f1Seasons.filter(s => s.champ === 1);
    for (const s of titleSeasons) {
      const firstYear = f1Seasons.find(fs => fs.teamName === s.teamName);
      if (firstYear && (firstYear.teamStars || 5) <= 2) return true;
    }
    return false;
  }},
  { id: 'rich', name: 'Magnate del Motor', desc: 'Acumulaste $50.000.000 en el banco.', icon: '💰', tier: 'platinum', condition: () => G.money >= 50000000 },

    { id: 'full_circle', name: 'El Círculo Completo', desc: 'Ganaste tu último campeonato con el mismo equipo con el que disputaste tu primera temporada de F1.', icon: '🏁', tier: 'platinum', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    const titles = f1s.filter(s => s.champ === 1);
    if (!G.isRetired || f1s.length === 0 || titles.length === 0) return false;
    return f1s[0].teamName === titles[titles.length - 1].teamName;
  }},

  // Oro
  { id: 'double_champ', name: 'Doble Corona', desc: 'Ganaste el Campeonato de Pilotos y el de Constructores en la misma temporada.', icon: '🏆', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 1 && s.constructorRank === 1) },
  { id: 'team_dominance', name: 'Equipo Dominador', desc: 'Tu compañero y vos terminaron 1.º y 2.º en el mundial de pilotos.', icon: '🏎️', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && ((s.champ === 1 && s.peerRank === 2) || (s.champ === 2 && s.peerRank === 1))) },
  { id: 'wonderboy', name: 'El Niño Maravilla', desc: 'Llegaste a la cima rápido. Ganaste tu primer campeonato de F1 con 24 años o menos.', icon: '🌟', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 1 && s.age <= 24) },
  { id: 'veteran', name: 'Campeón Veterano', desc: 'Ganaste el campeonato de F1 con 36 años o más.', icon: '🧓', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 1 && s.age >= 36) },
  { id: 'historic', name: 'Campeón Histórico', desc: 'Ganaste al menos el 75% de las carreras de una temporada.', icon: '🦁', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.wins / (s.races || 24) >= 0.75) },
  { id: 'mr_consistency', name: 'Mr. Consistencia', desc: 'No bajaste del podio en toda una temporada de F1.', icon: '🔥', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.podiums >= (s.races || 24)) },
  { id: 'mr_saturday', name: '¡Dejá algo para los demás!', desc: 'Conseguiste la pole en más del 70% de las carreras de una temporada.', icon: '⚡', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.poles / (s.races || 24) >= 0.70) },
  { id: 'miracle', name: 'El Milagro', desc: 'Ganaste el mundial de F1 sin tener el mejor auto (equipo de 4 estrellas o menos).', icon: '✨', tier: 'gold', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 1 && (s.teamStars || 5) <= 4) },
  { id: 'rookie_sensation', name: 'Rookie Sensation', desc: 'Terminaste en el Top 3 del campeonato en tu primera temporada de F1.', icon: '🌠', tier: 'gold', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    return f1s.length > 0 && f1s[0].champ <= 3;
  }},
  { id: 'perfect_stats', name: 'Piloto Completo', desc: 'Tenés todas las estadísticas de manejo por encima de 90.', icon: '💎', tier: 'gold', condition: () => G.stats.speed >= 90 && G.stats.quali >= 90 && G.stats.tyres >= 90 && G.stats.rain >= 90 && G.stats.overtake >= 90 },
  { id: 'one_team', name: 'Un Solo Equipo', desc: 'Completaste tu carrera de F1 en la misma escudería sin cambiar.', icon: '🏠', tier: 'gold', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    return G.isRetired && f1s.length >= 5 && new Set(f1s.map(s => s.teamName)).size === 1;
  }},
  { id: 'team_legend', name: 'Leyenda del Equipo', desc: 'Ganaste 3 o más campeonatos de F1 con el mismo equipo.', icon: '🏭', tier: 'gold', condition: () => {
    const counts = {};
    G.seasons.filter(s => s.cat === 'F1' && s.champ === 1).forEach(s => counts[s.teamName] = (counts[s.teamName] || 0) + 1);
    return Math.max(0, ...Object.values(counts)) >= 3;
  }},
  { id: 'golden_hands', name: 'Manos de Oro', desc: 'Conseguiste 3 temporadas consecutivas rindiendo por encima de las expectativas de tu equipo.', icon: '🧙', tier: 'gold', condition: () => {
    let cons = 0, maxCons = 0;
    G.seasons.filter(s => s.cat === 'F1').forEach(s => {
      const expected = 12 - (s.teamStars * 2);
      if (s.champ < expected) { cons++; maxCons = Math.max(maxCons, cons); }
      else { cons = 0; }
    });
    return maxCons >= 3;
  }},
  { id: 'never_give_up', name: 'Nunca Te Rindas', desc: 'Ganaste tu primer campeonato después de 10 o más temporadas en F1.', icon: '💪', tier: 'gold', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    const firstTitleIdx = f1s.findIndex(s => s.champ === 1);
    return firstTitleIdx >= 9; // index 9 is the 10th season
  }},
  { id: 'one_last_time', name: 'Una Última Vez', desc: 'Cerraste tu carrera ganando el campeonato en tu última temporada.', icon: '🌅', tier: 'gold', condition: () => G.isRetired && G.seasons.length > 0 && G.seasons[G.seasons.length - 1].champ === 1 },
  { id: 'so_close', name: 'Al Borde', desc: 'Terminaste 2.º o 3.º en F1 cinco veces sin ganar el título aún.', icon: '😤', tier: 'gold', condition: () => G.f1Titles === 0 && G.seasons.filter(s => s.cat === 'F1' && (s.champ === 2 || s.champ === 3)).length >= 5 },
  { id: 'god_mode', name: 'Estadística al Máximo', desc: 'Llevaste una de tus habilidades a 99 puntos.', icon: '🔥', tier: 'gold', condition: () => Math.max(G.stats.speed, G.stats.quali, G.stats.tyres, G.stats.overtake, G.stats.rain) >= 99 },

    { id: 'same_king', name: 'Nueva Era, Mismo Rey', desc: 'Ganaste el mundial antes del cambio de reglamento y volviste a ganar en la primera temporada de la nueva era.', icon: '🔄', tier: 'gold', condition: () => {
    if (!G.lastRegChangeYear || G.lastRegChangeYear === 0) return false;
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    const wonBefore = f1s.some(s => s.year === G.lastRegChangeYear && s.champ === 1);
    const wonAfter = f1s.some(s => s.year === G.lastRegChangeYear + 1 && s.champ === 1);
    return wonBefore && wonAfter;
    }},

    // Minijuegos
    { id: 'minigame_first', name: '¡Hay piloto!', desc: 'Demostraste tu destreza ganando un minijuego interactivo.', icon: '🎮', tier: 'bronze', condition: () => (G._minigamesWon || 0) > 0 },

    // Compras
    { id: 'first_spend', name: 'Primer Gasto', desc: 'El dinero está para gastarlo. Compraste tu primera mejora.', icon: '🛍️', tier: 'bronze', condition: () => G.upgrades && G.upgrades.length >= 1 },
    { id: 'millionaire_club', name: 'El Club de los Millonarios', desc: 'Sos un piloto de F1, vivi como tal. Compraste Jet Privado + Yate de Lujo + Mansion', icon: '🛥️', tier: 'gold', condition: () => G.upgrades && G.upgrades.includes('jet') && G.upgrades.includes('yacht') && G.upgrades.includes('mansion') },
    { id: 'spent_50m', name: '¿En qué momento se me fue la mano?', desc: 'Gastaste 50 Millones.', icon: '🤑', tier: 'gold', condition: () => G.upgrades && G.upgrades.reduce((sum, id) => sum + (UPGRADES.find(u => u.id === id)?.cost || 0), 0) >= 50000000 },
    { id: 'first_is_mansion', name: 'Sin Mirar el Precio', desc: 'Tu primera compra en la tienda fue la Mansión en Mónaco.', icon: '🎢', tier: 'silver', condition: () => G.upgrades && G.upgrades.length > 0 && G.upgrades[0] === 'mansion' },
    { id: 'no_upgrades', name: 'Autosuficiente', desc: 'Te retiraste sin haber comprado ni una sola mejora en toda tu carrera.', icon: '🙅', tier: 'bronze', condition: () => G.isRetired && (!G.upgrades || G.upgrades.length === 0) },

    // Plata
  { id: 'rookie_win', name: 'El Novato', desc: 'Ganaste una carrera en tu primera temporada de F1.', icon: '🍼', tier: 'silver', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    return f1s.length === 1 && f1s[0].wins > 0;
  }},
  { id: 'first_title', name: 'La Primera Corona', desc: 'El sueño se hizo realidad. Ganaste tu primer campeonato de F1.', icon: '👑', tier: 'silver', condition: () => G.f1Titles >= 1 },
  { id: 'rain_king', name: 'Rey de la Lluvia', desc: 'Conseguiste 5 victorias en carreras bajo lluvia.', icon: '🌧️', tier: 'silver', condition: () => G.wetWins >= 5 },
  { id: 'traveler', name: 'El Viajero', desc: 'Cambiaste de equipo al menos 5 veces en F1.', icon: '💼', tier: 'silver', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    let changes = 0;
    for(let i=1; i<f1s.length; i++) { if(f1s[i].teamName !== f1s[i-1].teamName) changes++; }
    return changes >= 5;
  }},
  { id: 'the_return', name: 'El Regreso', desc: 'Volviste a ganar una carrera en F1 después de 3 temporadas sin victorias.', icon: '🔙', tier: 'silver', condition: () => {
    const f1s = G.seasons.filter(s => s.cat === 'F1');
    let drought = 0, achieved = false, hasWonBefore = false;
    f1s.forEach(s => {
      if (s.wins === 0 && hasWonBefore) drought++;
      else if (s.wins > 0 && drought >= 3) achieved = true;
      else if (s.wins > 0) { drought = 0; hasWonBefore = true; }
    });
    return achieved;
  }},
  { id: 'almost_there', name: 'Al Borde de la Gloria', desc: 'Estuviste muy cerca. Terminaste 2.º en el campeonato de F1.', icon: '🥈', tier: 'silver', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 2) },

    { id: 'giant_killer', name: 'Matagigantes', desc: 'Ganaste una carrera con un equipo de 3 estrellas o menos.', icon: '🗡️', tier: 'silver', condition: () => G.seasons.some(s => s.cat === 'F1' && s.wins > 0 && (s.teamStars || 5) <= 3) },
  { id: 'rain_master', name: 'Que Llueva', desc: 'Ganaste un campeonato teniendo la lluvia como tu estadística más fuerte.', icon: '💧', tier: 'silver', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 1 && G.stats.rain >= Math.max(G.stats.speed, G.stats.quali, G.stats.tyres, G.stats.overtake)) },

  // Bronce
  { id: 'first_win', name: 'Primer Golpe', desc: 'Tu nombre apareció entre los ganadores. Conseguiste tu primera victoria en F1.', icon: '🥇', tier: 'bronze', condition: () => G.seasons.some(s => s.cat === 'F1' && s.wins > 0) },
  { id: 'team_player', name: 'El Compañero Ideal', desc: 'Llegá a +80 en Equipo.', icon: '🤝', tier: 'bronze', condition: () => G.personality && G.personality.team >= 80 },
  { id: 'media_star', name: 'Estrella Mediática', desc: 'Llegá a +80 en Mediático.', icon: '📸', tier: 'bronze', condition: () => G.personality && G.personality.media >= 80 },
  { id: 'villain', name: 'El Villano', desc: 'Llegá a +80 en Agresividad.', icon: '😈', tier: 'bronze', condition: () => G.personality && G.personality.aggressiveness >= 80 },

  { id: 'world_podium', name: 'El Podio del Mundo', desc: 'Te instalaste entre los mejores. Terminaste 3.º en el campeonato de F1.', icon: '🥉', tier: 'bronze', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 3) },
  { id: 'survivor', name: 'El Sobreviviente', desc: 'Terminaste una carrera donde todo parecía perdido (Superar un minijuego con riesgo de DNF).', icon: '🩹', tier: 'bronze', condition: () => G._ach_survivor },
  { id: 'chaos_specialist', name: 'Especialista en Caos', desc: 'Ganaste 3 minijuegos de puro azar o situaciones extremas.', icon: '🌪️', tier: 'bronze', condition: () => (G._ach_chaosCount || 0) >= 3 },
  { id: 'lucky_guy', name: 'El Afortunado', desc: 'Ganaste una carrera mediante un evento o minijuego de pura suerte.', icon: '🍀', tier: 'bronze', condition: () => G._ach_luckyWin },
  { id: 'loyalty', name: 'Fidelidad', desc: 'Firmaste 3 renovaciones de contrato consecutivas con el mismo equipo.', icon: '✍️', tier: 'bronze', condition: () => (G.renewalsCount || 0) >= 3 }
];

let G_unlockedAchievements = [];


// ═══════════════════════════════════════════════════════════
//  CLASIFICACIÓN DEL CAMPEONATO (modal opcional en el resumen)
//  Genera una tabla plausible a partir del resultado ya calculado,
//  sin simular carrera por carrera. Se cachea una vez por temporada
//  para que el modal siempre muestre lo mismo que dice el resumen.
// ═══════════════════════════════════════════════════════════
function generateStandingsTable(r) {
  const sizes = { 'Karting': 24, 'F4': 24, 'Formula Regional': 24, 'F3': 30, 'F2': 22, 'F1': TEAMS['F1'].length * 2 };
  const N = sizes[r.cat] || 20;
  //    Points calibration                                                                  
  // F1: 24 GP × 101 pts + 6 Sprints × 36 pts = 2,640 total available.
  // DECAY (0.82 0.87) varies each season: lower = dominant champ, higher = close field.
  // All rows are scaled so the total always equals TARGET for the category.
  const TARGETS = { 'F1': 2640, 'F2': 2016, 'F3': 1704, 'Formula Regional': 900, 'F4': 700, 'Karting': 500 };
  const TARGET = TARGETS[r.cat] || 1000;
  const catTeams = TEAMS[r.cat] || TEAMS['F1'];
  const DECAY = 0.82 + Math.random() * 0.05; // 0.820.87: controls field spread each season

  const rawWeights = [];
  for (let k = 0; k < N; k++) rawWeights.push(Math.pow(DECAY, k));
  const rawSum = rawWeights.reduce((a, b) => a + b, 0);

  const rows = [];
  for (let k = 0; k < N; k++) {
    rows.push({ rank: k + 1, points: Math.round(rawWeights[k] / rawSum * TARGET) });
  }

  const myRank = Math.min(Math.max(r.champ, 1), N);
  const playerTeamName = r.teamName || (G.team && G.team.name) || '???';
  let aiPool = r.aiStandings;

  if (!aiPool) {
    aiPool = [];
    if (r.cat === 'Karting' || !G.aiRoster) {
    const usedNames = new Set();
    const seatsPerTeam = 3;
    let seatsPool = [];
    catTeams.forEach(t => {
      for (let i = 0; i < seatsPerTeam; i++) seatsPool.push({ ...t });
    });
    const playerTIdx = seatsPool.findIndex(t => t.name === playerTeamName);
    if (playerTIdx !== -1) seatsPool.splice(playerTIdx, 1);
    seatsPool = shuffle(seatsPool);
    
    for (let i = 0; i < N - 1; i++) {
      let full;
      do { full = randFrom(FIRST_NAMES) + ' ' + randFrom(LAST_NAMES); } while (usedNames.has(full));
      usedNames.add(full);
      const randT = seatsPool.length > 0 ? seatsPool.shift() : randFrom(catTeams);
      aiPool.push({ name: (NATIONALITIES[Math.floor(Math.random()*NATIONALITIES.length)]?.flag || '🏁') + ' ' + full, team: randT.name, logo: randT.logo, _power: Math.random() });
    }
    aiPool.sort((a,b) => b._power - a._power);
  } else {
    let catDrivers = G.aiRoster.filter(d => d.cat === r.cat);
    
    // Only delete drivers if we have more than needed (e.g., if applyContract failed to delete one)
    while (catDrivers.length > N - 1) {
      let teamDrivers = catDrivers.filter(d => d.team === playerTeamName);
      if (teamDrivers.length > 0) {
        const nonPeerTeammates = teamDrivers.filter(d => !(G.peer && G.peer.id === d.id));
        if (nonPeerTeammates.length > 0) {
          nonPeerTeammates.sort((a,b) => a.skill - b.skill);
          const displaced = nonPeerTeammates[0];
          catDrivers = catDrivers.filter(d => d.id !== displaced.id);
        } else {
          const othersSkill = catDrivers.filter(d => d.team !== playerTeamName);
          if (othersSkill.length > 0) {
            othersSkill.sort((a,b) => a.skill - b.skill);
            catDrivers = catDrivers.filter(d => d.id !== othersSkill[0].id);
          } else {
            break;
          }
        }
      } else {
        catDrivers.sort((a,b) => a.skill - b.skill);
        catDrivers.shift(); 
      }
    }

    aiPool = catDrivers.map(d => {
      const tObj = catTeams.find(t => t.name === d.team);
      const stars = tObj ? tObj.stars : 3;
      let power;
      if (d._power !== undefined) {
        power = d._power;
      } else {
        if (r.cat === 'F1') {
          power = getF1DriverPower(d.skill, stars);
        } else {
          power = d.skill + (stars * 3);
        }
        power += rand(-10, 10);
      }
      return { 
        name: d.flag + ' ' + d.name, 
        team: d.team, 
        logo: tObj ? tObj.logo : null, 
        _power: power,
        isPeer: (G.peer && G.peer.id === d.id),
        isNemesis: (G.nemesis && G.nemesis.id === d.id)
      };
    });
    
    aiPool.sort((a, b) => b._power - a._power);
    
    while (aiPool.length < N - 1) {
      aiPool.push({ name: (NATIONALITIES[Math.floor(Math.random()*NATIONALITIES.length)]?.flag || '🏁') + ' ' + randFrom(FIRST_NAMES) + ' ' + randFrom(LAST_NAMES), team: randFrom(catTeams).name, logo: null, _power: 0, isPeer: false });
    }
  } // END fallback
  }

  let aiIdx = 0;
  rows.forEach(row => {
    if (row.rank === myRank) {
      row.isPlayer = true;
      row.name = `${G.flag} ${G.name}`;
      row.team = playerTeamName;
      const tObj = catTeams.find(t => t.name === row.team);
      row.logo = (r.cat !== 'Karting' && tObj) ? tObj.logo : null;
    } else {
      const ai = aiPool[aiIdx++];
      row.name = ai.name;
      row.team = ai.team;
      row.logo = ai.logo;
      row.isPeer = ai.isPeer;
      if (r.cat === 'F1' && row.isPeer) {
        row.name = '🤝 ' + row.name;
      }
      if (ai.isNemesis) {
        row.name = '😈 ' + row.name;
      }
    }
  });

  return rows;
}


function openStandingsModal(view = 'drivers') {
  if (!_lastStandings) return;
  const overlay = document.getElementById('standings-modal-overlay');
  if (!overlay) return;
  
  _lastStandings.view = view;
  const isConstructors = view === 'constructors';
  
  let rowsHtml = '';
  if (isConstructors) {
    rowsHtml = _lastStandings.constructors.map((row, idx) => {
      const img = row.logo ? '<img src="' + row.logo + '" title="' + row.team + '" alt="' + row.team + '" style="height:14px; vertical-align:middle; max-width:100%; object-fit:contain;">' : '';
      return '<div class="standings-row' + (row.hasPlayer ? ' is-player' : '') + '" style="animation-delay:' + (idx * 0.05) + 's">' +
        '<span class="standings-pos">' + row.rank + 'º</span>' +
        '<span class="standings-name">' + row.team + '</span>' +
        '<span class="standings-team">' + img + '</span>' +
        '<span class="standings-pts">' + row.points + '</span>' +
      '</div>';
    }).join('');
  } else {
    rowsHtml = _lastStandings.rows.map((row, idx) => {
      const img = row.logo ? '<img src="' + row.logo + '" title="' + row.team + '" alt="' + row.team + '" style="height:14px; vertical-align:middle; max-width:100%; object-fit:contain;">' : row.team;
      return '<div class="standings-row' + (row.isPlayer ? ' is-player' : '') + '" style="animation-delay:' + (idx * 0.05) + 's">' +
        '<span class="standings-pos">' + row.rank + 'º</span>' +
        '<span class="standings-name">' + row.name + '</span>' +
        '<span class="standings-team">' + img + '</span>' +
        '<span class="standings-pts">' + row.points + '</span>' +
      '</div>';
    }).join('');
  }

  overlay.innerHTML = '<div class="ach-modal standings-modal" onclick="event.stopPropagation()">' +
      '<div class="ach-modal-title" style="margin-bottom:4px">Clasificación</div>' +
      '<div class="sub" style="margin-bottom:10px">' + _lastStandings.cat + ' – Temporada ' + _lastStandings.year + '</div>' +
      
      '<div style="display:flex; gap:8px; margin-bottom:12px">' +
        '<button class="btn btn-sm ' + (!isConstructors ? 'btn-primary' : 'btn-secondary') + '" onclick="openStandingsModal(\'drivers\')" style="flex:1">Pilotos</button>' +
        '<button class="btn btn-sm ' + (isConstructors ? 'btn-primary' : 'btn-secondary') + '" onclick="openStandingsModal(\'constructors\')" style="flex:1">Constructores</button>' +
      '</div>' +

      '<div class="standings-list">' + rowsHtml + '</div>' +
      '<button class="btn btn-secondary ach-modal-close" onclick="closeStandingsModal()" style="margin-top:12px">CERRAR</button>' +
    '</div>';

  void overlay.offsetWidth;
  overlay.classList.add('open');
  
  if (!overlay.dataset.scrolled) {
    setTimeout(() => {
      const playerRow = overlay.querySelector('.standings-row.is-player');
      if (playerRow && typeof playerRow.scrollIntoView === 'function') playerRow.scrollIntoView({ block: 'center' });
    }, 60);
    overlay.dataset.scrolled = 'true';
  }
}

function closeStandingsModal() {
  const overlay = document.getElementById('standings-modal-overlay');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  delete overlay.dataset.scrolled;
  setTimeout(() => { overlay.innerHTML = ''; }, 250);
}

function loadAchievements() {
  try {
    const saved = localStorage.getItem('piloto_achievements');
    if (saved) G_unlockedAchievements = JSON.parse(saved);
  } catch(e) {
    console.error('Error loading achievements', e);
  }
}

function saveAchievements() {
  localStorage.setItem('piloto_achievements', JSON.stringify(G_unlockedAchievements));
}

function checkAchievements(trigger, context = {}) {
  // Triggers: 'season_end', 'retirement', 'minigame', 'contract'
  let newlyUnlocked = false;

  for (const ach of ACHIEVEMENTS) {
    if (!G_unlockedAchievements.includes(ach.id)) {
      if (ach.condition()) {
        G_unlockedAchievements.push(ach.id);
        newlyUnlocked = true;
        showAchievementToast(ach);
      }
    }
  }

  if (newlyUnlocked) saveAchievements();
}

function showAchievementToast(ach) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast tier-' + ach.tier;
  
  toast.innerHTML = `
    <div class="toast-icon">${ach.icon}</div>
    <div class="toast-content">
      <div class="toast-header">Logro Desbloqueado</div>
      <div class="toast-title">${ach.name}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400); // Wait for animation
  }, 4000);
}

function showAchievements() {
  loadAchievements(); // Ensure fresh
  const list = document.getElementById('achievements-list');
  list.innerHTML = '';

  const total = ACHIEVEMENTS.length;
  const unlockedCount = G_unlockedAchievements.length;
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  const progressCard = document.createElement('div');
  progressCard.className = 'ach-progress-card';
  progressCard.innerHTML = `
    <div class="ach-progress-top">
      <span class="ach-progress-label">Progreso total</span>
      <span class="ach-progress-count">${unlockedCount}/${total}</span>
    </div>
    <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${pct}%"></div></div>
  `;
  list.appendChild(progressCard);

  TIER_ORDER.forEach(tier => {
    const group = ACHIEVEMENTS.filter(a => a.tier === tier);
    if (group.length === 0) return;
    const unlockedInTier = group.filter(a => G_unlockedAchievements.includes(a.id)).length;

    const section = document.createElement('div');
    section.className = 'ach-section';

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'ach-section-title tier-text-' + tier;
    sectionTitle.innerHTML = `${TIER_LABELS[tier]} <span class="ach-section-count">${unlockedInTier}/${group.length}</span>`;
    section.appendChild(sectionTitle);

    const grid = document.createElement('div');
    grid.className = 'achievement-grid';

    group.forEach(ach => {
      const unlocked = G_unlockedAchievements.includes(ach.id);
      const card = document.createElement('div');
      card.className = 'ach-card tier-' + ach.tier + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="ach-tier tier-${ach.tier}"></div>
        <div class="ach-icon">${unlocked ? ach.icon : '🔒'}</div>
        <div class="ach-title">${ach.name}</div>
      `;
      card.onclick = () => openAchievementModal(ach, unlocked);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    list.appendChild(section);
  });

  goto('screen-achievements');
}

function openAchievementModal(ach, unlocked) {
  const overlay = document.getElementById('ach-modal-overlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="ach-modal tier-${ach.tier}${unlocked ? '' : ' locked'}" onclick="event.stopPropagation()">
      <div class="ach-modal-tier-badge tier-text-${ach.tier}">${TIER_LABELS[ach.tier]}</div>
      <div class="ach-modal-icon">${unlocked ? ach.icon : '🔒'}</div>
      <div class="ach-modal-title">${ach.name}</div>
      <div class="ach-modal-status ${unlocked ? 'is-unlocked' : 'is-locked'}">${unlocked ? '✅ Desbloqueado' : '🔒 Todavía no lo conseguiste'}</div>
      <div class="ach-modal-desc">${ach.desc}</div>
      <button class="btn btn-secondary ach-modal-close" onclick="closeAchievementModal()">CERRAR</button>
    </div>
  `;
  // force reflow so the transition triggers even on repeated opens
  void overlay.offsetWidth;
  overlay.classList.add('open');
}

function closeAchievementModal() {
  const overlay = document.getElementById('ach-modal-overlay');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  setTimeout(() => { overlay.innerHTML = ''; }, 250);
}

// Load achievements on boot
loadAchievements();




// PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
//  MERCADO DE PILOTOS (SILLY SEASON)
// PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
function simulateDriverMarket() {
  if (!G.aiRoster) return;

  // Retire old drivers in junior categories (age > 27) to avoid blocking seats
  G.aiRoster.forEach((d, idx) => {
    const isNemesis = G.nemesis && G.nemesis.id === d.id;
    if (d.cat !== 'F1' && d.age > 27 && !isNemesis) {
      
      let baseSkill = 30;
      if (d.cat === 'F2') baseSkill = 60;
      else if (d.cat === 'F3') baseSkill = 50;
      else if (d.cat === 'Formula Regional') baseSkill = 45;
      else if (d.cat === 'F4') baseSkill = 40;
      
      const newNat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
      G.aiRoster[idx] = {
        id: 'ai_gen_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 10000),
        name: FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)] + ' ' + LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)],
        team: d.team,
        age: 16 + Math.floor(Math.random()*4), // 16 to 19
        flag: newNat ? newNat.flag : '🏳️',
        cat: d.cat,
        skill: baseSkill + Math.floor(Math.random() * 15),
        contractYearsLeft: 1,
        consecutiveLosses: 0,
        avatar: EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)]
      };
    }
  });

  // 1. Process teammate battles in F1 to find who is underperforming
  processF1TeammateBattles();

  let openF1Seats = [];
  
  // 2. Identify retirements and firings
  G.aiRoster = G.aiRoster.filter(d => {
    // Player displacement check: if AI was in F1, and their team is the player's team, but they aren't the player's peer,
    // they were displaced. We handle them as out of contract so they can find a new seat.
    const isDisplacedByPlayer = (G.catIndex === 5 && d.team === G.team.name && (!G.peer || G.peer.id !== d.id));

    if (d.cat === 'F1') {
      d.contractYearsLeft = (d.contractYearsLeft || 1) - 1;

      // NEMESIS ULTIMATUM LOCK: If ultimatum is active, force nemesis to stay and not retire/be fired
      if (G.nemesis && d.id === G.nemesis.id && G.nemesis.ultimatumActive) {
        d.contractYearsLeft = Math.max(d.contractYearsLeft, 1);
        d.consecutiveLosses = 0; // prevent firing
        return true;
      }

      // Retirement (age)
      if (d.age >= 40 || (d.age >= 37 && Math.random() < 0.4)) {
        if (!isDisplacedByPlayer) openF1Seats.push(d.team);
        return false; 
      }

      // Fired (performance)
      if ((d.consecutiveLosses || 0) >= 4) {
        if (!isDisplacedByPlayer) openF1Seats.push(d.team);
        // They drop out of F1 (demoted or retired)
        return false;
      }

      if (isDisplacedByPlayer) {
        d.contractYearsLeft = 0;
        d.team = 'Free Agent';
      } else if (d.contractYearsLeft <= 0) {
        openF1Seats.push(d.team);
        d.team = 'Free Agent';
      }
    }
    return true;
  });

  // 3. F1 Silly Season (Transfers)
  let freeAgentsF1 = G.aiRoster.filter(d => d.cat === 'F1' && d.team === 'Free Agent');
  // Sort agents by skill (best drivers pick first)
  freeAgentsF1.sort((a,b) => b.skill - a.skill);

  // Teams with open seats want the best drivers
  // We sort open seats by team prestige (stars)
  openF1Seats.sort((a,b) => {
    const tA = TEAMS['F1'].find(t => t.name === a)?.stars || 3;
    const tB = TEAMS['F1'].find(t => t.name === b)?.stars || 3;
    return tB - tA;
  });

  freeAgentsF1.forEach(driver => {
    if (openF1Seats.length > 0) {
      let availableSeats = openF1Seats;
      
      // Si es tu ex-compañero y perdió contra vos (consecutiveLosses > 0), no puede ir a un equipo mejor
      if (G.peer && driver.id === G.peer.id && driver.consecutiveLosses > 0 && G.team) {
        availableSeats = openF1Seats.filter(s => {
          const sStars = TEAMS['F1'].find(t => t.name === s)?.stars || 3;
          return sStars <= G.team.stars;
        });
        if (availableSeats.length === 0) {
          availableSeats = [openF1Seats[openF1Seats.length - 1]]; // Si no hay peores, se va al peor equipo disponible
        }
      }

      // Driver negotiates for the best available seat
      // Small randomness so it's not strictly deterministic
      const bestSeatIdx = Math.random() < 0.8 ? 0 : Math.min(1, availableSeats.length - 1);
      const newTeam = availableSeats[bestSeatIdx];
      
      // Sacarlo de la lista real
      const realIdx = openF1Seats.indexOf(newTeam);
      if (realIdx > -1) openF1Seats.splice(realIdx, 1);

      driver.team = newTeam;
      const stars = TEAMS['F1'].find(t => t.name === newTeam)?.stars || 3;
      driver.contractYearsLeft = Math.floor(Math.random() * (stars >= 4 ? 4 : 2)) + 2; // Top teams give longer contracts
    }
  });

  // Any remaining free agents who didn't get a seat are out of F1
  G.aiRoster = G.aiRoster.filter(d => !(d.cat === 'F1' && d.team === 'Free Agent'));

  // 4. Promotions from F2 to fill remaining open F1 seats
  if (openF1Seats.length > 0) {
    let openSeatsInCurrentCat = [];
    
    let f2Drivers = G.aiRoster.filter(d => d.cat === 'F2').sort((a,b) => (b.skill + (Math.random() * 5)) - (a.skill + (Math.random() * 5)));
    for (let i = 0; i < openF1Seats.length; i++) {
      if (f2Drivers[i]) {
        openSeatsInCurrentCat.push(f2Drivers[i].team); // Record F2 seat vacated
        f2Drivers[i].cat = 'F1';
        if (f2Drivers[i].skill < 80) f2Drivers[i].skill = 80; // BOOST SKILL TO MIN 80 IN F1
        f2Drivers[i].team = openF1Seats[i];
        f2Drivers[i].consecutiveLosses = 0;
        const stars = TEAMS['F1'].find(t => t.name === openF1Seats[i])?.stars || 3;
        f2Drivers[i].contractYearsLeft = Math.floor(Math.random() * (stars >= 4 ? 4 : 2)) + 2;
      }
    }

    // Cascade promotions for lower categories
    const cats = ['F2', 'F3', 'Formula Regional', 'F4', 'Karting'];
    const numToPromote = openF1Seats.length;
    for (let c = 1; c < cats.length; c++) {
      let fromCat = cats[c];
      let toCat = cats[c-1];
      let nextOpenSeats = [];
      
      let drivers = G.aiRoster.filter(d => d.cat === fromCat).sort((a,b) => (b.skill + (Math.random() * 5)) - (a.skill + (Math.random() * 5)));
      for(let i=0; i < numToPromote; i++) {
        if (drivers[i]) {
          nextOpenSeats.push(drivers[i].team); // Record seat vacated in fromCat
          drivers[i].cat = toCat;
          if (openSeatsInCurrentCat[i]) {
            drivers[i].team = openSeatsInCurrentCat[i]; // Fill the seat that was just vacated in toCat
          } else {
            // Fallback just in case
            const catTeams = TEAMS[toCat];
            if (catTeams && catTeams.length > 0) drivers[i].team = catTeams[Math.floor(Math.random() * catTeams.length)].name;
          }
        }
      }
      openSeatsInCurrentCat = nextOpenSeats;
    }
    
    // Replenish Karting with new generated drivers
    for(let i=0; i < numToPromote; i++) {
      const newTeam = openSeatsInCurrentCat[i] || 'Privado';
      const newNat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
      G.aiRoster.push({
        id: 'ai_gen_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 10000),
        name: FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)] + ' ' + LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)],
        team: newTeam,
        age: 15 + Math.floor(Math.random()*3),
        flag: newNat ? newNat.flag : '??',
        cat: 'Karting',
        skill: 30 + Math.floor(Math.random() * 20),
        contractYearsLeft: Math.floor(Math.random() * 2) + 1,
        consecutiveLosses: 0,
        avatar: EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)]
      });
    }
  }
}

function processF1TeammateBattles() {
  // Uses _lastStandings or shadow simulation to determine who beat who
  // Here we just use AI skill + some RNG as a proxy for who won the teammate battle,
  // except for the player's team where we have definitive H2H data.
  const f1Drivers = G.aiRoster.filter(d => d.cat === 'F1');
  const teams = [...new Set(f1Drivers.map(d => d.team))];

  teams.forEach(teamName => {
    if (G.catIndex === 5 && G.team && G.team.name === teamName && G.peer) {
      // Player's team
      const peerInRoster = f1Drivers.find(d => d.id === G.peer.id);
      if (peerInRoster) {
        // Did peer lose? (we use player's perspective: if myRank < peerRank, peer lost)
        // We know this from G.peer.h2hWins and G.peer.h2hLosses, but those are cumulative.
        // Let's just compare their standings in the current season.
        if (_lastStandings && _lastStandings.rows) {
          const myRow = _lastStandings.rows.find(r => r.isPlayer);
          const peerRow = _lastStandings.rows.find(r => r.isPeer);
          if (myRow && peerRow) {
            if (myRow.rank < peerRow.rank) {
              peerInRoster.consecutiveLosses = (peerInRoster.consecutiveLosses || 0) + 1;
            } else {
              peerInRoster.consecutiveLosses = 0;
            }
          }
        }
      }
    } else {
      // AI team
      const drivers = f1Drivers.filter(d => d.team === teamName);
      if (drivers.length >= 2) {
        // Compare skill + rng
        const d1Score = drivers[0].skill + Math.random() * 10;
        const d2Score = drivers[1].skill + Math.random() * 10;
        if (d1Score > d2Score) {
          drivers[1].consecutiveLosses = (drivers[1].consecutiveLosses || 0) + 1;
          drivers[0].consecutiveLosses = 0;
        } else {
          drivers[0].consecutiveLosses = (drivers[0].consecutiveLosses || 0) + 1;
          drivers[1].consecutiveLosses = 0;
        }
      }
    }
  });
}

function playCategoryTransition(oldCat, newCat, callback) {
  // Contenedor principal sin filtros que puedan romperse al animar
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10000; display: flex; align-items: center; justify-content: center; pointer-events: none;';
  document.body.appendChild(overlay);

  // Capa separada dedicada solo al difuminado, para evitar glitches de renderizado del navegador
  const blurBg = document.createElement('div');
  blurBg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); opacity: 0; transition: opacity 0.5s ease;';
  overlay.appendChild(blurBg);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes catSlideDownOut {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    @keyframes catSlideDownIn {
      0% { transform: translateY(-100vh); opacity: 0; }
      80% { transform: translateY(10px); opacity: 1; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .cat-trans-container {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .cat-trans-logo {
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
    }
    .cat-trans-text {
      font-size: 64px;
      font-weight: 900;
      color: white;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 4px 12px rgba(0,0,0,0.5);
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  const getCatHTML = (cat) => {
    if (cat === 'Karting') {
      return `<div class="cat-trans-text">Karting</div>`;
    }
    let name = cat;
    if (cat === 'Formula Regional') name = 'FR';
    return `
      <img src="assets/images/logos/logo ${name}.png" class="cat-trans-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
      <div class="cat-trans-text" style="display:none;">${cat}</div>
    `;
  };

  const oldEl = document.createElement('div');
  oldEl.className = 'cat-trans-container';
  oldEl.innerHTML = getCatHTML(oldCat);
  
  const newEl = document.createElement('div');
  newEl.className = 'cat-trans-container';
  newEl.innerHTML = getCatHTML(newCat);
  newEl.style.opacity = '0';

  overlay.appendChild(oldEl);
  overlay.appendChild(newEl);

  requestAnimationFrame(() => {
    blurBg.style.opacity = '1'; // Iniciar difuminado
    
    setTimeout(() => {
      oldEl.style.animation = 'catSlideDownOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      
      setTimeout(() => {
        newEl.style.animation = 'catSlideDownIn 0.8s ease-out forwards';
        
        setTimeout(() => {
          blurBg.style.opacity = '0'; // Quitar difuminado
          setTimeout(() => {
            overlay.remove();
            style.remove();
            callback();
          }, 500);
        }, 2000); // stay on screen for 2s
      }, 400); // overlap the old slide out by a bit
    }, 1000); // wait 1s with old category
  });
}
