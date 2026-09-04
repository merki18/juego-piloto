// ═══════════════════════════════════════════════════════════
//  GAME DATA
// ═══════════════════════════════════════════════════════════

const CATEGORIES = ['Karting', 'F4', 'Formula Regional', 'F3', 'F2', 'F1'];

const NATIONALITIES = [
  { flag: '🇦🇷', name: 'Argentina' }, { flag: '🇧🇷', name: 'Brasil' },
  { flag: '🇲🇽', name: 'México' }, { flag: '🇺🇸', name: 'EE.UU.' },
  { flag: '🇬🇧', name: 'Gran Bretaña' }, { flag: '🇩🇪', name: 'Alemania' },
  { flag: '🇫🇷', name: 'Francia' }, { flag: '🇮🇹', name: 'Italia' },
  { flag: '🇪🇸', name: 'España' }, { flag: '🇳🇱', name: 'Países Bajos' },
  { flag: '🇲🇨', name: 'Mónaco' }, { flag: '🇯🇵', name: 'Japón' },
];

const TALENTS = [
  { id: 'speed', name: 'Velocista', desc: 'Máxima velocidad pura en clasificación y carrera', bonus: 'velocidad +8', stats: { speed: 8 } },
  { id: 'rain', name: 'Especialista en lluvia', desc: 'Domina como nadie en pistas mojadas', bonus: 'lluvia +8', stats: { rain: 8 } },
  { id: 'quali', name: 'Gran clasificador', desc: 'Siempre en el frente al largar', bonus: 'clasificación +8', stats: { quali: 8 } },
  { id: 'tyres', name: 'Conservador de gomas', desc: 'Sus neumáticos duran mucho más que el resto', bonus: 'gestión +8', stats: { tyres: 8 } },
  { id: 'overtake', name: 'Adelantador', desc: 'Maestro de los duelos rueda a rueda', bonus: 'adelantamientos +8', stats: { overtake: 8 } },
];

// focus: 'desarrollo' = more stat growth, worse results | 'ganar' = less growth, better results | 'equilibrado' = balanced
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
    { name: 'Campos', stars: 3, logo: 'assets/images/logo campos.png', focus: 'desarrollo' },
    { name: 'Van Amersfoort', stars: 4, logo: 'assets/images/logo van amersfoort.png', focus: 'equilibrado' },
    { name: 'Prema', stars: 5, logo: 'assets/images/logo prema.png', focus: 'ganar' },
    { name: 'US Racing', stars: 4, logo: 'assets/images/logo us racing.png', focus: 'equilibrado' },
    { name: 'PHM Racing', stars: 3, logo: 'assets/images/logo phm racing.png', focus: 'desarrollo' },
    { name: 'Jenzer Motorsport', stars: 3, logo: 'assets/images/logo jenzer.png', focus: 'desarrollo' },
    { name: 'AKM Motorsport', stars: 3, logo: 'assets/images/logo akm.png', focus: 'desarrollo' },
    { name: 'Hitech', stars: 5, logo: 'assets/images/logo hitech.png', focus: 'ganar' },
  ],
  'Formula Regional': [
    { name: 'Trident', stars: 3, logo: 'assets/images/logo trident.png', focus: 'desarrollo' },
    { name: 'ART Grand Prix', stars: 4, logo: 'assets/images/logo art grand prix.png', focus: 'equilibrado' },
    { name: 'Prema', stars: 5, logo: 'assets/images/logo prema.png', focus: 'ganar' },
    { name: 'R-ace GP', stars: 5, logo: 'assets/images/logo r-ace.png', focus: 'ganar' },
    { name: 'MP Motorsport', stars: 4, logo: 'assets/images/logo mp motorsports.png', focus: 'equilibrado' },
    { name: 'Van Amersfoort', stars: 4, logo: 'assets/images/logo van amersfoort.png', focus: 'equilibrado' },
    { name: 'RPM', stars: 3, logo: 'assets/images/logo rpm.png', focus: 'desarrollo' },
    { name: 'G4 Racing', stars: 3, logo: 'assets/images/logo g4.png', focus: 'desarrollo' },
  ],
  'F3': [
    { name: 'Hitech', stars: 3, logo: 'assets/images/logo hitech.png', focus: 'desarrollo' },
    { name: 'AIX Racing', stars: 4, logo: 'assets/images/logo aix racing.png', focus: 'equilibrado' },
    { name: 'Prema', stars: 5, logo: 'assets/images/logo prema.png', focus: 'ganar' },
    { name: 'Trident', stars: 5, logo: 'assets/images/logo trident.png', focus: 'ganar' },
    { name: 'ART Grand Prix', stars: 4, logo: 'assets/images/logo art grand prix.png', focus: 'equilibrado' },
    { name: 'MP Motorsport', stars: 4, logo: 'assets/images/logo mp motorsports.png', focus: 'equilibrado' },
    { name: 'Campos', stars: 3, logo: 'assets/images/logo campos.png', focus: 'desarrollo' },
    { name: 'Van Amersfoort', stars: 3, logo: 'assets/images/logo van amersfoort.png', focus: 'desarrollo' },
    { name: 'Rodin Motorsport', stars: 4, logo: 'assets/images/logo rodin.png', focus: 'equilibrado' },
    { name: 'Jenzer Motorsport', stars: 3, logo: 'assets/images/logo jenzer.png', focus: 'desarrollo' },
  ],
  'F2': [
    { name: 'MP Motorsport', stars: 3, logo: 'assets/images/logo mp motorsports.png', focus: 'desarrollo' },
    { name: 'Prema', stars: 4, logo: 'assets/images/logo prema.png', focus: 'equilibrado' },
    { name: 'Invicta', stars: 5, logo: 'assets/images/logo invicta.png', focus: 'ganar' },
    { name: 'ART Grand Prix', stars: 4, logo: 'assets/images/logo art grand prix.png', focus: 'equilibrado' },
    { name: 'Rodin Motorsport', stars: 4, logo: 'assets/images/logo rodin.png', focus: 'equilibrado' },
    { name: 'Hitech Pulse-Eight', stars: 4, logo: 'assets/images/logo hitech.png', focus: 'equilibrado' },
    { name: 'DAMS', stars: 4, logo: 'assets/images/logo dams.png', focus: 'equilibrado' },
    { name: 'Campos', stars: 3, logo: 'assets/images/logo campos.png', focus: 'desarrollo' },
    { name: 'Trident', stars: 3, logo: 'assets/images/logo trident.png', focus: 'desarrollo' },
    { name: 'Van Amersfoort', stars: 3, logo: 'assets/images/logo van amersfoort.png', focus: 'desarrollo' },
    { name: 'AIX Racing', stars: 3, logo: 'assets/images/logo aix racing.png', focus: 'desarrollo' },
  ],
  'F1': [
    { name: 'Cadillac', stars: 1, logo: 'assets/images/logo cadillac.png' },
    { name: 'Audi', stars: 2, logo: 'assets/images/logo audi.png' },
    { name: 'Haas F1', stars: 2, logo: 'assets/images/logo haas.png' },
    { name: 'Williams', stars: 3, logo: 'assets/images/logo williams.png' },
    { name: 'Racing Bulls', stars: 3, logo: 'assets/images/logo racing bulls.png' },
    { name: 'Alpine', stars: 4, logo: 'assets/images/logo alpine.png' },
    { name: 'Aston Martin', stars: 4, logo: 'assets/images/logo aston martin.png' },
    { name: 'McLaren', stars: 4, logo: 'assets/images/logo mclaren.png' },
    { name: 'Mercedes', stars: 5, logo: 'assets/images/logo mercedes.png' },
    { name: 'Ferrari', stars: 5, logo: 'assets/images/logo Ferrari.png' },
    { name: 'Red Bull', stars: 5, logo: 'assets/images/logo red bull.png' },
  ],
};

const CAT_LOGOS = {
  'Formula Regional': 'assets/images/logo FR.png',
  'F1': 'assets/images/logo F1.png',
  'F2': 'assets/images/logo F2.png',
  'F3': 'assets/images/logo F3.png',
};

const WIN_PROBS = ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'];

const ACTIVITIES_COMMON = [
  { name: 'Entrenar en simulador', icon: '🖥️', bonus: '+2 clasificación', stats: { quali: 2 }, rarity: 'common' },
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
  { name: '🌟 Mentoría con un Campeón', icon: '🏆', bonus: '+3 vel, +2 clas, +2 const', stats: { speed: 3, quali: 2, tyres: 2, overtake: 2 }, rarity: 'legendary' },
  { name: '🌟 Masterclass extrema en lluvia', icon: '⛈️', bonus: '+7 lluvia, +2 vel', stats: { rain: 7, speed: 2 }, rarity: 'legendary' },
  { name: '🌟 Campamento de élite', icon: '⭐', bonus: '+4 vel, +4 clasif', stats: { speed: 4, quali: 4 }, rarity: 'legendary' },
  { name: '🌟 Hallazgo de setup perfecto', icon: '🔧', bonus: '+5 const, +3 adelant', stats: { tyres: 5, overtake: 3 }, rarity: 'legendary' },
  { name: '🌟 Test privado de Fórmula 1', icon: '🏎️', bonus: '+6 velocidad, +3 clasificación', stats: { speed: 6, quali: 3 }, rarity: 'legendary' },
  { name: '🌟 Día perfecto de simulador', icon: '🖥️', bonus: '+5 clasificación, +3 adelantamientos', stats: { quali: 5, overtake: 3 }, rarity: 'legendary' },
  { name: '🌟 Preparación de campeón', icon: '👑', bonus: '+3 en 3 stats', stats: { speed: 3, quali: 3, tyres: 3 }, rarity: 'legendary' },
];

const RANDOM_EVENTS = [
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
      { text: 'Atacarlo frente a los micrófonos', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 4, skillFail: -2, hint: '🏎 Clasificación: si sos más rápido que él, salís favorecido. Si no, quedás mal.', successDesc: 'La telemetría te dio la razón. Los datos mostraban claramente que él se cerró. La prensa y el equipo coincidieron: fue culpa de él. Tu crídito dentro del garaje subió.', failDesc: 'Los datos te jugaron en contra. El equipo vio los videos y el ingeniero te llamó al despacho. Semanas tensas, sin apoyo del box. El ambiente nunca volvió a ser el mismo.' },
    ]
  },
  {
    icon: '🎬', title: 'Evento de exhibición extremo', desc: 'Te invitan a correr en rally el fin de semana libre por muchísima plata.', choices: [
      { text: 'Rechazar para enfocarte en el campeonato', stat: 'speed', delta: 1, money: 0, hint: 'Menos distracciones, te enfocás en tu velocidad (+1 Velocidad).', fixedDesc: 'Mientras todos descansaban, vos pasaste el fin de semana en el simólador. Encontraste medio segundo por vuelta en el sector 2 de Montecarlo. Ese fin de semana libre fue lo mejor que te pudo pasar.' },
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
      { text: 'Aprender de él observando su estilo', stat: 'overtake', delta: 0, money: 0, skillStat: 'overtake', skillBonus: 5, skillFail: -1, hint: '⚔ Adelantamientos: mejor tu técnica, más aprendés.', successDesc: 'Estudiaste sus telemetrías hasta el hartazgo. Un jueves en Baháin notaste cómo frenaba tarde en la curva 4 y se salía más rápido. Copiaste la técnica y te cambió la temporada entera.', failDesc: 'Intentar imitar su estilo te confundió más que ayudarte. Saliste de los boxes tratando de frenar como él y terminaste perdiendo tu propio ritmo natural. Mala idea.' },
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
      { text: 'Ceder y adaptar tu estilo', stat: 'tyres', delta: 2, money: 0, hint: 'Resultado fijo, mejora la gestión.', fixedDesc: 'Tragaste orgullo y seguiste las instrucciones del muro. Para tu sorpresa, los nuevos mapas de motor y la estrategia conservadora que te impusieron resultaron en las gomas más largas de tu carrera.' },
      { text: 'Defenderte con resultados', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 4, skillFail: -2, hint: '🚀 Velocidad: te avala si tu ritmo es real.', successDesc: 'El cronometro fue tu abogado. Dos poles seguidas cerraron la boca de todo el mundo. En la reunión del lunes, el director te estabaó la mano. No hubo más preguntas.', failDesc: 'Los resultados no te acompañaron en el momento menos oportuno. El director convocó una reunión de urgencia, y el resto del año sentiste la presión de saber que estaban mirando cada metro que corrías.' },
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
      { text: 'Simulador y análisis de datos', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 5, skillFail: 2, hint: '🏎 Clasificación: el simulador amplifica tu técnica', successDesc: 'Horas y horas en el simólador pagaron. Llegaste al primer test sabiendo de memoria los puntos de frenada de los 23 circuitos del calendario. Tu ingeniero no podía creer el nivel de detalle de tu feedback desde el primer día.', failDesc: 'Demasiado tiempo en el simulador y poco en la pista real. Cuando llegaste a Bahréin para el primer test, el asfalto real se sintió extraño. Tardaste dos días en adaptarte.' },
    ]
  },
  {
    icon: '🌍', title: 'Carrera fuera de Europa', desc: 'Esta temporada hay fecha en un circuito callejero de Asia. Calor extremo y mucho tráfico.', choices: [
      { text: 'Atacar desde el principio', stat: 'overtake', delta: 0, money: 0, skillStat: 'overtake', skillBonus: 4, skillFail: -1, hint: '⚔ Adelantamientos: en calles, el duelo lo define esa habilidad', successDesc: 'Vuelta 1, curva 3, adelantaste a tres pilotos de golpe por el interior. Las calles de Yakarta estaban de tu lado. La multitud enloqueció. Los ingenieros de radio gritaron solos.', failDesc: 'Ataque demasiado ambicioso en la primera vuelta. Tocás un guardías metálico y el alerón delantero al suelo. Parada de emergencia y carrera arruinada antes de llegar a la primera chicana.' },
      { text: 'Priorizar la gestión de temperatura', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 4, skillFail: 1, hint: '🛞 Gestión: el calor destruye gomas, manejá eso', successDesc: 'A 40°C de asfalto, las gomas de todos se degradaban rápido. Vos las cuidaste como si fueran de cristal. En la última vuelta, los que atacaron al principio rodaban como ladrillo. Vos pasabas uno por uno.', failDesc: 'El calor fue más de lo esperado. A pesar de tu ritmo conservador, las gomas cedieron igual y terminaste con un underperformance frustrante. Asia se cobró su precio.' },
    ]
  },
  {
    icon: '🏆', title: 'Invitación a test de fábrica', desc: 'Un fabricante de motores te invita a sus instalaciones para un test privado de desarrollo.', choices: [
      { text: 'Dar feedback técnico detallado', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 6, skillFail: 2, hint: '🏎 Clasificación: tu análisis técnico vale si lo entendés', successDesc: 'Pasás dos días entero en la fábrica, pizarras, ingenieros y datos. Tu análisis del comportamiento del motor en frenada fue tan preciso que el director de desarrollo pidió que lo incluyeran en el informe oficial.', failDesc: 'Tu feedback fue vago y los ingenieros no pudías trabajar con él. La sesión fue un desastre logístico y te fuiste con la sensación de haber desperdiciado dos días.' },
      { text: 'Apretar fuerte y demostrar velocidad', stat: 'speed', delta: 0, money: 0, skillStat: 'speed', skillBonus: 6, skillFail: 2, hint: '🚀 Velocidad: más rápido sos, más los impresionás', successDesc: 'Chronos imposibles. Batiste el récord del banco de pruebas en tres configuraciones distintas. El CEO de la empresa estaba en el box y te llamó personalmente al día siguiente para felicitarte.', failDesc: 'El motor estaba programado para test, no para atacar. Forzaste demasiado, tuviste una rotura de transmisión en la vuelta 14 y el test terminó antes. Nadie estaba contento.' },
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
      { text: 'Ir al límite absoluto en la Q3', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 7, skillFail: -3, hint: '🏎 Clasificación: en Mónaco, la pole vale más que en cualquier otro lugar. Todo depende de ella.', successDesc: 'Piscine, Rascasse, Antenne. Cada sector fue perfecto. Cuando cruzaste la línea y el cronómetro marcó P1, el equipo de radio enloqueció. Ganaste en Mónaco. Una victoria que nadie puede comprarte ni quitarte. La canción del pit lane duró hasta la madrugada.', failDesc: 'La chicane de la piscina. Doscientos milímetros de guardarrail más adentro y el alerón estaba roto. Entraste a boxes, el auto quedó en el garaje. En Mónaco no hay segunda oportunidad.' },
      { text: 'Ser cauteloso y asegurar una buena vuelta', stat: 'tyres', delta: 0, money: 0, skillStat: 'tyres', skillBonus: 5, skillFail: 1, hint: '🛞 Gestión: una vuelta limpia en Mónaco siempre vale más que una arriesgada que termina en el muro.', successDesc: 'No fuiste el más rápido, pero completaste la vuelta perfectamente. Largaste quinto. En carrera, la estrategia de neumáticos hizo el resto: tres pilotos delante tuyo fallaron en la frenada del Casino. Subiste al podio sin tocar un guardarrail.', failDesc: 'Tu cautela fue excesiva y saliste décimo. En Mónaco, desde esa posición, las posibilidades de adelantar son prácticamente nulas. Completaste las vueltas de forma anodina. Una oportunidad perdida en el circuito más icónico del mundo.' },
    ]
  },
  {
    id: 'rookie',
    icon: '👶', title: 'El Rookie que lo cambia todo', desc: 'Tu equipo sube a un joven de 19 años directo de F2. Es la promesa más grande en años y los medios no hablan de otra cosa. En la primera semana ya está dentro de 3 décimas tuyas en el simulador. La escudería quiere que "lo guíes". Vos sabés que es una amenaza directa.', choices: [
      { text: 'Compartir todo: reglajes, frenadas, telemetría', stat: 'quali', delta: 0, money: 0, skillStat: 'quali', skillBonus: 5, skillFail: 1, hint: '🏎 Clasificación: tu dominio técnico determina quién aprende de quién realmente.', successDesc: 'Le abriste los archivos de telemetría sin filtros. El pibe aprendió rápido, sí. Pero en ese proceso, vos también te miraste en el espejo y encontraste dos o tres décimas que ni sabías que tenías. El equipo terminó con el mejor resultado de constructores en años. Y todos saben quién era el líder.', failDesc: 'Le diste todo lo que sabías. Y él lo absorbió más rápido de lo que esperabas. Para la décima fecha ya te había ganado en clasificación dos veces. Los medios empezaron a hablar de "relevo generacional". Fue una decisión demasiado generosa.' },
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
      { text: 'Trabajar con un psicólogo deportivo (-$40,000)', stat: 'speed', delta: 0, money: -40000, skillStat: 'speed', skillBonus: 5, skillFail: 1, hint: '🚀 Velocidad: tu mente puede liberarte o seguir frenándote. El trabajo mental es tan real como el técnico.', successDesc: 'Cuatro semanas de sesiones. Visualización, respiración, exposición gradual. El día que volviste a esa curva a fondo sin pensarlo, el ingeniero no dijo nada. Pero por radio se escuchó: "Vuelta récord del sector, P1." El bloqueo se había ido.', failDesc: 'El psicólogo trabajó, pero los resultados no llegaron a tiempo. Seguiste perdiendo esas décimas durante toda la temporada. El equipo movió el balance para compensar, pero nunca fue lo mismo. Algunas cicatrices llevan su tiempo.' },
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
    icon: '🤝', title: 'Alianza Estratégica con {{PEER_NAME}}', desc: 'En la Q3, en un circuito rapidísimo, vos y {{PEER_NAME}} salen juntos a la pista. Él te ofrece darse rebufo mutuamente para bajar los tiempos y arruinarle la pole a los favoritos.', choices: [
      { text: 'Aceptar el trato y coordinar en pista', stat: 'quali', delta: 0, money: 0, peerRelDelta: +15, peerRelFailDelta: -25, skillStat: 'quali', skillBonus: 4, skillFail: -2, hint: '🏎 Clasificación: depende de tu capacidad técnica clavar los tiempos con el rebufo.', successDesc: 'Coordinación perfecta. Ambos bajaron tres décimas y clasificaron en primera fila. Al bajarse de los autos, chocaron los puños. Esto es respeto puro.', failDesc: 'Trataste de aprovechar el rebufo, pero frenaste tarde y bloqueaste los neumáticos. Le arruinaste la vuelta a él y perdiste la tuya. La tensión en boxes se corta con un cuchillo.' },
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
      { text: 'Ignorar y seguir apretando', pureLuck: true, baseBonus: 0.50, desc: 'Cara o cruz: ganás ritmo o expotás el motor.', successDesc: 'Las alertas eran falsas. El motor aguantó las últimas vueltas y terminaste sin ningún problema. A veces hay que confiar en el auto.', failDesc: 'Vuelta 54. El motor expotó en la recta más larga. Columna de humo blanco. Retiro mécanico desde la primera curva. Las alertas no eran falsas.' },
      { text: 'Bajar la potencia y rezar', pureLuck: true, baseBonus: 0.90, noWinOnSuccess: true, desc: 'Muy probable que llegues, pero perdés chances de atacar.', successDesc: 'Llegaste. Sin el ritmo para atacar, pero llegaste. El motor pudo aguantar, puntos asegurados.', failDesc: 'Incluso en modo bajo consumo, el motor no aguantó. Se apagó solo en la vuelta 58. El motor iba a romperse sin importar nada.', onFailDnf: true },
    ]
  },
  {
    id: 'peer_ordenes',
    icon: '📻', title: '"Multi 21" - Órdenes de equipo', desc: 'Tu compañero de equipo viene muy pegado atrás con mejor ritmo.', radioMsg: '"Piloto, muro. Necesito que dejes pasar al {{PEER_NAME}}. Tiene mejor estrategia de gomas desde acá. Es decisión de equipo. Confirmá recepción."', choices: [
      { text: 'Acatar la orden y dejarlo pasar', pureLuck: true, baseBonus: 1.0, noWinOnSuccess: true, peerRelDelta: +15, repDelta: +20, successDesc: 'Levantaste el pie en la recta. El equipo te agradeció y sumaste puntos vitales para los constructores. Eres un jugador de equipo.', failDesc: 'Levantaste el pie.' },
      { text: 'Ignorar la radio y apretar el ritmo', skillStat: 'overtake', statBonus: 0.8, baseBonus: 0.2, noWinOnSuccess: true, onFailDnf: 0.5, peerRelDelta: -30, repDelta: -40, failDesc: 'Lo ignoraste, pero él se tiró igual por adentro. ¡Toque entre compañeros! Los dos afuera. El jefe de equipo está furioso.', failSurviveDesc: 'Lo ignoraste, él intentó pasar pero aflojó a último momento. Conservaste la posición, pero el clima en boxes es cortante (-10 Relación, -10 Reputación).', successDesc: 'Fingiste que no escuchabas, bajaste los tiempos y te escapaste. El equipo no pudo decir nada al verte cruzar la meta primero.' }
    ]
  },
  {
    id: 'peer_brake_test',
    icon: '🛑', title: 'Brake Test Bajo Safety Car', desc: 'La tensión es máxima. Están detrás del Auto de Seguridad.', radioMsg: '"¡PILOTO, CUIDADO! {{PEER_NAME}} FRENÓ FUERTE AHORA MISMO DELANTE TUYO. ¡REACCIONÁ!"', choices: [
      { text: 'Volantazo ciego', pureLuck: true, baseBonus: 0.5, noWinOnSuccess: true, onFailDnf: true, repDelta: +10, failDesc: 'Pegaste el volantazo pero enganchaste su rueda trasera y terminaste contra el muro. Abandono absurdo.', successDesc: 'Tus reflejos salvaron el auto por milímetros. Pasaste por al lado y le hiciste un gesto a la cámara. ¡Reflejos de gato!' },
      { text: 'Frenar a fondo en línea recta', pureLuck: true, baseBonus: 0.5, noWinOnSuccess: true, onFailDnf: true, repDelta: +10, failDesc: 'No llegaste a frenar. Le destruiste el alerón trasero y rompiste tu suspensión. Los dos afuera.', successDesc: 'Clavaste los frenos y te detuviste a un milímetro de su caja de cambios. Hubo humo, pero no contacto.' }
    ]
  }
];




const INTERVIEWS = [
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
      id: 'f1_zero_points',
      title: 'Temporada en blanco',
      desc: 'Ha sido un año durísimo. Terminaste la temporada de Fórmula 1 sin haber sumado ni un solo punto.',
      choices: [
        { text: '"El coche simplemente no daba para más"', pers: 'team', delta: -15, pers2: 'media', delta2: 10, hint: 'Culpas a la máquina (-Equipo, +Medios).', fixedDesc: '"Fuimos el equipo más lento todo el año, milagros no puedo hacer." Te sacaste la responsabilidad, pero los mecánicos te miran mal.' },
        { text: '"Debo mejorar mi conducción"', pers: 'team', delta: 15, hint: 'Asumes la culpa (+Equipo).', fixedDesc: '"He cometido demasiados errores. Prometo volver más fuerte." Asumiste la responsabilidad como un líder.' }
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
      id: 'ev_agent',
      title: '👔 Oferta bajo la mesa',
      desc: 'Tu Agente Estrella te llama: "Tengo un pre-contrato con un equipo de 5 estrellas para el año que viene. Lo firmás ahora o esperamos a fin de año".',
      choices: [
        { text: 'Firmar ya', pers: 'aggressiveness', delta: 15, hint: 'Aseguras asiento en un equipo TOP.', fixedDesc: 'Firmaste en secreto. Pase lo que pase este año, tu futuro en un equipo de punta está asegurado.' },
        { text: 'Esperar a fin de año', pers: 'team', delta: 15, hint: 'Enfocarte en tu equipo actual.', fixedDesc: 'Decidiste esperar y ser leal a tu temporada actual. El futuro se verá luego.' }
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
        { text: 'Patrocinarlo ($1.000.000)', pers: 'media', delta: 15, hint: 'Cuesta plata pero ganas muchísima reputación.', fixedDesc: 'Pagaste de tu bolsillo su temporada. Te costó plata, pero el mundo aplaude tu gesto (-$1M, +20 Reputación).' },
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
      desc: 'Tras unos duros abandonos, tu Psicólogo te propone una polémica terapia alternativa en el bosque antes de la carrera.',
      choices: [
        { text: 'Aceptar terapia', pers: 'media', delta: -15, hint: 'Riesgo / Recompensa alta.', fixedDesc: 'Fuiste al bosque a gritar y meditar. Te sentís purificado y listo para ganar. (+10 Velocidad esta carrera)' },
        { text: 'Rechazar', pers: 'aggressiveness', delta: 10, hint: 'Seguir con lo tradicional.', fixedDesc: 'Lo mandaste a pasear. Sos un piloto, no un yogui. Correrás como siempre.' }
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
    desc: 'Tu contrato termina este año y estás rindiendo por encima del coche. La prensa pregunta sobre tu futuro.',
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
    desc: 'Acábas de dejar pasar a tu compañero por órdenes del equipo. La prensa te pregunta qué pensas sobre eso.',
    choices: [
      { text: '"Soy un hombre de la empresa"', pers: 'team', delta: 25, hint: 'Sumás puntos para el equipo (+Equipo).', fixedDesc: '"Me pagan para sumar puntos para el equipo, no para mi ego." El jefe de equipo sonrió.' },
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
    desc: 'Tu relación con tu rival es pésima y no se hablan. La prensa lo sabe y tira leña al fuego.',
    choices: [
      { text: '"No vengo a hacer amigos"', pers: 'aggressiveness', delta: 20, hint: 'Llenás de titulares los diarios (+Agresividad).', fixedDesc: '"Nos pagan por ganar, no por tomar café juntos." La rivalidad se encendió aún más.' },
      { text: '"Lo respeto como piloto"', pers: 'media', delta: 15, hint: 'Respuesta madura (+Mediático).', fixedDesc: '"Fuera de la pista es otra historia, adentro somos rivales." Una respuesta madura.' }
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
    id: 'f1_peer_departure',
    title: 'Separación de caminos',
    desc: 'Después de varias temporadas compartiendo garaje, tu compañero deja el equipo. La prensa te pregunta qué significó para vos.',
    choices: [
      { text: '"Fue un gran compañero"', pers: 'team', delta: 15, hint: 'Mostrás respeto (+Equipo).', fixedDesc: '"Competimos duro, pero siempre empujamos al equipo hacia adelante." La despedida fue cordial.' },
      { text: '"Ahora veremos quién era el problema"', pers: 'aggressiveness', delta: 20, hint: 'No perdés la oportunidad de lanzar una indirecta (+Agresividad).', fixedDesc: '"El próximo año tendremos respuestas." La frase no tardó en llegar a su nuevo equipo.' },
      { text: '"Que le vaya bien... excepto contra mí"', pers: 'media', delta: 15, hint: 'Convertís la despedida en un titular (+Mediático).', fixedDesc: 'La frase fue tomada como una broma, aunque algunos en el paddock no estaban tan seguros.' }
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
];

function showInterview(postSeasonId = null) {
  // Select an interview
  let pool = INTERVIEWS.filter(iv => {
    if (postSeasonId) return iv.id === postSeasonId;
    const psIds = ['f1_epic_champion', 'f1_championship_contender', 'f1_retirement_talk', 'f1_win_record', 'f1_teammate_destroyed', 'f1_peer_departure', 'f1_first_title', 'f1_title_lost', 'f1_title_record_broken', 'f1_constructors_champ', 'f1_teammate_champ', 'f1_zero_points', 'f1_reg_change_better', 'f1_reg_change_worse'];
    if (!postSeasonId && (psIds.includes(iv.id) || iv.id.startsWith('ev_'))) return false; // Hide post-season interviews from mid-season
    if (G.catIndex < 5) return false; // ONLY IN F1
    if (G.storyFlags['interview_' + iv.id]) return false; // NO REPEATS

    if (iv.id === 'first_win') {
      if (!G.lastResult || G.lastResult.cat !== 'F1' || G.lastResult.wins === 0) return false;
      return true; // Must trigger if conditions met
    }
    
    // NEW INTERVIEW LOGIC
    if (iv.id === 'f1_transfer_rumors') {
      if (!G.lastResult || G.lastResult.cat !== 'F1') return false;
      if (G.contract !== 1) return false;
      const expectedPosition = 12 - (G.team ? G.team.stars * 2 : 2); // Roughly expected champ pos
      if (G.lastResult.champ > expectedPosition) return false; // Only if overperforming or doing great
      return true;
    }
    
    if (iv.id === 'f1_underperform') {
      if (!G.lastResult || G.lastResult.cat !== 'F1') return false;
      if (!G.team || G.team.stars < 3) return false; // Only top/mid teams
      const expectedPosition = 12 - (G.team.stars * 2);
      if (G.lastResult.champ <= expectedPosition + 2) return false; // Must be severely underperforming
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
    if (iv.id === 'bad_streak' && (G.wins > 0 || G.podiums > 0)) return false;
    return true;
  });
  
  if (pool.length === 0) {
    processSeasonStep();
    return;
  }
  
  // Prioritize first_win
  let ivTemplate = pool.find(i => i.id === 'first_win');
  if (!ivTemplate) ivTemplate = randFrom(pool);
  
  const iv = JSON.parse(JSON.stringify(ivTemplate));
  
  

  
  const isEventMode = iv.id.startsWith('ev_');
  
  if (isEventMode && G.storyFlags['interview_' + iv.id]) {
      // If it was already seen but queued multiple times by a bug, skip it
      processSeasonStep();
      return;
  }

  document.getElementById('int-title').textContent = iv.title;
  const screenInt = document.getElementById('screen-interview');
  
  // The first element is the emoji div
  
  const labelDiv = screenInt.querySelector('.label');
  const cardDiv = screenInt.querySelector('.card');

  if (isEventMode) {
      screenInt.style.background = 'radial-gradient(ellipse at top, rgba(235, 180, 50, 0.1) 0%, transparent 60%)';
      if (labelDiv) {
          labelDiv.style.color = 'var(--accent)';
          labelDiv.innerHTML = '✨ Evento Exclusivo';
      }
      if (cardDiv) {
          cardDiv.style.borderColor = 'var(--accent)';
      }
  } else {
      screenInt.style.background = 'radial-gradient(ellipse at top, rgba(74, 144, 232, 0.1) 0%, transparent 60%)';
      if (labelDiv) {
          labelDiv.style.color = 'var(--blue)';
          labelDiv.innerHTML = '🎙️ Sala de Prensa';
      }
      if (cardDiv) {
          cardDiv.style.borderColor = 'var(--blue)';
      }
  }



    let ivDesc = iv.desc;
    if (iv.id === 'f1_peer_departure' && G.peer && G.peer.team) {
      const f1Teams = TEAMS['F1'] || [];
      const newTeamObj = f1Teams.find(t => t.name === G.peer.team);
      const logoHtml = (newTeamObj && newTeamObj.logo) 
        ? `<img src="${newTeamObj.logo}" style="height:16px; vertical-align:middle; margin-left:6px; margin-right:2px; border-radius:2px">` 
        : '';
      ivDesc += ` <br><span style="color:var(--muted); font-size:13px">(Se confirmó que firmó con${logoHtml} <b>${G.peer.team}</b>)</span>`;
    }
    document.getElementById('int-desc').innerHTML = ivDesc;

  const ch = document.getElementById('int-choices');
  ch.innerHTML = '';
  
  iv.choices.forEach(c => {
    const b = document.createElement('div');
    b.className = 'minigame-choice';
    b.innerHTML = `
      <h3>${c.text}</h3>
      ${c.hint ? `<div style="font-size:12px;color:var(--blue);margin-top:4px">${c.hint}</div>` : ''}
    `;
    
    b.onclick = () => {
      // Apply personality changes
      G.storyFlags['interview_' + iv.id] = true;
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
      
      
      const isEvent = iv.id.startsWith('ev_');
        let logText = isEvent ? `Evento: ${c.text}` : `Entrevista: "${c.text}"`;
        
        let actualRepDelta = c.repDelta || 0;
        if (actualRepDelta !== 0) {
           G.reputation += actualRepDelta;
           logText += ` (${actualRepDelta > 0 ? '+' : ''}${actualRepDelta} Reputación)`;
        }
        
        G._seasonEventLogs.push(logText);
      
      ch.innerHTML = `
        <div class="card" style="padding: 24px; border-color: ${iv.id.startsWith('ev_') ? 'var(--accent)' : 'var(--blue)'}">
          <div style="font-size:32px;margin-bottom:8px;text-align:center">${iv.id.startsWith('ev_') ? '✨' : '📸'}</div>
          <div class="heading" style="font-size:18px;margin-bottom:12px;text-align:center">${iv.id.startsWith('ev_') ? 'Resolución del evento' : 'Declaraciones publicadas'}</div>
          <div style="font-size:14px;line-height:1.6;color:var(--text);background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;margin-bottom:16px;text-align:left;border-left:3px solid ${iv.id.startsWith('ev_') ? 'var(--accent)' : 'var(--blue)'}">${c.fixedDesc}</div>
          <button class="btn btn-primary" style="width:100%" onclick="${postSeasonId ? 'afterSummary()' : 'processSeasonStep()'}">Continuar</button>
        </div>
      `;
    };
    ch.appendChild(b);
  });
  
  goto('screen-interview');
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

function resetGame() {
  G = {};
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('path-bar').style.display = 'none';
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
      speed: 40 + Math.floor(Math.random() * 11),
      quali: 40 + Math.floor(Math.random() * 11),
      rain: 40 + Math.floor(Math.random() * 11),
      tyres: 40 + Math.floor(Math.random() * 11),
      overtake: 40 + Math.floor(Math.random() * 11)
    },
    money: 50000,
    reputation: 0,
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
    _directivaUsed: false,
    peer: null,
    _peerInitialized: false,
    wetWins: 0,
    storyFlags: {},
    personality: { aggressiveness: 0, media: 0, team: 0 }
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
  document.getElementById('tb-ovr').textContent = ovr;
  document.getElementById('tb-rep').textContent = G.reputation;
  document.getElementById('tb-money').textContent = fmt$(G.money);
  document.getElementById('money-display2').textContent = G.money.toLocaleString('es-AR');
  document.getElementById('upgrade-money').textContent = fmt$(G.money);
}

function updatePathBar() {
  const SHORT = { 'Karting': 'Karting', 'F4': 'F4', 'Formula Regional': 'FR', 'F3': 'F3', 'F2': 'F2', 'F1': 'F1' };
  const row = document.getElementById('path-row');
  row.innerHTML = '';
  CATEGORIES.forEach((c, i) => {
    const s = document.createElement('div');
    s.className = 'path-step ' + (i < G.catIndex ? 'done' : i === G.catIndex ? 'current' : 'future');
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
    regChangeHtml = `<div style="color:#facc15;font-size:13px;margin-top:4px">⚠️ Nuevo Reglamento: Tu equipo tiene ${effectiveStars} estrellas</div>`;
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
  const pool = [...ACTIVITIES_COMMON];
  const picked = shuffle(pool).slice(0, 3);
  if (Math.random() < 0.15) picked.push(randFrom(ACTIVITIES_RARE));
  if (Math.random() < 0.03) picked.push(randFrom(ACTIVITIES_LEGENDARY));

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
    for (const [k, v] of Object.entries(G.chosenActivity.stats)) {
      G.stats[k] = Math.min(G.potential, G.stats[k] + v);
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

    // Natural growth (aging curve)
    const age = G.age;
    let logMsg = '';

    // Team focus growth multiplier (only formative categories)
    // desarrollo = old baseline, equilibrado = slightly less, ganar = much less
    const focusGrowthMult = (G.team && G.team.focus === 'desarrollo') ? 1.0
      : (G.team && G.team.focus === 'ganar') ? 0.5
        : 0.75; // equilibrado or F1

    const tb = G.upgrades.includes('track') ? 0.75 : 0;
      if (age < 18) {
        logMsg = `🌱 Por tu juventud (Edad ${age}), tus atributos mejoraron notablemente.`;
        if (tb) logMsg += ' (Bonus de Pista)';
      for (const k of Object.keys(G.stats)) G.stats[k] = clamp(G.stats[k] + (3 + Math.random() * 2.5 + (typeof tb !== 'undefined' ? tb : 0)) * focusGrowthMult, 1, G.potential);
    }
    else if (age < 23) {
      logMsg = `🌱 Seguís desarrollándote a gran ritmo (Edad ${age}).`;
      for (const k of Object.keys(G.stats)) G.stats[k] = clamp(G.stats[k] + (1.5 + Math.random() * 2 + (typeof tb !== 'undefined' ? tb : 0)) * focusGrowthMult, 1, G.potential);
    }
    else if (age < 28) {
      logMsg = `🌱 Acercándote a tu máximo potencial (Edad ${age}), seguís puliendo detalles.`;
      for (const k of Object.keys(G.stats)) G.stats[k] = clamp(G.stats[k] + (0.3 + Math.random() * 1.7 + (typeof tb !== 'undefined' ? tb : 0)) * focusGrowthMult, 1, G.potential);
    }
    else if (age < 34) {
      logMsg = `⭐ Estás en tu plenitud física y mental (Edad ${age}). Atributos estables.`;
      for (const k of Object.keys(G.stats)) G.stats[k] = clamp(G.stats[k] + (Math.random() * 1.5 - 0.9 + (typeof tb !== 'undefined' ? tb : 0)), 1, G.potential);
    }
    else if (age < 38) {
      logMsg = `🍂 Los años empiezan a pesar (Edad ${age}). Tus reflejos y estado físico caen notablemente.`;
      const decayMult = G.upgrades.includes('cryo') ? 0.2 : (G.upgrades.includes('mansion') ? 0.5 : 1); if(decayMult<1) logMsg+=' (Mitigado)'; for (const k of Object.keys(G.stats)) G.stats[k] = clamp(G.stats[k] - (1 + Math.random() * 3) * decayMult, 1, G.potential);
    }
    else {
      logMsg = `🍂 Estás en el ocaso de tu carrera (Edad ${age}). Tus atributos se desploman.`;
      const decayMult2 = G.upgrades.includes('cryo') ? 0.2 : (G.upgrades.includes('mansion') ? 0.5 : 1); if(decayMult2<1) logMsg+=' (Mitigado)'; for (const k of Object.keys(G.stats)) G.stats[k] = clamp(G.stats[k] - (3 + Math.random() * 4) * decayMult2, 1, G.potential);
    }

    // Log team focus effect
    if (G.team && G.team.focus === 'desarrollo') {
      G._seasonEventLogs.push('📚 Tu equipo priorizó tu desarrollo como piloto. Mayor crecimiento de atributos.');
    } else if (G.team && G.team.focus === 'ganar') {
      G._seasonEventLogs.push('🏆 Tu equipo priorizó los resultados. Menor crecimiento pero mejor rendimiento en pista.');
    }

    G._seasonEventLogs.push(logMsg);

    // In F1, regulation changes happen every 4 to 6 years
    if (CATEGORIES[G.catIndex] === 'F1') {
      if (!G.nextRegChangeYear) {
        G.nextRegChangeYear = G.year + 4 + Math.floor(Math.random() * 3);
      }
      if (G.year >= G.nextRegChangeYear) {
        G._pendingRegChange = true;
        G.lastRegChangeYear = G.year;
        G.nextRegChangeYear = G.year + 4 + Math.floor(Math.random() * 3);
        G._seasonSteps.push('regulation');
      }
    }

    G._seasonSteps.push('compute');

    const hasEvent = Math.random() < 0.4;
    const hasMini = Math.random() < 0.2;
    if (hasEvent) G._seasonSteps.push('event');
    if (hasMini) G._seasonSteps.push('minigame');
    const hasInterview = Math.random() < 0.3 || (G.catIndex === 5 && G.wins > 0 && !G.storyFlags.firstWinDone);
    if (hasInterview) G._seasonSteps.push('interview');

    processSeasonStep();
  }, 2100);
}

function processSeasonStep() {
  if (!G._seasonSteps || G._seasonSteps.length === 0) {
    checkNicknames();
    buildSummary();
    goto('screen-summary');
    return;
  }
  const step = G._seasonSteps.shift();
  if (step === 'regulation') showRegulationEvent();
  else if (step === 'event') showRandomEvent();
  else if (step === 'minigame') showMinigame();
  else if (step === 'interview') showInterview();
  else if (step.startsWith('event:')) showInterview(step.split(':')[1]);
  else if (step === 'compute') {
    computeSeasonResult();
    processSeasonStep();
  }
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
      G._seasonEventLogs.push(`⚔️ Enemistad con ${G.peer.name}: +Agresividad, -Gestión y +Riesgo.`);
    } else if (G.peer.relationship > 30) {
      effStats.tyres = clamp(effStats.tyres + 6, 1, 99);
      effStats.quali = clamp(effStats.quali + 6, 1, 99);
      extraDnf = -1;
      G._seasonEventLogs.push(`🤝 Sintonía con ${G.peer.name}: +Gestión, +Clasificación y -Riesgo.`);
    }
  }

  // 1. Weighted base rating
  const weightedBase = (
    effStats.speed * 0.35 +
    effStats.quali * 0.25 +
    effStats.tyres * 0.20 +
    effStats.overtake * 0.15 +
    effStats.rain * 0.05
  );

  // 2. Wet season mechanics
  const wetSeason = Math.random() < 0.30;
  const rainBonus = wetSeason ? (effStats.rain - 50) * 0.15 : 0;
  if (wetSeason) {
    G._seasonEventLogs.push(`¡Temporada lluviosa! (Bonus por Lluvia: ${rainBonus > 0 ? '+' : ''}${Math.round(rainBonus)})`);
  }

  // 3. Effective rating (incorporates car performance for F1)
  // In F1: car is 85%, driver is 15%. Top cars nerfed to keep it competitive.
  let eff = weightedBase + rainBonus;
  if (cat === 'F1') {
    const effectiveStars = clamp(G.team.stars + (G._tempStarBonus || 0), 1, 5);
    const carRating = effectiveStars === 1 ? 15 : effectiveStars === 2 ? 30 : effectiveStars === 3 ? 55 : effectiveStars === 4 ? 78 : 92;
    eff = (weightedBase * 0.15) + (carRating * 0.85) + rainBonus;
    // Apply regulation bonus if player chose to focus on current season
    if (G.regulationBonus > 0) {
      eff += G.regulationBonus;
      G.regulationBonus = 0; // consume it
    }
  }

  // Team focus: 'ganar' teams boost effective rating in formative categories
  const focusRatingBonus = (G.team && G.team.focus === 'ganar') ? 8
    : (G.team && G.team.focus === 'desarrollo') ? -5
      : 0;
  eff += focusRatingBonus;

  // 4. Reduced luck factor
  const luck = rand(-8, 8);
  const rating = clamp(eff + luck, 1, 99);

  // Races per category
  const races = [12, 14, 14, 16, 14, 24][G.catIndex];

  // 5. Calculate results with specific stat impacts
  const champ = calcChampPosition(rating);

  // Base stat modifiers (0 to 1) to influence where in the range they land
  const overtakeFactor = (effStats.overtake - 1) / 98;
  const consistencyFactor = (effStats.tyres - 1) / 98;
  const qualiFactor = (effStats.quali - 1) / 98;

  let wins = 0;
  let podiums = 0;
  let poles = 0;

  // Helper to pick a number within a range, biased by a factor (0-1)
  const pickRange = (min, max, factor) => {
    // Add significant random variance so consecutive seasons aren't identical
    const randomVariance = (Math.random() * 0.5) - 0.25; // -0.25 to +0.25
    const finalFactor = clamp(factor + randomVariance, 0, 1);
    
    const base = min + (max - min) * finalFactor;
    return Math.round(base); 
  };

  if (champ === 1) {
    // Campeón: usamos un dominio base y le aplicamos ruido para que haya variabilidad pero manteniendo coherencia
    let baseDom = Math.random();
    let domWins = clamp(baseDom + (Math.random() * 0.4 - 0.2), 0, 1);
    let domPods = clamp(baseDom + (Math.random() * 0.4 - 0.2), 0, 1);
    let domPoles = clamp(baseDom + (Math.random() * 0.4 - 0.2), 0, 1);
    
    // Si el auto es de 4 estrellas o menos, forzamos un campeonato MUY ajustado
    if (cat === 'F1' && (G.team.stars + (G._tempStarBonus || 0)) <= 4) {
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
      minWins *= 0.80; // Reducir victorias base
      maxWins *= 0.80; // Reducir tope de victorias
      minPods = races * 0.55; // Aumentar mínimo de podios
      maxPods = races * (0.65 + 0.35 * domPods); // Podría llegar a casi 100% de podios en dominios altos
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

  podiums = Math.max(podiums, wins); // Sanity check

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
    if (!G.storyFlags['interview_ev_agent'] && G.upgrades.includes('agent') && G.f1ContractYearsLeft > 0 && Math.random() < 0.1) possibleEvents.push('ev_agent');
    
    if (possibleEvents.length > 0) {
        if (!G._postSeasonSteps) G._postSeasonSteps = [];
        G._postSeasonSteps.push(possibleEvents[Math.floor(Math.random() * possibleEvents.length)]);
    }
  }
  const tyreFactor = (effStats.tyres - 50) / 100;
  const dnfs = Math.max(0, Math.round(dnfBase - tyreFactor * 2));

  // 6. Financials and Reputation
  const salary = [30000, 80000, 150000, 300000, 500000, 2000000][G.catIndex];
  const mediaMult = 1.0 + (G.personality.media / 200); // -50% to +50%
  const earned = (salary + wins * 20000) * mediaMult;
  // Team focus: 'ganar' boosts rep, 'desarrollo' reduces it
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

  const teamName = G.team ? G.team.name : '—';
  const teamLogo = G.team && G.team.logo ? G.team.logo : null;
  const teamStars = G.team ? G.team.stars : null;
  const result = { cat, year: G.year, champ, wins, podiums, poles, dnfs, earned, rep, rating, teamName, teamLogo, teamStars, age: G.age, races };
  G.seasons.push(result);
  G.lastResult = result;

  if (result.champ === 1 && result.cat === 'F1') {
    G.f1Titles++;
    G.f1ConsecutiveTitles++;
    if (G.team.stars <= 4) G.epicTitles++;
  } else if (result.cat === 'F1') {
    G.f1ConsecutiveTitles = 0;
  }
  if (!G.careerBest || wins > G.careerBest.wins) G.careerBest = result;

  G._postSeasonSteps = [];
  if (cat === 'F1') {
    if (G.peer) {
      if (G.team.name === G.peer.team) {
        G.peer.yearsAsTeammate = (G.peer.yearsAsTeammate || 0) + 1;
      } else {
        G.peer.yearsAsTeammate = 0;
      }
    }

    if (G.f1Titles > 7 && !G.storyFlags['interview_f1_title_record_broken']) {
      G._postSeasonSteps.push('f1_title_record_broken');
    }
    else if (champ === 1 && G.f1Titles === 1 && !G.storyFlags['interview_f1_first_title']) {
      G._postSeasonSteps.push('f1_first_title');
    }
    else if (champ === 1 && G.team.stars <= 4 && !G.storyFlags['interview_f1_epic_champion']) {
      G._postSeasonSteps.push('f1_epic_champion');
    }
    else if (champ === 2 && wins >= 4 && !G.storyFlags['interview_f1_title_lost']) {
      G._postSeasonSteps.push('f1_title_lost');
    }
    else if ((champ === 2 || champ === 3) && wins < 4 && !G.storyFlags['interview_f1_championship_contender']) {
      G._postSeasonSteps.push('f1_championship_contender');
    }
    
    if (G.peer && G.team.name === G.peer.team && champ <= 10 && G.peer.h2hWins > G.peer.h2hLosses + 10 && !G.storyFlags['interview_f1_teammate_destroyed']) {
      G._postSeasonSteps.push('f1_teammate_destroyed');
    }
    
    if (G.peer && G.team.name === G.peer.team && G.f1ContractYearsLeft > 0 && G.peer.yearsAsTeammate >= 3) {
      if (G.peer.contractYearsLeft <= 1) { 
        const otherTeams = TEAMS['F1'].filter(t => t.name !== G.team.name);
        const newTeam = otherTeams[Math.floor(Math.random() * otherTeams.length)].name;
        G.peer.team = newTeam; 
        G.peer.contractYearsLeft = 2 + Math.floor(Math.random() * 3); 
        G._seasonEventLogs.push(`🏎️ ${G.peer.name} firmó contrato con ${newTeam} para la próxima temporada.`);
        if (!G.storyFlags['interview_f1_peer_departure']) {
          G._postSeasonSteps.push('f1_peer_departure');
        }
      }
    }
    
    if (G.wins >= 105 && !G.storyFlags['interview_f1_win_record']) {
      G._postSeasonSteps.push('f1_win_record');
    }
    
    if (G.age >= 35 && !G.storyFlags['interview_f1_retirement_talk']) {
      G._postSeasonSteps.push('f1_retirement_talk');
    }
  
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
    if (G.nextSeasonRegBonus > 0) {
      G.team.stars = Math.min(5, G.team.stars + G.nextSeasonRegBonus);
      G.nextSeasonRegBonus = 0;
    }
      
      const newStars = G.team.stars;
      if (!G._postSeasonSteps) G._postSeasonSteps = [];
      if (newStars > oldStars) {
        G._postSeasonSteps.push('f1_reg_change_better');
      } else if (newStars < oldStars) {
        G._postSeasonSteps.push('f1_reg_change_worse');
      }

    G._seasonEventLogs.push(`📝 ¡El nuevo reglamento entró en vigor! El mapa de poder en F1 ha cambiado.`);
  }
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
function showRegulationEvent() {
  const icon = document.getElementById('ev-icon');
  const title = document.getElementById('ev-title');
  const desc = document.getElementById('ev-desc');
  const ch = document.getElementById('ev-choices');

  const existingRadio = document.getElementById('ev-radio-block');
  if (existingRadio) existingRadio.remove();

  icon.textContent = '📐';
  title.textContent = '¡Cambio de Reglamento Técnico!';
  desc.textContent = `La FIA anunció un nuevo reglamento técnico que entrará en vigor al final de esta temporada. ¿Cómo enfocás los recursos de tu equipo?`;

  ch.innerHTML = '';

  const choices = [
    {
      text: '🏁 Apostar por esta temporada',
      subdesc: 'Beneficio: +8 de rendimiento ahora. Consecuencia: Tu equipo podría quedar peor posicionado.',
      effect: 'current',
    },
    {
      text: '⚖️ Dividir recursos',
      subdesc: 'Beneficio: +4 de rendimiento ahora. Mantenés tus opciones sin hipotecar el futuro ni el presente.',
      effect: 'split',
    },
    {
      text: '🔭 Apostar todo al nuevo reglamento',
      subdesc: 'Penalidad: -4 de rendimiento ahora. Después tenés una gran posibilidad de un salto en la parrilla.',
      effect: 'next',
    },
  ];

  choices.forEach(c => {
    const b = document.createElement('div');
    b.className = 'minigame-choice';
    b.innerHTML = `
      <h3>${c.text}</h3>
      <p style="margin-bottom:6px">${c.subdesc}</p>
    `;
    b.onclick = () => {
      let logText;
      if (c.effect === 'current') {
        G.regulationBonus = 8;
        G.nextSeasonRegPenalty = 1;
        G.nextSeasonRegBonus = 0;
        logText = `Decisión: Apostaste todo al campeonato actual.`;
      } else if (c.effect === 'split') {
        G.regulationBonus = 4;
        G.nextSeasonRegPenalty = 0;
        G.nextSeasonRegBonus = 0;
        logText = `Decisión: Dividiste los recursos equitativamente.`;
      } else {
        G.regulationBonus = -4;
        G.nextSeasonRegPenalty = 0;
        G.nextSeasonRegBonus = 1;
        logText = `Decisión: Apostaste el desarrollo al nuevo reglamento.`;
      }
      G._seasonEventLogs.push(logText);

      ch.innerHTML = `
        <div class="card" style="text-align:center; padding: 24px">
          <div style="font-size:36px;margin-bottom:12px">✅</div>
          <div class="heading" style="font-size:18px;margin-bottom:8px">Decisión tomada</div>
          <div class="sub" style="margin-bottom:16px">${logText}</div>
          <button class="btn btn-primary" onclick="processSeasonStep()">Continuar</button>
        </div>
      `;
    };
    ch.appendChild(b);
  });

  goto('screen-event');
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
    newDesc = 'Frío, calculador y estratégico. Cuidás las gomas como nadie y ganás carreras usando la cabeza.';
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
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    const val = Math.round(endValue * eased);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = endValue + suffix;
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

  const standingsRows = generateStandingsTable(r);

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
        <div style="font-size:12px; color:var(--muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:1px">Contemporáneo de Generación</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div style="font-weight:bold">${relIcon} ${G.peer.name} <span style="font-size:12px; color:var(--muted); font-weight:normal">(${G.peer.nat.flag} ${G.peer.team})</span></div>
          <div style="font-size:12px; color:${relColor}; font-weight:bold">${relLabel}</div>
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
  if (G._postSeasonSteps && G._postSeasonSteps.length > 0) {
    const nextId = G._postSeasonSteps.shift();
    showInterview(nextId);
    return;
  }

  const catIdx = G.catIndex;
  const r = G.lastResult;
  const careerLen = G.seasons.length;

  // Advance Age & Year
  G.year++;
  G.age++;

  // Check retirement
  const maxAge = 35 + Math.floor((r.rating || 50) / 20);
  if (G.age >= maxAge || (catIdx === 0 && r.champ > 15 && careerLen > 3)) {
    showRetirement();
    return;
  }

  // If in F1 with contract years remaining, skip market entirely
  if (catIdx === 5 && G.f1ContractYearsLeft > 0) {
    G.f1ContractYearsLeft--;
    G._prevCatIdx = catIdx;
    goToContracts(catIdx, false, true); // skipContracts=true
    return;
  }

  // Check if player can advance by position AND meets requirements in next category
  const posCanAdvance = r.champ <= 12 && G.catIndex < 5;
  const meetsNextReqs = posCanAdvance ? canMeetNextCatReqs(G.catIndex + 1) : false;
  const canAdvance = posCanAdvance && meetsNextReqs;
  const isFormative = G.catIndex < 5;
  const isChampion = r.champ === 1;

  // Position OK but no team accepts you in next category
  if (posCanAdvance && !meetsNextReqs && isFormative) {
    showNoOfferScreen(catIdx, r, true); // requirementsFailed=true
    return;
  }

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
    const skip = isChampion && Math.random() < 0.3 && G.catIndex < 3;
    G.catIndex += skip ? 2 : 1;
    G.catIndex = Math.min(G.catIndex, 5);
  }

  G._prevCatIdx = catIdx;
  goToContracts(catIdx);
}

function showGoldenBoyEvent(pendingSteps = []) {
  const topTeams = TEAMS['F1'].filter(t => t.stars >= 4);
  const offerTeam = randFrom(topTeams);

  document.getElementById('ev-icon').textContent = '🌟';
  document.getElementById('ev-title').textContent = 'Fichaje Estrella';
  document.getElementById('ev-desc').textContent = `Tus formidables actuaciones en categorías menores llamaron la atención de ${offerTeam.name}. Quieren saltarse los protocolos y ofrecerte un asiento inmediato en F1.`;

  const ch = document.getElementById('ev-choices');
  ch.innerHTML = '';

  const b1 = document.createElement('div');
  b1.className = 'minigame-choice';
  b1.innerHTML = `<h3>Aceptar oferta de ${offerTeam.name}</h3><p style="margin-bottom:6px">Firma con un equipo Top inmediatamente.</p>`;
  b1.onclick = () => {
    G.team = offerTeam;
    G.f1ContractYearsLeft = Math.random() < 0.5 ? 1 : 2;
    const salary = 2000000;
    G.money += salary; G.totalMoney += salary;

    G._prevCatIdx = 4;
    G._nextSteps = [...pendingSteps, 'preseason'];
    processNextStep();
  };
  ch.appendChild(b1);

  const b2 = document.createElement('div');
  b2.className = 'minigame-choice';
  b2.innerHTML = `<h3>Rechazar y ver el mercado</h3><p style="margin-bottom:6px">Prefiero explorar otras opciones y contratos menores primero.</p>`;
  b2.onclick = () => {
    G._prevCatIdx = 4;
    G._nextSteps = [...pendingSteps, 'contracts', 'preseason'];
    processNextStep();
  };
  ch.appendChild(b2);

  goto('screen-event');
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

  // Initialize or update peer when entering F1
  if (G.catIndex === 5) {
    if (!G._peerInitialized) {
      G._peerInitialized = true;
      generatePeer();
      steps.push({ type: 'message', title: '💥 Nueva Cara en la F1', desc: `${G.peer.name} (${G.peer.nat.flag}) debuta en la misma temporada que vos con ${G.peer.team}. ¡Tu carrera estará atada a la de él!` });
    } else {
      const peerMove = updatePeerContract();
      if (peerMove && peerMove.action === 'moves') {
        const peerNewTeamData = TEAMS['F1'].find(t => t.name === peerMove.newTeam);
        const peerLogoHtml = peerNewTeamData ? `<img src="${peerNewTeamData.logo}" style="height:14px;vertical-align:middle;margin-left:4px">` : '';
        steps.push({ type: 'message', title: '🔄 Mercado de Pilotos', desc: `${G.peer.name} firmó con ${peerMove.newTeam}${peerLogoHtml}.` });
      }
    }
  }

  // Golden Boy: check when entering F1 from F2
  if (oldCatIdx === 4 && G.catIndex === 5 && !G._goldenBoyChecked) {
    G._goldenBoyChecked = true;
    const formativeWins = G.seasons.filter(s => s.cat !== 'F1').reduce((acc, s) => acc + s.wins, 0);
    const top5F2 = G.lastResult && G.lastResult.champ <= 5;
    if (top5F2 && formativeWins >= 5 && Math.random() < 0.5) {
      showGoldenBoyEvent(steps);
      return;
    }
  }

  if (!skipContracts) steps.push('contracts');
  steps.push('preseason');
  G._nextSteps = steps;
  processNextStep();
}

function showNoOfferScreen(catIdx, r, reqsFailed = false) {
  const cat = CATEGORIES[catIdx];
  const nextCat = CATEGORIES[Math.min(catIdx + 1, 5)];
  const screen = document.getElementById('screen-contracts');
  screen.querySelector('.stripe').style.display = 'block';
  document.querySelector('#screen-contracts .heading').textContent = 'Sin ofertas';
  document.querySelector('#screen-contracts .sub').textContent = '';

  const list = document.getElementById('contracts-list');
  list.innerHTML = '';

  const reason = reqsFailed
    ? `Terminaste ${r.champ}° en ${cat}, pero ningún equipo de ${nextCat} te ofrece un asiento. No cumplís los requisitos de reputación u OVR. Tendrás que repetir ${cat} y mejorar.`
    : `Terminaste ${r.champ}° en ${cat}. Los equipos de la categoría superior no te tuvieron en cuenta. Tendrás que repetir ${cat}.`;

  const card = document.createElement('div');
  card.className = 'card';
  card.style.textAlign = 'center';
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px">🚫</div>
    <div class="heading" style="font-size:20px;margin-bottom:8px">Nadie te buscó</div>
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
      <div class="card" style="margin-bottom:24px">
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

  if (typeof step === 'object' && step.type === 'message') {
    showMessageScreen(step.title, step.desc);
  } else if (step === 'contracts') {
    showContracts();
  } else if (step === 'preseason') {
    const cat = CATEGORIES[G.catIndex];
    if (G._tempStarBonusCalculatedForYear !== G.year) {
      G._tempStarBonusCalculatedForYear = G.year;
      G._tempStarBonus = 0;
      const isRegChange = cat === 'F1' && G.lastRegChangeYear === (G.year - 1);
      
      let msgTitle = null;
      let msgDesc = null;

      if (isRegChange) {
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
  el.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    }
  };
  tick();
}

function showRandomEvent() {
  const playerStars = G.team ? G.team.stars : 0;

  // Build candidate event pool — filter out special one-time or conditional events
  let pool = RANDOM_EVENTS.filter(ev => {
    if (ev.id === 'pendrive') {
      // Only show if: player is in F1, on a 5-star team, and hasn't seen it this career
      if (G._pendriveUsed) return false;
      if (G.catIndex < 5) return false; // F1 only
      if (playerStars < 5) return false;
    }
    if (ev.id === 'rookie') {
      if (G.age < 30) return false;
      if (G.catIndex < 5) return false; // Only in F1
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
    if (ev.id === 'peer_choque' || ev.id === 'peer_amigo' || ev.id === 'peer_numero1') {
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
  const evTemplate = randFrom(pool);
  // Deep-clone so we can safely mutate descriptions
  const ev = JSON.parse(JSON.stringify(evTemplate));

  if (G.peer) {
    ev.title = ev.title.replace('{{PEER_NAME}}', G.peer.name);
    ev.desc = ev.desc.replace('{{PEER_NAME}}', G.peer.name);
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

  document.getElementById('ev-icon').textContent = ev.icon;
  document.getElementById('ev-title').textContent = ev.title;
  document.getElementById('ev-desc').textContent = ev.desc;

  // Team Radio block
  const existingRadio = document.getElementById('ev-radio-block');
  if (existingRadio) existingRadio.remove();
  if (ev.radioMsg) {
    let radioMsg = ev.radioMsg.replace('{{PEER_NAME}}', G.peer ? G.peer.name : 'tu compañero');
    radioMsg = radioMsg.replace(/Piloto/g, G.name).replace(/PILOTO/g, G.name.toUpperCase());
    const radioBlock = document.createElement('div');
    radioBlock.id = 'ev-radio-block';
    radioBlock.innerHTML = `
      <div style="font-family:monospace;font-size:12px;color:#4ade80;background:#0a1a0a;border:1px solid #1a3a1a;border-radius:6px;padding:10px 14px;margin-bottom:14px;text-align:left">
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

    const hintHtml = c.hint ? `<div style="font-size:12px;color:var(--accent);margin-top:4px">${c.hint}</div>` : '';
    b.innerHTML = `<h3>${c.text}</h3>${hintHtml}`;

    b.onclick = () => {
      let relChange = c.peerRelDelta || 0;
      if (success === false && c.peerRelFailDelta !== undefined) {
        relChange = c.peerRelFailDelta;
      }
      if (relChange && G.peer) {
        G.peer.relationship = clamp(G.peer.relationship + relChange, -100, 100);
      }
      G.stats[c.stat] = clamp(G.stats[c.stat] + resolvedDelta, 1, G.potential);
      // Handle base money cost (e.g. doctor)
      if (c.money) { G.money += c.money; G.totalMoney += Math.max(0, c.money); }
      // Handle conditional money for pureLuck outcomes
      if (c.pureLuck && success === true && c.successMoney) { G.money += c.successMoney; G.totalMoney += c.successMoney; }
      if (c.pureLuck && success === false && c.failMoney) { G.money += c.failMoney; G.totalMoney += Math.max(0, c.failMoney); }
      const resolvedMoney = c.money || (success === true && c.successMoney ? c.successMoney : 0) || (success === false && c.failMoney ? c.failMoney : 0);
      const deltaSign = resolvedDelta >= 0 ? '+' : '';
      const moneyText = resolvedMoney ? (resolvedMoney > 0 ? ` | +$${resolvedMoney.toLocaleString()}` : ` | -$${Math.abs(resolvedMoney).toLocaleString()}`) : '';
      const logText = `Evento: "${c.text}" → ${deltaSign}${resolvedDelta} ${STAT_LABELS[c.stat]}${moneyText}`;

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

      const outcomeIcon = resolvedDelta >= 0 ? '✅' : '❌';
      const statLine = `<div style="font-size:13px;color:var(--muted);margin-bottom:12px">${deltaSign}${resolvedDelta} ${STAT_LABELS[c.stat]}${moneyText}</div>`;
      const narrativeHtml = narrative
        ? `<div style="font-size:14px;line-height:1.6;color:var(--text);background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;margin-bottom:16px;text-align:left;border-left:3px solid ${resolvedDelta >= 0 ? '#4ade80' : '#f87171'}">${narrative}</div>`
        : '';

      ch.innerHTML = `
        <div class="card" style="padding: 24px">
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
function showMinigame() {
  let pool = MINIGAMES.filter(mg => {
    if (mg.id === 'midfield' && G.team && G.team.stars > 3) return false;
    if (mg.id === 'peer_ordenes') return G.peer && G.team && G.team.name === G.peer.team;
    if (mg.id === 'peer_brake_test') return G.peer && G.peer.relationship < -30;

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
  const mg = randFrom(pool);
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
      <div style="font-family:monospace;font-size:12px;color:#4ade80;background:#0a1a0a;border:1px solid #1a3a1a;border-radius:6px;padding:10px 14px;margin-bottom:14px;text-align:left">
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
      G.storyFlags['minigame_' + mg.id] = index;
      const success = Math.random() < successChance;
      let logText;
      const logName = c.pureLuck ? "Suerte" : STAT_LABELS[c.skillStat];
      const logStat = c.pureLuck ? "" : ` ${Math.round(G.stats[c.skillStat] || 50)}`;

      let repDelta = c.repDelta || 0;
      let peerRelDelta = c.peerRelDelta || 0;
      let narrative = success ? (c.successDesc || '') : (c.failDesc || '');
      const isNeutralFail = !success && c.neutralFail;

      if (success && !c.noWinOnSuccess) {
        G.lastResult.wins = Math.min(G.lastResult.wins + 1, 99);
        G.wins++;
        G.lastResult.podiums = Math.max(G.lastResult.podiums, G.lastResult.wins);
        G.podiums++;
        logText = `En pista: "${c.text}" [${logName}${logStat}${mg.hidePct ? '' : ' → ' + pct + '%'}] — ¡Éxito! +1 Victoria`;
      } else if (success && c.noWinOnSuccess) {
        logText = `En pista: "${c.text}" [${logName}${logStat}${mg.hidePct ? '' : ' → ' + pct + '%'}] — ¡Llegaste! Sin DNF.`;
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
      }
      G._seasonEventLogs.push(logText);

      const narrativeHtml = narrative
        ? `<div style="font-size:14px;line-height:1.6;color:var(--text);background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;margin-bottom:16px;text-align:left;border-left:3px solid ${success ? '#4ade80' : isNeutralFail ? '#9ca3af' : '#f87171'}">${narrative}</div>`
        : '';

      ch.innerHTML = `
        <div class="card" style="padding: 24px">
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

function showFlash(text) {
  const f = document.createElement('div');
  f.className = 'flash-number';
  f.textContent = text;
  f.style.fontSize = '36px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

// ═══════════════════════════════════════════════════════════
//  CONTRACTS
// ═══════════════════════════════════════════════════════════

// Check if player meets at least one team's requirements in a given category index
function canMeetNextCatReqs(nextCatIdx) {
  const ovr = Math.round(Object.values(G.stats).reduce((a, b) => a + b) / 5);
  const nextCatTeams = TEAMS[CATEGORIES[nextCatIdx]] || [];
  const agentModOvr = G.upgrades.includes('agent') ? -2 : 0;
  const agentModRep = G.upgrades.includes('agent') ? 0.9 : 1;

  const getReqsForCat = (stars, catIdx) => {
    const baseRep = [0, 100, 250, 400, 700, 1200][catIdx];
    const baseOvr = [40, 45, 50, 55, 65, 75][catIdx];
    const repStep = [40, 80, 100, 150, 200, 200][catIdx];
    const ovrStep = [3, 4, 4, 5, 5, 5][catIdx];

    if (stars === 5) return { rep: (baseRep + repStep * 2)*agentModRep, ovr: baseOvr + ovrStep * 2 + agentModOvr };
    if (stars === 4) return { rep: (baseRep + repStep)*agentModRep, ovr: baseOvr + ovrStep + agentModOvr };
    if (stars === 3) return { rep: baseRep*agentModRep, ovr: baseOvr + agentModOvr };
    if (stars === 2) return { rep: Math.max(0, (baseRep - repStep)*agentModRep), ovr: Math.max(0, baseOvr - ovrStep) + agentModOvr };
    return { rep: Math.max(0, (baseRep - repStep * 2)*agentModRep), ovr: Math.max(0, baseOvr - ovrStep * 2) + agentModOvr };
  };

  return nextCatTeams.some(t => {
    const reqs = getReqsForCat(t.stars, nextCatIdx);
    return G.reputation >= reqs.rep && ovr >= reqs.ovr;
  });
}
function showContracts() {
  const cat = CATEGORIES[G.catIndex];
  const allTeams = TEAMS[cat] || TEAMS['F1'];

  // Rep & OVR requirements logic
  const ovr = Math.round(Object.values(G.stats).reduce((a, b) => a + b) / 5);

  const getReqs = (stars) => {
    const baseRep = [0, 100, 250, 400, 700, 1200][G.catIndex];
    const baseOvr = [40, 45, 50, 55, 65, 75][G.catIndex];

    // Scale requirements based on category
    
      const repStep = [40, 80, 100, 150, 200, 200][G.catIndex];
      const agentModOvr = G.upgrades.includes('agent') ? -2 : 0;
      const agentModRep = G.upgrades.includes('agent') ? 0.9 : 1;
    
    const ovrStep = [3, 4, 4, 5, 5, 5][G.catIndex];

    if (stars === 5) return { rep: (baseRep + repStep * 2) * agentModRep, ovr: baseOvr + ovrStep * 2 + agentModOvr };
    if (stars === 4) return { rep: (baseRep + repStep) * agentModRep, ovr: baseOvr + ovrStep + agentModOvr };
    if (stars === 3) return { rep: baseRep * agentModRep, ovr: baseOvr + agentModOvr };
    if (stars === 2) return { rep: Math.max(0, baseRep - repStep) * agentModRep, ovr: Math.max(0, baseOvr - ovrStep) + agentModOvr };
    return { rep: Math.max(0, baseRep - repStep * 2) * agentModRep, ovr: Math.max(0, baseOvr - ovrStep * 2) + agentModOvr };
  };

  // Filter out teams that require more rep or ovr than you have
  let offerPool = allTeams.filter(t => {
    const reqs = getReqs(t.stars);
    return G.reputation >= reqs.rep && ovr >= reqs.ovr;
  });

  // Fallback: only for same-category repeats (should always have at least 1-2 star teams)
  if (offerPool.length === 0) {
    const minStars = Math.min(...allTeams.map(t => t.stars));
    offerPool = allTeams.filter(t => t.stars === minStars);
  }

  // F1 logic: limit offers based on previous performance and add renewals
  if (cat === 'F1') {
    const prevChamp = (G.lastResult && G.lastResult.cat === 'F1') ? G.lastResult.champ : 20;

    // Current team always gets to offer renewal if player met the position requirement for their team's stars
    const currentTeamInPool = allTeams.find(t => G.team && t.name === G.team.name);
    const renewalChampReq = G.team ? (G.team.stars >= 5 ? 8 : G.team.stars >= 4 ? 12 : G.team.stars >= 3 ? 18 : 20) : 20;
    const forceRenewal = currentTeamInPool && prevChamp <= renewalChampReq;
    if (forceRenewal && !offerPool.find(t => t.name === G.team.name)) {
      offerPool.push(currentTeamInPool);
    }

    offerPool = offerPool.filter(t => {
      if (G.team && t.name === G.team.name) return forceRenewal || prevChamp <= 15;
      if (t.stars === 5) return prevChamp <= 8;
      if (t.stars === 4) return prevChamp <= 12;
      if (t.stars === 3) return prevChamp <= 18;
      return true; // 1 and 2 stars always offer if you meet rep/ovr
    });

    offerPool = shuffle(offerPool);
    let finalOffers = [];
    const renewalTeam = offerPool.find(t => G.team && t.name === G.team.name);
    if (renewalTeam) {
      finalOffers.push(renewalTeam);
      offerPool = offerPool.filter(t => t.name !== renewalTeam.name);
    }
    finalOffers.push(...offerPool.slice(0, 3));
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

  const list = document.getElementById('contracts-list');
  list.innerHTML = '';

  // Restore the heading in case showCategoryChoiceScreen changed it
  document.querySelector('#screen-contracts .heading').textContent = 'Ofertas de equipos';
  document.querySelector('#screen-contracts .sub').textContent = `Elegí dónde correr la próxima temporada en ${cat}`;

  offerPool.forEach(team => {
    const salary = [30000, 80000, 150000, 300000, 500000, 2000000][G.catIndex];
    
      let salarySpin = Math.round(salary * (0.8 + Math.random() * 0.6) / 10000) * 10000;
      if (G.upgrades.includes('agent')) salarySpin = Math.round(salarySpin * 1.15); // agent_salary
    
    const isRegChange = cat === 'F1' && G.lastRegChangeYear === (G.year - 1);
    const probIdx = clamp(team.stars - 1, 0, 4);
    const stars = isRegChange ? '❓❓❓❓❓' : '★'.repeat(team.stars) + '☆'.repeat(5 - team.stars);
    // F1 contracts last 2-3 years
    const isF1 = G.catIndex === 5;
    const contractYears = isF1 ? (Math.random() < 0.5 ? 2 : 3) : 1;
    const contractLabel = isF1 ? `📋 Contrato: ${contractYears} temporadas` : '';
    const salaryTotal = isF1 ? `Total: ${fmt$(salarySpin * contractYears)}` : '';

    const reqRep = isRegChange ? '❓' : getReqs(team.stars).rep;
    const reqOvr = isRegChange ? '❓' : getReqs(team.stars).ovr;

    const isRenewal = (G.team && team.name === G.team.name);
    const prevChamp = (G.lastResult && G.lastResult.cat === 'F1') ? G.lastResult.champ : 20;
    // We mark it as opportunity if we are champion, it's a 5 star team, and it's NOT our renewal team (unless we want to?)
    const isOpportunity = (prevChamp === 1 && team.stars === 5 && !isRenewal);

    let badges = '';
    if (isRenewal) badges += '<span class="badge badge-green" style="font-size:10px;margin-left:6px;vertical-align:middle">Renovación</span>';
    if (isOpportunity) badges += '<span class="badge" style="background-color:#fbbf24;color:#000;font-size:10px;margin-left:6px;vertical-align:middle;padding:2px 6px;border-radius:4px;font-weight:bold">OPORTUNIDAD</span>';
    
    const isPeerTeam = (G.peer && team.name === G.peer.team);
    if (isPeerTeam) badges += `<span class="badge" style="background-color:#6366f1;color:#fff;font-size:10px;margin-left:6px;vertical-align:middle;padding:2px 6px;border-radius:4px;font-weight:bold">Compañero (${G.peer.name})</span>`;

    const c = document.createElement('div');

    if (isF1) {
      // ── F1: Holographic premium card ──
      c.className = 'card offer-card selectable holo-card' + (isOpportunity ? ' opportunity' : '');
      const teamColors = {
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
        'Red Bull': '#3671c6'
      };
      c.style.setProperty('--team-color', teamColors[team.name] || 'var(--accent)');

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
              <div style="font-size:11px; color:var(--muted); margin-top:6px">Prob. Ganar: <span style="color:#fff">${WIN_PROBS[probIdx]}</span></div>
            </div>
          </div>
        </div>
      `;

    } else {
      // ── Formativas: layout clásico simple ──
      c.className = 'card offer-card selectable';
      const logoHtml = team.logo
        ? `<div style="width:56px;height:48px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:4px"><img src="${team.logo}" alt="${team.name}" style="max-width:48px;max-height:38px;object-fit:contain"></div>`
        : `<div style="width:56px;height:48px;border-radius:8px;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🏎️</div>`;
      c.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:12px">
            ${logoHtml}
            <div>
              <div class="heading" style="font-size:20px">${team.name} ${badges}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">📍 ${cat} | Req: ⭐ ${reqRep} / OVR ${reqOvr}</div>
              ${team.focus ? `<div style="font-size:12px;margin-top:2px;color:${team.focus === 'desarrollo' ? '#60a5fa' : team.focus === 'ganar' ? '#f87171' : '#facc15'}">${team.focus === 'desarrollo' ? '📚 Prioriza desarrollo' : team.focus === 'ganar' ? '🏆 Prioriza ganar' : '⚖️ Equilibrado'}</div>` : ''}
            </div>
          </div>
          <div class="offer-star">${stars}</div>
        </div>
        <div class="result-row" style="padding:8px 0;border-color:var(--border)">
          <div class="r-label">Salario / temporada</div>
          <div class="r-val" style="font-size:17px">${fmt$(salarySpin)}</div>
        </div>
        <div class="result-row" style="padding:8px 0;border-color:transparent">
          <div class="r-label">Prob. de ganar</div>
          <div class="offer-prob">${WIN_PROBS[probIdx]}</div>
        </div>
      `;
    }
    c.onclick = () => {
      if (G.team && team.name === G.team.name) {
        G.renewalsCount++;
        G.nonRenewalsCount = 0;
      } else {
        G.nonRenewalsCount++;
        G.renewalsCount = 0;
      }
      G.team = team;
      G.money += Math.round(salarySpin * 0.1);
      G.totalMoney += Math.round(salarySpin * 0.1);
      if (isF1) G.f1ContractYearsLeft = contractYears - 1;
      updateTopBar();
      processNextStep();
    };
    list.appendChild(c);
  });

  if (G.age >= 34) {
    const retBtn = document.createElement('button');
    retBtn.className = 'btn btn-secondary';
    retBtn.style.width = '100%';
    retBtn.style.marginTop = '16px';
    retBtn.style.border = '1px solid #ef4444';
    retBtn.style.color = '#ef4444';
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
          item.onclick = () => buyUpgrade(u.id);
      }
      
      item.innerHTML = `
        <div style="display:flex; align-items:flex-start; margin-bottom:8px; width:100%;">
          <div class="upgrade-icon" style="font-size:24px; margin-right:12px; filter: drop-shadow(0 0 4px rgba(255,255,255,0.1));">${u.icon}</div>
          <div class="upgrade-info" style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <h4 style="margin:0; font-size:14px;">${u.name}</h4>
              <div style="font-size:12px; font-weight:bold; color:var(--text); opacity: ${owned ? 0.5 : 1}; margin-left:8px;">${owned ? '✔️ Adquirido' : formatAbbrev(u.cost)}</div>
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

function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  if (!u || G.upgrades.includes(id) || G.money < u.cost) return;
  G.money -= u.cost;
  G.upgrades.push(id);
  for (const [k, v] of Object.entries(u.stats)) G.stats[k] = Math.min(99, G.stats[k] + v);
  updateTopBar();
    buildUpgradesScreen();
    checkAchievements();
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
function showRetirement() {
  G.isRetired = true;
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
  
  if (persText) {
      document.getElementById('ret-legacy-banner').insertAdjacentHTML('afterend', `<div class="card" style="margin-bottom:16px;background:rgba(74, 144, 232, 0.1);border-color:var(--blue);text-align:center"><div style="font-size:14px;color:var(--blue);margin-bottom:4px;font-weight:bold;letter-spacing:1px">PERFIL DEL PILOTO</div><div style="font-size:15px">${persText}</div></div>`);
  }

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
  
  if (G.peer && f1Seasons > 0) {
    const rel = G.peer.relationship;
    const relPct = Math.round((rel + 100) / 2); // 0% = -100, 100% = +100
    const relIcon = rel > 50 ? '🤝' : rel < -50 ? '⚔️' : '😐';
    const relLabel = rel > 50 ? 'Aliados' : rel < -50 ? 'Enemigos juramentados' : rel > 0 ? 'Buena onda' : rel < 0 ? 'Tensión' : 'Neutral';
    const relColor = rel > 30 ? '#4ade80' : rel < -30 ? '#f87171' : '#facc15';
    const h2hClass = G.peer.h2hWins > G.peer.h2hLosses ? 'bad' : G.peer.h2hWins < G.peer.h2hLosses ? 'good' : '';
    const peerHtml = `
      <div class="section-title">Rivalidad Generacional</div>
      <div class="card" style="margin-bottom:24px">
        <div class="result-row"><div class="r-label">Nombre</div><div class="r-val" style="font-weight:bold">${G.peer.name} <span style="font-size:12px;color:var(--muted)">(${G.peer.nat.flag})</span></div></div>
        <div class="result-row"><div class="r-label">H2H (Tú vs Él)</div><div class="r-val ${h2hClass}" style="font-weight:bold">${G.peer.h2hLosses} a ${G.peer.h2hWins}</div></div>
        
        <div style="margin-top:16px; padding:16px; border-radius:8px; background:rgba(255,255,255,0.04); text-align:center">
          <div style="font-size:14px; margin-bottom:8px; color:var(--muted)">Relación</div>
          <div style="font-size:18px; margin-bottom:8px">${relIcon} ${relLabel}</div>
          <div style="width:100%; height:6px; background:#333; border-radius:3px; overflow:hidden">
            <div style="width:${relPct}%; height:100%; background:${relColor}; transition:width 0.3s"></div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('ret-history-rows').parentElement.insertAdjacentHTML('afterend', peerHtml);
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
        ${p.peerName ? `<div style="font-size:12px; color:var(--muted); padding-top:8px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05)">⚔️ Rival histórico: <strong>${p.peerName}</strong> (H2H: ${p.peerWins} a ${p.peerLosses})</div>` : ''}
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
const LAST_NAMES = ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Wood", "Jackson", "Clarke", "García", "Martínez", "López", "González", "Rodríguez", "Fernández", "Pérez", "Gómez", "Sánchez", "Romero", "Sosa", "Torres", "Álvarez", "Ruiz", "Ramírez", "Flores", "Benítez", "Acosta", "Medina", "Herrera", "Suárez", "Dupont", "Dubois", "Lefebvre", "Leroy", "Roux", "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker"];

function generatePeer() {
  const f1Teams = TEAMS['F1'];
  // Talent level: Random between 2 and 5 stars
  const r = Math.random();
  let stars = 2;
  if (r < 0.2) stars = 5;       // Generational talent (20%)
  else if (r < 0.5) stars = 4;  // Very good (30%)
  else if (r < 0.8) stars = 3;  // Midfield (30%)
  else stars = 2;               // Backmarker (20%)

  // Assign to a team corresponding to their star level, or lower.
  const validTeams = f1Teams.filter(t => t.stars <= stars);
  const initialTeam = validTeams.length > 0 ? randFrom(validTeams).name : f1Teams[f1Teams.length - 1].name;

  G.peer = {
    name: randFrom(FIRST_NAMES) + ' ' + randFrom(LAST_NAMES),
    nat: randFrom(NATIONALITIES),
    talent: stars,
    team: initialTeam,
    relationship: 0, // -100 to +100
    h2hWins: 0,
    h2hLosses: 0,
    contractYearsLeft: Math.random() < 0.5 ? 1 : 2 // 2 to 3 years initially
  };
}

function updatePeerContract() {
  if (!G.peer) return null;
  
  if (G.peer.contractYearsLeft > 0) {
    G.peer.contractYearsLeft--;
    return { action: 'stays', newTeam: G.peer.team };
  }

  const f1Teams = TEAMS['F1'];
  
  // Decide if they move. Generational talents are more likely to move UP.
  const r = Math.random();
  let currentTeam = f1Teams.find(t => t.name === G.peer.team);
  if (!currentTeam) currentTeam = f1Teams[0];

  let newTeam = G.peer.team;
  let action = 'renews';

  if (currentTeam.stars < G.peer.talent && r < 0.6) {
    // Moves up! Try to find a team with more stars up to their talent level
    const betterTeams = f1Teams.filter(t => t.stars > currentTeam.stars && t.stars <= G.peer.talent);
    if (betterTeams.length > 0) {
      newTeam = randFrom(betterTeams).name;
      action = 'moves';
    }
  } else if (r < 0.2) {
    // Random sideways or slight down move
    const lateralTeams = f1Teams.filter(t => t.stars === currentTeam.stars && t.name !== currentTeam.name);
    if (lateralTeams.length > 0) {
      newTeam = randFrom(lateralTeams).name;
      action = 'moves';
    }
  }

  G.peer.team = newTeam;
  G.peer.contractYearsLeft = Math.random() < 0.5 ? 1 : 2;
  return { action, newTeam };
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
  // Platino
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
  { id: 'rain_master', name: 'Que Llueva', desc: 'Ganaste un campeonato teniendo la lluvia como tu estadística más fuerte.', icon: '🌧️', tier: 'silver', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 1 && G.stats.rain >= Math.max(G.stats.speed, G.stats.quali, G.stats.tyres, G.stats.overtake)) },

  // Bronce
  { id: 'first_win', name: 'Primer Golpe', desc: 'Tu nombre apareció entre los ganadores. Conseguiste tu primera victoria en F1.', icon: '🥇', tier: 'bronze', condition: () => G.seasons.some(s => s.cat === 'F1' && s.wins > 0) },
  { id: 'team_player', name: 'El Compañero Ideal', desc: 'Llegá a +80 en Equipo.', icon: '🤝', tier: 'bronze', condition: () => G.personality && G.personality.team >= 80 },
  { id: 'media_star', name: 'Estrella Mediática', desc: 'Llegá a +80 en Mediático.', icon: '📸', tier: 'bronze', condition: () => G.personality && G.personality.media >= 80 },
  { id: 'villain', name: 'El Villano', desc: 'Llegá a +80 en Agresividad.', icon: '😈', tier: 'bronze', condition: () => G.personality && G.personality.aggressiveness >= 80 },

  { id: 'world_podium', name: 'El Podio del Mundo', desc: 'Te instalaste entre los mejores. Terminaste 3.º en el campeonato de F1.', icon: '🥉', tier: 'bronze', condition: () => G.seasons.some(s => s.cat === 'F1' && s.champ === 3) },
  { id: 'survivor', name: 'El Sobreviviente', desc: 'Terminaste una carrera donde todo parecía perdido (Superar un minijuego con riesgo de DNF).', icon: '🩹', tier: 'bronze', condition: () => G._ach_survivor },
  { id: 'chaos_specialist', name: 'Especialista en Caos', desc: 'Ganaste 3 minijuegos de puro azar o situaciones extremas.', icon: '🌪️', tier: 'bronze', condition: () => (G._ach_chaosCount || 0) >= 3 },
  { id: 'lucky_guy', name: 'El Afortunado', desc: 'Ganaste una carrera mediante un evento o minijuego de pura suerte.', icon: '🍀', tier: 'bronze', condition: () => G._ach_luckyWin },
  { id: 'loyalty', name: 'Fidelidad', desc: 'Firmaste 3 renovaciones de contrato consecutivas con el mismo equipo.', icon: '🤝', tier: 'bronze', condition: () => (G._ach_renewals || 0) >= 3 }
];

let G_unlockedAchievements = [];
let _lastStandings = null; // cache de la clasificación generada para el resumen actual

// ═══════════════════════════════════════════════════════════
//  CLASIFICACIÓN DEL CAMPEONATO (modal opcional en el resumen)
//  Genera una tabla plausible a partir del resultado ya calculado,
//  sin simular carrera por carrera. Se cachea una vez por temporada
//  para que el modal siempre muestre lo mismo que dice el resumen.
// ═══════════════════════════════════════════════════════════
function generateStandingsTable(r) {
  const sizes = { 'Karting': 24, 'F4': 24, 'Formula Regional': 24, 'F3': 30, 'F2': 22, 'F1': 22 };
  const N = sizes[r.cat] || 20;
  const BASE = Math.max(140, r.races * 20);
  const DECAY = 0.85;
  const catTeams = TEAMS[r.cat] || TEAMS['F1'];

  const rows = [];
  for (let k = 1; k <= N; k++) {
    rows.push({ rank: k, points: Math.round(BASE * Math.pow(DECAY, k - 1)) });
  }

  const myRank = Math.min(Math.max(r.champ, 1), N);
  const usedNames = new Set();

  const seatsPerTeam = (r.cat === 'F1' || r.cat === 'F2') ? 2 : 3;
  let seatsPool = [];
  catTeams.forEach(t => {
    for (let i = 0; i < seatsPerTeam; i++) seatsPool.push({ ...t });
  });
  
  const playerTeamName = r.teamName || (G.team && G.team.name) || '—';
  const playerTIdx = seatsPool.findIndex(t => t.name === playerTeamName);
  if (playerTIdx !== -1) seatsPool.splice(playerTIdx, 1);
  
  if (r.cat === 'F1') {
    seatsPool.forEach(t => {
      t._power = (t.stars * 10) + (Math.random() * 25);
    });
    seatsPool.sort((a, b) => b._power - a._power);
  } else {
    seatsPool = shuffle(seatsPool);
  }

  rows.forEach(row => {
    if (row.rank === myRank) {
      row.isPlayer = true;
      row.name = `${G.flag} ${G.name}`;
      row.team = playerTeamName;
      const tObj = catTeams.find(t => t.name === row.team);
      row.logo = (r.cat !== 'Karting' && tObj) ? tObj.logo : null;
    } else {
      let full;
      do { full = randFrom(FIRST_NAMES) + ' ' + randFrom(LAST_NAMES); } while (usedNames.has(full));
      usedNames.add(full);
      row.name = full;
      
      const randT = seatsPool.length > 0 ? seatsPool.shift() : randFrom(catTeams);
      row.team = randT.name;
      row.logo = r.cat !== 'Karting' ? randT.logo : null;
    }
  });

  if (G.peer && r.cat === 'F1') {
    const peerRow = rows.find(row => !row.isPlayer && row.team === G.peer.team);
    if (peerRow) {
      peerRow.name = `⚔️ ${G.peer.name}`;
      peerRow.isPeer = true;
      const peerTObj = TEAMS['F1'].find(t => t.name === peerRow.team);
      peerRow.logo = peerTObj ? peerTObj.logo : null;
    }
  }

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
    rowsHtml = _lastStandings.constructors.map(row => {
      const img = row.logo ? '<img src="' + row.logo + '" title="' + row.team + '" alt="' + row.team + '" style="height:14px; vertical-align:middle; max-width:100%; object-fit:contain;">' : '';
      return '<div class="standings-row' + (row.hasPlayer ? ' is-player' : '') + '">' +
        '<span class="standings-pos">' + row.rank + 'º</span>' +
        '<span class="standings-name">' + row.team + '</span>' +
        '<span class="standings-team">' + img + '</span>' +
        '<span class="standings-pts">' + row.points + '</span>' +
      '</div>';
    }).join('');
  } else {
    rowsHtml = _lastStandings.rows.map(row => {
      const img = row.logo ? '<img src="' + row.logo + '" title="' + row.team + '" alt="' + row.team + '" style="height:14px; vertical-align:middle; max-width:100%; object-fit:contain;">' : row.team;
      return '<div class="standings-row' + (row.isPlayer ? ' is-player' : '') + '">' +
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



