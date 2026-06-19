/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Station, Bus, Alert, Incident, AiRecommendation } from '../types';

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'T2',
    name: 'T2 — Cañaveral → UIS',
    origin: 'Cañaveral',
    destination: 'UIS',
    activeBuses: 4,
    avgTimeMinutes: 38,
    delayMinutes: 2,
    occupancy: 'high',
    status: 'congested',
    pathCoordinates: [
      [7.0658, -73.1022], // Estación Cañaveral (Frente a CC Cañaveral)
      [7.0700, -73.1030], // Autopista - Paralela frente a Parque Caracolí / Club Campestre
      [7.0754, -73.1047], // Autopista - Frente a Estación Payador
      [7.0801, -73.1065], // Autopista - Frente a Lagos I
      [7.0845, -73.1080], // Autopista - Frente a Estación Diamante
      [7.0888, -73.1098], // Autopista - Frente a San Martín
      [7.0941, -73.1116], // Estación Provenza (Plataforma Troncal)
      [7.0970, -73.1122], // Autopista - Tramo de incorporación norte
      [7.0991, -73.1129], // Autopista - Frente a Puerta del Sol (Costado Sur)
      [7.1008, -73.1137], // Intercambiador Conucos (Giro controlado)
      [7.1025, -73.1158], // Rotonda Puerta del Sol (Acceso Diagonal 15)
      [7.1055, -73.1170], // Diagonal 15 con Calle 56 (Cruce regulado)
      [7.1080, -73.1182], // Diagonal 15 con Calle 52 (Frente a la Ceiba)
      [7.1110, -73.1195], // Diagonal 15 con Calle 48
      [7.1140, -73.1215], // Diagonal 15 con Calle 45 (Estación San Mateo)
      [7.1165, -73.1221], // Carrera 15 con Calle 41
      [7.1196, -73.1225], // Estación Centro (Carrera 15 con Calle 36)
      [7.1197, -73.1215], // Calle 36 con Carrera 18 (Giro lateral)
      [7.1201, -73.1203], // Calle 36 con Carrera 21 (Centro histórico)
      [7.1204, -73.1191], // Calle 36 con Carrera 24 (Avenida Bulevar)
      [7.1208, -73.1173], // Calle 36 con Carrera 27 (Giro al norte en Parque de los Niños)
      [7.1240, -73.1171], // Carrera 27 con Calle 32
      [7.1275, -73.1175], // Carrera 27 con Calle 25 (SENA)
      [7.1310, -73.1183], // Carrera 27 con Calle 18
      [7.1345, -73.1192], // Carrera 27 con Calle 14 (Templo Mariano)
      [7.1365, -73.1198], // Carrera 27 con Calle 11 (Facultad de Salud)
      [7.1378, -73.1212]  // Estación UIS (Carrera 27 Entrada Principal)
    ]
  },
  {
    id: 'P8',
    name: 'P8 — Provenza → Centro',
    origin: 'Provenza',
    destination: 'Centro',
    activeBuses: 3,
    avgTimeMinutes: 25,
    delayMinutes: 8,
    occupancy: 'critical',
    status: 'delayed',
    pathCoordinates: [
      [7.0945, -73.1118], // Estación Provenza
      [7.0935, -73.1105], // Paso deprimido y desvío a Calle 105 Este
      [7.0933, -73.1080], // Calle 105 con Carrera 24
      [7.0942, -73.1060], // Calle 105 con Carrera 26 (Cruce El Tejar)
      [7.0950, -73.1040], // Calle 105 con Transversal Oriental
      [7.0980, -73.1025], // Transversal Oriental - Entrada a Lagos del Cacique
      [7.1005, -73.1018], // Transversal Oriental con Calle 88 (Frente a Girasol)
      [7.1030, -73.1022], // Transversal Oriental frente a Alares
      [7.1055, -73.1035], // Transversal Oriental - Giro al Viaducto La Flora
      [7.1065, -73.1045], // Viaducto La Flora (Acceso Oriente)
      [7.1075, -73.1065], // Viaducto La Flora (Centro de Luz)
      [7.1080, -73.1085], // Entrada a Calle 56 por Intercambiador de la Flora
      [7.1085, -73.1102], // Avenida Carrera 33 con Calle 56
      [7.1100, -73.1110], // Carrera 33 con Calle 54
      [7.1118, -73.1115], // Carrera 33 con Calle 51 (Cerca a CC Cabecera Cuarta Etapa)
      [7.1147, -73.1121], // Estación Cabecera (Carrera 33 con Calle 48)
      [7.1165, -73.1132], // Carrera 33 con Calle 44
      [7.1185, -73.1136], // Carrera 33 con Calle 40
      [7.1201, -73.1142], // Carrera 33 con Calle 36 (Giro regular a la izquierda)
      [7.1205, -73.1160], // Calle 36 con Carrera 29
      [7.1208, -73.1173], // Calle 36 con Carrera 27 (Eje vial de conexión)
      [7.1205, -73.1182], // Calle 36 con Carrera 25 (SENA)
      [7.1202, -73.1195], // Calle 36 con Carrera 22
      [7.1197, -73.1215], // Calle 36 con Carrera 18 (Catedral de la Sagrada Familia)
      [7.1196, -73.1225]  // Estación Centro (Carrera 15 con Calle 36)
    ]
  },
  {
    id: 'AB1',
    name: 'AB1 — Portal Norte → Cabecera',
    origin: 'Portal Norte',
    destination: 'Cabecera',
    activeBuses: 2,
    avgTimeMinutes: 20,
    delayMinutes: 0,
    occupancy: 'low',
    status: 'normal',
    pathCoordinates: [
      [7.1554, -73.1245], // Portal Norte (Frente a la Juventud)
      [7.1510, -73.1243], // Carrera 15 con Calle 3 (Barrio San Rafael)
      [7.1480, -73.1242], // Carrera 15 con Calle 10 (Estación Comuneros)
      [7.1440, -73.1238], // Carrera 15 con Calle 14 (Barrio San Francisco)
      [7.1415, -73.1235], // Boulevard Bolívar con Carrera 15 (Glorieta)
      [7.1405, -73.1215], // Avenida Quebradaseca con Carrera 18 (Sentido Oriente)
      [7.1390, -73.1192], // Avenida Quebradaseca con Carrera 22 (Sena Quebradaseca)
      [7.1378, -73.1178], // Avenida Quebradaseca con Carrera 26
      [7.1370, -73.1180], // Giro a la derecha incorporándose a Carrera 27 
      [7.1325, -73.1182], // Carrera 27 con Calle 18
      [7.1290, -73.1180], // Carrera 27 con Calle 25 (Parque de los Niños)
      [7.1245, -73.1170], // Carrera 27 con Calle 32
      [7.1208, -73.1173], // Carrera 27 con Calle 36
      [7.1158, -73.1164], // Carrera 27 con Calle 45
      [7.1136, -73.1159], // Carrera 27 con Calle 48 (Giro controlado a la izquierda hacia Cabecera)
      [7.1139, -73.1145], // Calle 48 con Carrera 29 (Parque Turbay)
      [7.1143, -73.1132], // Calle 48 con Carrera 31 (Cerca a Clínica Bucaramanga)
      [7.1147, -73.1121]  // Estación Cabecera (Carrera 33 con Calle 48)
    ]
  },
  {
    id: 'R1',
    name: 'R1 — Floridablanca → Centro',
    origin: 'Floridablanca',
    destination: 'Centro',
    activeBuses: 3,
    avgTimeMinutes: 32,
    delayMinutes: 12,
    occupancy: 'medium',
    status: 'delayed',
    pathCoordinates: [
      [7.0622, -73.0864], // Floridablanca (Parque Principal Calle 5)
      [7.0632, -73.0905], // Calle 5 con Carrera 7
      [7.0638, -73.0945], // Calle 5 con Carrera 11 (Cercanías a Bucarica)
      [7.0645, -73.0972], // Intercambiador de Floridablanca (Acceso Autopista)
      [7.0658, -73.1022], // Cañaveral (Autopista frente a Éxito Cañaveral)
      [7.0725, -73.1032], // Paralela Lagos (Parque Turbay de Floridablanca)
      [7.0768, -73.1051], // Autopista - Estación Payador
      [7.0850, -73.1082], // Diamante II (Paralela Autopista)
      [7.0945, -73.1118], // Provenza (Estación de Transferencia)
      [7.0950, -73.1145], // Giro a la izquierda para deprimir bajo la Autopista (Calle 56)
      [7.0970, -73.1201], // Calle 56 con Carrera 17 (Ingreso a Ciudadela Real de Minas)
      [7.0990, -73.1215], // Calle 56 con Avenida Los Samanes (Unidades Tecnológicas de Santander)
      [7.1015, -73.1235], // Avenida Los Samanes con Calle 54 (Frente a Plaza Mayor)
      [7.1035, -73.1250], // Avenida Los Samanes con Calle 51 (Cerca de Parque de las Cigarras)
      [7.1055, -73.1265], // Acceso Sur al Viaducto de la Novena
      [7.1085, -73.1272], // Mitad del imponente Viaducto de la Novena (Atravesando Cañón del Río de Oro)
      [7.1115, -73.1261], // Salida Norte del Viaducto de la Novena - Conexión Calle 45
      [7.1130, -73.1240], // Calle 45 con Carrera 11 (Barrio Alfonso López)
      [7.1145, -73.1215], // Calle 45 con Carrera 15 (Giro de incorporación con carril exclusivo de Transito)
      [7.1170, -73.1221], // Carrera 15 con Calle 40
      [7.1196, -73.1225]  // Estación Centro (Carrera 15 con Calle 36)
    ]
  },
  {
    id: 'R3',
    name: 'R3 — Girón → Provenza',
    origin: 'Girón',
    destination: 'Provenza',
    activeBuses: 2,
    avgTimeMinutes: 28,
    delayMinutes: 1,
    occupancy: 'low',
    status: 'normal',
    pathCoordinates: [
      [7.0734, -73.1691], // Girón (Plazoleta del Casco Antiguo)
      [7.0815, -73.1650], // Calle 12 frente a Portal de Aldea (Zona Industrial de Girón)
      [7.0850, -73.1620], // Carrera 26 con Calle 12 (Bahía San Juan)
      [7.0880, -73.1605], // Intercambiador Palenque (Cruce Vial Principal)
      [7.0910, -73.1550], // Autopista Bucaramanga-Girón (Entrada a Brisas)
      [7.0935, -73.1510], // Autopista Bucaramanga-Girón - Conexión Anillo Vial
      [7.0955, -73.1470], // Autopista Bucaramanga-Girón frente a Planta de Mac Pollo
      [7.0975, -73.1425], // Puente de Flandes (Paso sobre el Río de Oro)
      [7.0995, -73.1370], // Autopista Bucaramanga-Girón - Sector Campiña
      [7.1015, -73.1310], // Sector Los Caneyes (Frente a Embotelladora Coca Cola)
      [7.1025, -73.1260], // Avenida Los Samanes frente a Parque de la Vida (Real de Minas)
      [7.0990, -73.1235], // Calle 56 - Entrada Real de Minas (Frente a las Unidades Tecnológicas de Santander)
      [7.0970, -73.1180], // Calle 56 con Carrera 17 (Mutis)
      [7.0952, -73.1145], // Paso deprimido bajo la autopista ingresando a Provenza
      [7.0945, -73.1118]  // Estación de llegada Provenza
    ]
  },
  {
    id: 'RUTA1',
    name: 'Ruta 1 — Personalizada My Maps',
    origin: 'Centro',
    destination: 'Provenza',
    activeBuses: 2,
    avgTimeMinutes: 30,
    delayMinutes: 0,
    occupancy: 'medium',
    status: 'normal',
    pathCoordinates: [
      [7.1270371, -73.1189372],
      [7.1214586, -73.1166627],
      [7.1183925, -73.1153752],
      [7.1070649, -73.113959],
      [7.1064687, -73.1130149],
      [7.1057448, -73.112972],
      [7.1041265, -73.1109121],
      [7.1027637, -73.1108691],
      [7.1011455, -73.1116416],
      [7.0938632, -73.1102254],
      [7.0911288, -73.109273],
      [7.0892763, -73.1087795],
      [7.0884671, -73.1089941],
      [7.0877645, -73.1092515],
      [7.0870192, -73.1099167],
      [7.0858054, -73.1111398],
      [7.0852731, -73.1126633],
      [7.0853796, -73.1178346]
    ]
  }
];

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'ST-01',
    name: 'Cañaveral',
    occupancyCurrent: 80,
    occupancyPrediction20Min: 85,
    riskLevel: 'high',
    recommendation: 'Estación Cañaveral experimenta saturación. Considere habilitar puertas de contingencia.',
    capacity: 350
  },
  {
    id: 'ST-02',
    name: 'Provenza',
    occupancyCurrent: 92,
    occupancyPrediction20Min: 98,
    riskLevel: 'critical',
    recommendation: 'Saturación severa. Se recomienda priorizar el envío del bus de reserva BUS-911 y desviar viajes alternos.',
    capacity: 500
  },
  {
    id: 'ST-03',
    name: 'UIS',
    occupancyCurrent: 45,
    occupancyPrediction20Min: 60,
    riskLevel: 'low',
    recommendation: 'Flujo normal. Incremento gradual previsto por salida de estudiantes universitarios.',
    capacity: 400
  },
  {
    id: 'ST-04',
    name: 'Portal Norte',
    occupancyCurrent: 35,
    occupancyPrediction20Min: 30,
    riskLevel: 'low',
    recommendation: 'Flujo despejado. Operaciones estándares en curso.',
    capacity: 600
  },
  {
    id: 'ST-05',
    name: 'Centro',
    occupancyCurrent: 70,
    occupancyPrediction20Min: 78,
    riskLevel: 'medium',
    recommendation: 'Flujo denso. Demanda alta por sector comercial. Frecuencias estables.',
    capacity: 450
  },
  {
    id: 'ST-06',
    name: 'Cabecera',
    occupancyCurrent: 65,
    occupancyPrediction20Min: 60,
    riskLevel: 'medium',
    recommendation: 'Demanda moderada estable. Sin novedades de congestión en ingresos.',
    capacity: 300
  },
  {
    id: 'ST-07',
    name: 'Floridablanca',
    occupancyCurrent: 58,
    occupancyPrediction20Min: 65,
    riskLevel: 'medium',
    recommendation: 'Flujo constante. Regulado por arribo intermitente de alimentadores.',
    capacity: 350
  },
  {
    id: 'ST-08',
    name: 'Girón',
    occupancyCurrent: 40,
    occupancyPrediction20Min: 48,
    riskLevel: 'low',
    recommendation: 'Flujo estable de pasajeros. Todas las taquillas y torniquetes operando normal.',
    capacity: 300
  }
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'BUS-101',
    routeId: 'T2',
    driverName: 'Álvaro Gómez',
    latitude: 42,
    longitude: 35,
    occupancy: 'high',
    status: 'active',
    nextStation: 'Provenza',
    etaMinutes: 6
  },
  {
    id: 'BUS-102',
    routeId: 'T2',
    driverName: 'Silvia Pinzón',
    latitude: 25,
    longitude: 20,
    occupancy: 'medium',
    status: 'active',
    nextStation: 'Cañaveral',
    etaMinutes: 18
  },
  {
    id: 'BUS-201',
    routeId: 'P8',
    driverName: 'Carlos Vega',
    latitude: 55,
    longitude: 72,
    occupancy: 'critical',
    status: 'active',
    nextStation: 'Centro',
    etaMinutes: 11
  },
  {
    id: 'BUS-202',
    routeId: 'P8',
    driverName: 'María Fernanda',
    latitude: 38,
    longitude: 42,
    occupancy: 'low',
    status: 'active',
    nextStation: 'Provenza',
    etaMinutes: 24
  },
  {
    id: 'BUS-301',
    routeId: 'AB1',
    driverName: 'Jorge Eliécer',
    latitude: 88,
    longitude: 48,
    occupancy: 'low',
    status: 'active',
    nextStation: 'Cabecera',
    etaMinutes: 3
  },
  {
    id: 'BUS-302',
    routeId: 'AB1',
    driverName: 'Inés Duarte',
    latitude: 70,
    longitude: 35,
    occupancy: 'low',
    status: 'active',
    nextStation: 'Portal Norte',
    etaMinutes: 15
  },
  {
    id: 'BUS-401',
    routeId: 'R1',
    driverName: 'Gabriel Beltrán',
    latitude: 15,
    longitude: 40,
    occupancy: 'medium',
    status: 'delayed',
    nextStation: 'Floridablanca',
    etaMinutes: 14
  },
  {
    id: 'BUS-501',
    routeId: 'R3',
    driverName: 'Martha Lucía',
    latitude: 30,
    longitude: 80,
    occupancy: 'low',
    status: 'active',
    nextStation: 'Girón',
    etaMinutes: 8
  },
  {
    id: 'BUS-601',
    routeId: 'RUTA1',
    driverName: 'Julio Gómez',
    latitude: 50,
    longitude: 50,
    occupancy: 'medium',
    status: 'active',
    nextStation: 'Provenza',
    etaMinutes: 8
  },
  {
    id: 'BUS-602',
    routeId: 'RUTA1',
    driverName: 'Camilo Andrés',
    latitude: 20,
    longitude: 30,
    occupancy: 'low',
    status: 'active',
    nextStation: 'Centro',
    etaMinutes: 18
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'AL-1',
    type: 'retraso',
    target: 'Ruta R1',
    level: 'critical',
    description: 'Falla menor en la vía secundaria de Floridablanca acumula tiempos de retraso de 12 minutos.',
    recommendation: 'Hacer bypass de paradas secundarias e integrar un bus alimentador adicional.',
    timestamp: '09:12 AM',
    status: 'investigating'
  },
  {
    id: 'AL-2',
    type: 'alta ocupación',
    target: 'Estación Provenza',
    level: 'warning',
    description: 'Saturación en plataforma de transferencias Provenza debido a retrasos en el corredor Troncal.',
    recommendation: 'Regular el despacho desde patio-taller y priorizar rutas rápidas de desahogo.',
    timestamp: '09:20 AM',
    status: 'new'
  },
  {
    id: 'AL-3',
    type: 'congestión',
    target: 'Ruta P8',
    level: 'warning',
    description: 'Tráfico denso en el carril mixto de la Autopista Sur afecta regularidad de tiempos de la ruta P8.',
    recommendation: 'IA sugiere habilitar semáforo inteligente de prioridad de transporte en intersección real.',
    timestamp: '09:25 AM',
    status: 'new'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    type: 'Obstrucción en vía mixta',
    location: 'Sector Provenza Sur',
    affectedRoute: 'R1 y P8',
    status: 'active',
    activeDurationMinutes: 18,
    officerInCharge: 'Sgto. Ortega, Policía de Tránsito'
  },
  {
    id: 'INC-102',
    type: 'Falla mecánica de unidad externa',
    location: 'Estación Cañaveral',
    affectedRoute: 'T2',
    status: 'active',
    activeDurationMinutes: 5,
    officerInCharge: 'Ing. Mauricio Prada, Metrolínea Mecánica'
  }
];

export const INITIAL_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: 'REC-1',
    title: 'Aumentar frecuencia Ruta T2',
    impact: 'Reduce ocupación en estación Provenza en un 24%',
    priority: 'high',
    suggestion: 'Reducir intervalo de paso de 8 minutos a 5 minutos en el portal Cañaveral para desahogar las estaciones del corredor troncal.',
    applied: false,
    type: 'frequency',
    targetId: 'T2'
  },
  {
    id: 'REC-2',
    title: 'Despacho de bus complementario',
    impact: 'Reduce tiempo de espera en P8 en 12 minutos',
    priority: 'critical',
    suggestion: 'Enviar de inmediato unidad de reserva express (BUS-911) desde patios Cañaveral de forma express hacia Provenza.',
    applied: false,
    type: 'dispatch',
    targetId: 'P8'
  },
  {
    id: 'REC-3',
    title: 'Modificación de ruta de contingencia R1',
    impact: 'Evita atasco vehicular en Autopista Central',
    priority: 'medium',
    suggestion: 'Desviar temporalmente los buses de la ruta R1 por la Carrera 27 para ahorrar 9 minutos de viaje en atascos.',
    applied: false,
    type: 'route',
    targetId: 'R1'
  }
];

// Predicted hourly demand for today (relative high values)
// Peak hours at 06:00-08:59 and 17:00-19:59
export const PEAK_DEMAND_FORECAST = [
  { hour: '06:00', passengers: 3200, capacity: 4000, risk: 'low' },
  { hour: '07:00', passengers: 5900, capacity: 5500, risk: 'critical' },
  { hour: '08:00', passengers: 6300, capacity: 5500, risk: 'critical' },
  { hour: '09:00', passengers: 4200, capacity: 5000, risk: 'high' },
  { hour: '10:00', passengers: 2800, capacity: 4500, risk: 'low' },
  { hour: '11:00', passengers: 3100, capacity: 4500, risk: 'low' },
  { hour: '12:00', passengers: 3900, capacity: 4500, risk: 'medium' },
  { hour: '13:00', passengers: 3600, capacity: 4500, risk: 'low' },
  { hour: '14:00', passengers: 2900, capacity: 4500, risk: 'low' },
  { hour: '15:00', passengers: 3300, capacity: 4500, risk: 'low' },
  { hour: '16:00', passengers: 4100, capacity: 4500, risk: 'medium' },
  { hour: '17:00', passengers: 5800, capacity: 5200, risk: 'high' },
  { hour: '18:00', passengers: 6800, capacity: 5500, risk: 'critical' },
  { hour: '19:00', passengers: 5200, capacity: 5500, risk: 'medium' },
  { hour: '20:00', passengers: 3000, capacity: 4000, risk: 'low' }
];

// Rich QA list for simulating intelligent support
export const ASSISTANT_MOCK_RESPONSES = [
  {
    keywords: ['como llego', 'cómo llego', 'buses a', 'ruta uis', 'cañaveral a uis', 'ir a uis', 'viajar a uis', 'cañaveral uis'],
    response: 'La mejor opción recomendada por IA es tomar la ruta **T2** en la estación **Cañaveral**, bajarse en **Provenza** y hacer transbordo hacia la **UIS**. El tiempo estimado total es de **38 minutos** con una ocupación media actual.'
  },
  {
    keywords: ['ocupacion', 'ocupación', 'lleno', 'congestion', 'congestión', 'provenza', 'esta lleno', 'estación provenza'],
    response: 'La estación **Provenza** presenta una ocupación del **92%** (Nivel Crítico) debido a los retrasos de la ruta P8. El sistema está enviando un bus complementario para desahogar la plataforma.'
  },
  {
    keywords: ['tiempo', 'retraso', 't2', 'cuanto falta', 'cuánto falta', 'llegada t2'],
    response: 'La ruta **T2** tiene unidades activas aproximándose. El próximo bus **BUS-101** se encuentra a **6 minutos** de Provenza con ocupación media/alta. La siguiente unidad pasará en **18 minutos**.'
  },
  {
    keywords: ['alertas', 'incidentes', 'paso algo', 'problema', 'que pasa', 'retrasos'],
    response: 'Actualmente hay **3 alertas activas**. Destaca la ruta **R1** con un retraso estimado de **12 minutos** por una obstrucción vial en Provenza Sur. Te sugerimos tomar vías alternas o usar rutas secundarias como AB1.'
  }
];

export const DEFAULT_AI_RESPONSE = 'Disculpa, soy el Asistente Inteligente de MetroFlow AI. Puedo ayudarte con rutas, tiempos de llegada, alertas e información del sistema Metrolínea. Prueba preguntando: **"¿Cómo llego de Cañaveral a la UIS?"**, **"¿Hay retrasos?"** o **"¿Qué tan llena está la estación de Provenza?"**';
