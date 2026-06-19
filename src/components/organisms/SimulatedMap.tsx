/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useMetro } from '../../contexts/MetroContext';
import { Route, Station, Bus } from '../../types';
import { INITIAL_ROUTES } from '../../mocks/metroData';
import { ShieldAlert, Compass, Bus as BusIcon, Info, MapPin, Zap, RefreshCw, X, Search, CheckCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SimulatedMapProps {
  id?: string;
  className?: string;
  interactive?: boolean;
}

// Coordinate mapping in Bucaramanga, Santander, Colombia
const REAL_STATION_COORDS: Record<string, [number, number]> = {
  'Cañaveral': [7.0658, -73.1022],
  'Floridablanca': [7.0622, -73.0864],
  'Provenza': [7.0945, -73.1118],
  'Girón': [7.0734, -73.1691],
  'Centro': [7.1196, -73.1225],
  'UIS': [7.1378, -73.1212],
  'Portal Norte': [7.1554, -73.1245],
  'Cabecera': [7.1147, -73.1121],
};

// SVG Coordinates for the schematic view
const SCHEMATIC_STATION_COORDS: Record<string, { x: number; y: number; color: string }> = {
  'Cañaveral': { x: 150, y: 500, color: '#3b82f6' },      
  'Floridablanca': { x: 120, y: 320, color: '#10b981' },  
  'Provenza': { x: 380, y: 380, color: '#a855f7' },       
  'Girón': { x: 620, y: 520, color: '#f59e0b' },          
  'Centro': { x: 740, y: 220, color: '#06b6d4' },         
  'UIS': { x: 880, y: 120, color: '#ec4899' },            
  'Portal Norte': { x: 860, y: 340, color: '#ef4444' },   
  'Cabecera': { x: 550, y: 160, color: '#14b8a6' },       
};

// Interpolates a coordinate [lat, lng] along a multi-point polyline given a ratio between 0.0 and 1.0
export function interpolatePositionAlongPath(
  path: [number, number][],
  ratio: number
): [number, number] {
  if (!path || path.length === 0) return [7.1085, -73.1180];
  if (path.length === 1) return path[0];
  
  const r = Math.max(0, Math.min(1, ratio));
  const distances: number[] = [];
  let totalDistance = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const dy = p2[0] - p1[0];
    const dx = p2[1] - p1[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    distances.push(dist);
    totalDistance += dist;
  }
  
  if (totalDistance === 0) return path[0];
  
  const targetDistance = r * totalDistance;
  let accumulatedDistance = 0;
  
  for (let i = 0; i < distances.length; i++) {
    const segmentDist = distances[i];
    if (accumulatedDistance + segmentDist >= targetDistance) {
      const segmentRatio = (targetDistance - accumulatedDistance) / segmentDist;
      const p1 = path[i];
      const p2 = path[i + 1];
      const lat = p1[0] + (p2[0] - p1[0]) * segmentRatio;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentRatio;
      return [lat, lng];
    }
    accumulatedDistance += segmentDist;
  }
  
  return path[path.length - 1];
}

// Finds the sub-path of route.pathCoordinates connecting the bus's current origin leg and nextStation, and interpolates along it 
export const getBusCurrentPosition = (
  bus: Bus,
  route: Route | undefined,
  fallbackOriginCoords: [number, number],
  fallbackNextCoords: [number, number]
): [number, number] => {
  const staticRoute = INITIAL_ROUTES.find(r => r.id === bus.routeId);
  const path = route?.pathCoordinates || staticRoute?.pathCoordinates;

  if (!path || path.length < 2) {
    const ratio = Math.max(0.1, Math.min(0.9, 1 - (bus.etaMinutes / 25)));
    const lat = fallbackOriginCoords[0] + (fallbackNextCoords[0] - fallbackOriginCoords[0]) * ratio;
    const lng = fallbackOriginCoords[1] + (fallbackNextCoords[1] - fallbackOriginCoords[1]) * ratio;
    return [lat, lng];
  }

  if (bus.routeId === 'RUTA1') {
    const ratio = Math.max(0.05, Math.min(0.95, 1 - (bus.etaMinutes / 30)));
    return interpolatePositionAlongPath(path, ratio);
  }

  // Find closest index to leg origin
  let minOriginDist = Infinity;
  let originIdx = 0;
  for (let i = 0; i < path.length; i++) {
    const dy = path[i][0] - fallbackOriginCoords[0];
    const dx = path[i][1] - fallbackOriginCoords[1];
    const dist = dy * dy + dx * dx;
    if (dist < minOriginDist) {
      minOriginDist = dist;
      originIdx = i;
    }
  }

  // Find closest index to leg nextStation
  let minNextDist = Infinity;
  let nextIdx = 0;
  for (let i = 0; i < path.length; i++) {
    const dy = path[i][0] - fallbackNextCoords[0];
    const dx = path[i][1] - fallbackNextCoords[1];
    const dist = dy * dy + dx * dx;
    if (dist < minNextDist) {
      minNextDist = dist;
      nextIdx = i;
    }
  }

  let subPath: [number, number][] = [];
  if (originIdx <= nextIdx) {
    subPath = path.slice(originIdx, nextIdx + 1);
  } else {
    subPath = path.slice(nextIdx, originIdx + 1).reverse();
  }

  if (subPath.length < 2) {
    const ratio = Math.max(0.1, Math.min(0.9, 1 - (bus.etaMinutes / 25)));
    const lat = fallbackOriginCoords[0] + (fallbackNextCoords[0] - fallbackOriginCoords[0]) * ratio;
    const lng = fallbackOriginCoords[1] + (fallbackNextCoords[1] - fallbackOriginCoords[1]) * ratio;
    return [lat, lng];
  }

  const ratio = Math.max(0.05, Math.min(0.95, 1 - (bus.etaMinutes / 15)));
  return interpolatePositionAlongPath(subPath, ratio);
};

export function getPreviousStationName(routeId: string, nextStation: string): string {
  const normId = routeId.toUpperCase();
  const normNext = nextStation.trim();

  if (normId === 'T2') {
    if (normNext === 'Provenza') return 'Cañaveral';
    if (normNext === 'Centro') return 'Provenza';
    if (normNext === 'UIS') return 'Centro';
    if (normNext === 'Cañaveral') return 'Provenza';
  }
  if (normId === 'P8') {
    if (normNext === 'Cabecera') return 'Provenza';
    if (normNext === 'Centro') return 'Cabecera';
    if (normNext === 'Provenza') return 'Cabecera';
  }
  if (normId === 'AB1') {
    if (normNext === 'Cabecera') return 'Portal Norte';
    if (normNext === 'Portal Norte') return 'Cabecera';
  }
  if (normId === 'R1') {
    if (normNext === 'Provenza') return 'Floridablanca';
    if (normNext === 'Centro') return 'Provenza';
    if (normNext === 'Floridablanca') return 'Provenza';
  }
  if (normId === 'R3') {
    if (normNext === 'Provenza') return 'Girón';
    if (normNext === 'Girón') return 'Provenza';
  }
  if (normId === 'RUTA1') {
    if (normNext === 'Centro') return 'Provenza';
    if (normNext === 'Provenza') return 'Centro';
  }

  return 'Provenza';
}

export const SimulatedMap: React.FC<SimulatedMapProps> = ({
  id,
  className = '',
  interactive = true
}) => {
  const { routes, stations, buses, alerts, incidents } = useMetro();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // View modes: 'real' (leaflet 2D map) vs 'schematic' (clean SVG)
  const [mapViewMode, setMapViewMode] = useState<'real' | 'schematic'>('real');
  const [basemap, setBasemap] = useState<'dark' | 'streets'>('dark');

  // Interactive Live Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const dynamicLayersRef = useRef<L.LayerGroup | null>(null);

  // Helper coordinate lookup for schematic view
  const getSchematicCoords = (name: string) => {
    return SCHEMATIC_STATION_COORDS[name] || { x: 500, y: 300, color: '#94a3b8' };
  };

  // Schematic transit routes list
  const routePaths = [
    { id: 'T2', name: 'Ruta T2 Troncal', points: ['Cañaveral', 'Provenza', 'Centro', 'UIS'], color: '#3b82f6', width: 4 },
    { id: 'P8', name: 'Ruta P8', points: ['Provenza', 'Cabecera', 'Centro'], color: '#a855f7', width: 3 },
    { id: 'AB1', name: 'Ruta AB1 Alimentador', points: ['Portal Norte', 'Cabecera'], color: '#06b6d4', width: 3 },
    { id: 'R1', name: 'Ruta R1', points: ['Floridablanca', 'Provenza', 'Centro'], color: '#10b981', width: 3 },
    { id: 'R3', name: 'Ruta R3', points: ['Girón', 'Provenza'], color: '#f59e0b', width: 3 },
    { id: 'RUTA1', name: 'Ruta 1', points: ['Provenza', 'Centro'], color: '#ef4444', width: 4 }
  ];

  // Map state selections sync handlers
  const handleStationClick = (stationName: string) => {
    if (!interactive) return;
    const match = stations.find(s => s.name === stationName);
    if (match) {
      setSelectedStation(match);
      setSelectedBus(null);
    }
  };

  const handleBusClick = (bus: Bus, e?: any) => {
    if (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else if (e.originalEvent) {
        e.originalEvent.stopPropagation();
      }
    }
    if (!interactive) return;
    setSelectedBus(bus);
    setSelectedStation(null);
  };

  // Setup Leaflet map instance on mount
  useEffect(() => {
    if (mapViewMode !== 'real' || !mapContainerRef.current) return;

    // Reset Map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize 2D Map centering in Bucaramanga, Colombia
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([7.1085, -73.1180], 13); // Adjusted to frame all stations nicely

    // Add Tile Layer
    const tileUrl = basemap === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Custom bottom-right zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dynamic layer group for real-time fleet representation
    const dynamicLayers = L.layerGroup().addTo(map);
    dynamicLayersRef.current = dynamicLayers;
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapViewMode]);

  // Handle Dynamic Basemap Switches
  useEffect(() => {
    if (tileLayerRef.current) {
      const tileUrl = basemap === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [basemap]);

  // Fly-to animation when selecting station or bus via outer tables
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapViewMode !== 'real') return;

    if (selectedStation) {
      const coords = REAL_STATION_COORDS[selectedStation.name];
      if (coords) {
        map.setView(coords, 14, { animate: true });
      }
    } else if (selectedBus) {
      const route = routes.find(r => r.id === selectedBus.routeId);
      const nextCoords = REAL_STATION_COORDS[selectedBus.nextStation];
      const originCoordName = route ? (route.origin === selectedBus.nextStation ? route.destination : route.origin) : 'Cañaveral';
      const originCoords = REAL_STATION_COORDS[originCoordName] || REAL_STATION_COORDS['Cañaveral'];

      if (nextCoords && originCoords) {
        const busPos = getBusCurrentPosition(selectedBus, route, originCoords, nextCoords);
        map.setView(busPos, 14, { animate: true });
      }
    }
  }, [selectedStation, selectedBus, mapViewMode]);

  // Synchronize Live Layer Markers/Polylines
  useEffect(() => {
    const map = mapRef.current;
    const dynamicLayers = dynamicLayersRef.current;
    if (!map || !dynamicLayers || mapViewMode !== 'real') return;

    dynamicLayers.clearLayers();

    // 1. Plot Route Polylines
    routes.forEach((route) => {
      let rColor = '#3b82f6';
      let rWeight = 4.5;
      let rDashArray: string | undefined = undefined;

      if (route.id === 'T2') { rColor = '#3b82f6'; rWeight = 5.5; rDashArray = '8, 8'; }
      else if (route.id === 'P8') { rColor = '#a855f7'; rWeight = 4.5; }
      else if (route.id === 'AB1') { rColor = '#06b6d4'; rWeight = 4.5; }
      else if (route.id === 'R1') { rColor = '#10b981'; rWeight = 4.5; }
      else if (route.id === 'R3') { rColor = '#f59e0b'; rWeight = 4.5; }
      else if (route.id === 'RUTA1') { rColor = '#ef4444'; rWeight = 5.0; }

      let points: [number, number][] = [];
      const staticRoute = INITIAL_ROUTES.find(r => r.id === route.id);
      const pathCoords = route.pathCoordinates || staticRoute?.pathCoordinates;
      if (pathCoords && pathCoords.length >= 2) {
        points = pathCoords;
      } else {
        const stationsList = route.id === 'T2' ? ['Cañaveral', 'Provenza', 'Centro', 'UIS']
          : route.id === 'P8' ? ['Provenza', 'Cabecera', 'Centro']
          : route.id === 'AB1' ? ['Portal Norte', 'Cabecera']
          : route.id === 'R1' ? ['Floridablanca', 'Provenza', 'Centro']
          : route.id === 'RUTA1' ? ['Provenza', 'Centro']
          : ['Girón', 'Provenza'];
        points = stationsList
          .map(pt => REAL_STATION_COORDS[pt])
          .filter(Boolean) as [number, number][];
      }

      if (points.length < 2) return;

      const polyline = L.polyline(points, {
        color: rColor,
        weight: rWeight,
        opacity: 0.85,
        dashArray: rDashArray
      });

      polyline.bindTooltip(
        `<div class="font-sans p-1.5 bg-slate-950 text-white rounded shadow-lg border border-slate-800">
          <strong style="color: ${rColor}">Ruta ${route.id}</strong><br/>
          <span class="text-[10px] font-semibold text-slate-300">${route.name}</span><br/>
          <span class="text-[10px] text-slate-400">Estado: ${route.status === 'delayed' ? '⚠️ Con demoras' : '✅ Transito Normal'}</span>
        </div>`,
        { sticky: true }
      );
      polyline.addTo(dynamicLayers);
    });

    // 2. Draw Active Incident Alert Areas
    incidents.forEach((inc) => {
      const affectedStation = inc.location.includes('Provenza') 
        ? 'Provenza' 
        : inc.location.includes('Cañaveral') 
          ? 'Cañaveral' 
          : 'Provenza';
      const coords = REAL_STATION_COORDS[affectedStation];
      if (!coords) return;

      // Incident radius circle shading (400 meters)
      L.circle(coords, {
        radius: 400,
        color: '#f43f5e',
        fillColor: '#f43f5e',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 4'
      }).addTo(dynamicLayers);

      // Alert Warning caution icon slightly offset
      const warningIcon = L.divIcon({
        className: 'leaflet-custom-danger',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-7 h-7 bg-rose-600 rounded-full animate-ping opacity-55"></div>
            <div class="w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center border border-white shadow-md text-[10px]">
              ⚠️
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([coords[0] + 0.0012, coords[1] - 0.0012], { icon: warningIcon })
        .bindTooltip(`Bloqueo: ${inc.type} (${inc.location})`, { direction: 'top' })
        .addTo(dynamicLayers);
    });

    // 3. Plot Stations Nodes
    Object.entries(REAL_STATION_COORDS).map(([name, coords]) => {
      const stationData = stations.find(s => s.name === name);
      const isSelected = selectedStation?.name === name;

      let mainColor = '#2563eb'; // standard blue
      if (stationData) {
        if (stationData.riskLevel === 'critical') mainColor = '#a855f7'; 
        else if (stationData.riskLevel === 'high') mainColor = '#f43f5e'; 
        else if (stationData.riskLevel === 'medium') mainColor = '#f59e0b'; 
        else mainColor = '#10b981'; 
      }

      const stationIcon = L.divIcon({
        className: 'leaflet-station-wrapper',
        html: `
          <div class="relative flex flex-col items-center justify-center">
            <!-- Pulsing outer ring when selected -->
            ${isSelected ? `<div class="absolute w-8 h-8 rounded-full border-2 animate-ping border-white/60" style="background-color: ${mainColor}2a;"></div>` : ''}

            <!-- Station Node Dot -->
            <div class="w-5.5 h-5.5 rounded-full bg-slate-950 flex items-center justify-center shadow-lg border-2 transition-transform duration-300 ${isSelected ? 'scale-125 border-white ring-2 ring-blue-500' : 'border-slate-350'}" style="border-color: ${mainColor};">
              <div class="w-2 h-2 rounded-full" style="background-color: ${stationData?.riskLevel === 'critical' ? '#ef4444' : '#ffffff'};"></div>
            </div>

            <!-- Capacity Warning badge -->
            ${stationData && (stationData.occupancyCurrent > 80) ? `
              <div class="absolute -top-2.5 -right-2.5 bg-rose-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] animate-bounce">
                !
              </div>
            ` : ''}

            <!-- Label -->
            <div class="absolute top-6 bg-slate-950/90 border border-slate-800 text-[9px] text-slate-200 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap font-semibold font-sans tracking-wide">
              ${name} <span class="opacity-60">(${stationData?.occupancyCurrent || 0}%)</span>
            </div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker(coords, { icon: stationIcon })
        .on('click', () => handleStationClick(name))
        .addTo(dynamicLayers);
    });

    // 4. Plot Buses Vehicles on top
    buses.forEach((bus) => {
      const route = routes.find(r => r.id === bus.routeId);
      const nextCoords = REAL_STATION_COORDS[bus.nextStation];
      if (!nextCoords) return;

      const originCoordName = getPreviousStationName(bus.routeId, bus.nextStation);
      const originCoords = REAL_STATION_COORDS[originCoordName] || REAL_STATION_COORDS['Cañaveral'];

      const busCoords = getBusCurrentPosition(bus, route, originCoords, nextCoords);
      const busLat = busCoords[0];
      const busLng = busCoords[1];

      const isSelected = selectedBus?.id === bus.id;
      let themeColor = '#3b82f6';
      if (bus.occupancy === 'critical') themeColor = '#a855f7';
      else if (bus.occupancy === 'high') themeColor = '#f43f5e';
      else if (bus.occupancy === 'medium') themeColor = '#f59e0b';
      else themeColor = '#10b981';

      const busIcon = L.divIcon({
        className: 'leaflet-bus-wrapper',
        html: `
          <div class="relative flex items-center justify-center">
            ${isSelected ? `<div class="absolute w-8 h-8 rounded-full animate-ping opacity-60" style="background-color: ${themeColor}"></div>` : ''}
            
            <div class="w-7 h-7 bg-slate-900 border-2 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 ${isSelected ? 'scale-125 border-white ring-2 ring-blue-500' : 'border-slate-300'}" style="border-color: ${themeColor};">
              <span class="text-xs">🚌</span>
            </div>
            
            <!-- Route Indicator -->
            <div class="absolute -top-3.5 bg-slate-950 border text-[8px] font-extrabold text-white px-1 py-0.2 rounded shadow-xs" style="border-color: ${themeColor};">
              ${bus.routeId}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([busLat, busLng], { icon: busIcon })
        .on('click', (e) => handleBusClick(bus, e))
        .addTo(dynamicLayers);
    });

  }, [routes, stations, buses, incidents, selectedStation, selectedBus, mapViewMode, basemap]);

  // Autocomplete suggestions handler
  const filteredSuggestions = Object.keys(REAL_STATION_COORDS).filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    handleStationClick(name);
  };

  return (
    <div id={id} className={`bg-slate-900 rounded-xl overflow-hidden border border-slate-950 shadow-inner relative flex flex-col ${className}`}>
      
      {/* Telemetry control panel & View Mode Toggle */}
      <div className="bg-slate-950 px-4 py-2 text-xs border-b border-slate-800/60 text-slate-400 flex items-center justify-between z-30">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SISTEMA DE GEOLOCALIZACIÓN IA Y SEGUIMIENTO GNSS</span>
        </div>
        
        {/* Toggle between real GIS map and SVGs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-md p-1 items-center gap-1">
          <button 
            type="button"
            onClick={() => setMapViewMode('real')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase transition cursor-pointer ${mapViewMode === 'real' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🗺️ Mapa Real 2D
          </button>
          <button 
            type="button"
            onClick={() => setMapViewMode('schematic')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase transition cursor-pointer ${mapViewMode === 'schematic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📊 Esquema
          </button>
        </div>
      </div>

      {/* CORE MAP RENDER CHASSIS */}
      <div className="relative flex-1 min-h-[400px] md:min-h-[500px] bg-linear-to-b from-slate-900 to-slate-950">
        
        {/* Interactive Search Overlay on real-time map */}
        {mapViewMode === 'real' && (
          <div className="absolute top-3 left-3 z-[600] w-64 md:w-72 font-sans">
            <div className="relative">
              <div className="flex bg-slate-950/95 border border-slate-800/80 rounded-lg shadow-xl p-1 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="🔎 Buscar estación Metrolínea..."
                  className="w-full bg-slate-900 text-xs font-semibold text-white px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                    className="text-slate-400 hover:text-white px-1 text-xs font-semibold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {showSuggestions && (
                <div className="absolute top-11 left-0 right-0 max-h-48 overflow-y-auto bg-slate-950/98 border border-slate-800 rounded-lg shadow-2xl z-[650] divide-y divide-slate-900/60 font-semibold text-xs">
                  {filteredSuggestions.map(name => {
                    const stationData = stations.find(s => s.name === name);
                    let riskColor = 'text-green-400';
                    if (stationData?.riskLevel === 'critical') riskColor = 'text-purple-400';
                    else if (stationData?.riskLevel === 'high') riskColor = 'text-red-400';
                    else if (stationData?.riskLevel === 'medium') riskColor = 'text-amber-400';

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectSuggestion(name)}
                        className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-900 hover:text-white transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1">🏢 {name}</span>
                        {stationData && (
                          <span className={`text-[10px] font-mono ${riskColor}`}>
                            {stationData.occupancyCurrent}% CAP
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {filteredSuggestions.length === 0 && (
                    <div className="px-3 py-2 text-slate-500 text-[11px] text-center">
                      No se encontraron estaciones
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Basemap Style switcher */}
        {mapViewMode === 'real' && (
          <div className="absolute top-3 right-3 z-[600] font-sans">
            <div className="flex bg-slate-950/95 border border-slate-800 rounded-lg shadow-xl p-0.5 select-none text-[9px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setBasemap('dark')}
                className={`px-2 py-1 rounded transition cursor-pointer ${basemap === 'dark' ? 'bg-blue-600 text-white shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'}`}
              >
                🕶️ Oscuro
              </button>
              <button
                type="button"
                onClick={() => setBasemap('streets')}
                className={`px-2 py-1 rounded transition cursor-pointer ${basemap === 'streets' ? 'bg-blue-600 text-white shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'}`}
              >
                🏙️ Satélite/Calle
              </button>
            </div>
          </div>
        )}

        {/* 1. REAL 2D CONTAINER */}
        <div 
          ref={mapContainerRef} 
          className={`absolute inset-0 transition-opacity duration-300 ${mapViewMode === 'real' ? 'opacity-100 z-10' : 'opacity-0 -z-50 pointer-events-none'}`} 
        />

        {/* 2. SCHEMATIC VIEW CONTAINER (Original clean SVG view) */}
        {mapViewMode === 'schematic' && (
          <div className="absolute inset-0 z-10 w-full h-full">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-15" />
            <svg viewBox="0 0 1000 600" className="w-full h-full p-4 relative z-10 select-none">
              <defs>
                <filter id="glow-station" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* DRAW ROUTE LINES */}
              {routePaths.map((route) => {
                const pointsStr = route.points
                  .map((st) => {
                    const c = getSchematicCoords(st);
                    return `${c.x},${c.y}`;
                  })
                  .join(' ');

                return (
                  <g key={route.id} className="opacity-80 hover:opacity-100 transition-opacity">
                    <polyline points={pointsStr} fill="none" stroke={route.color} strokeWidth={route.width + 5} strokeOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={pointsStr} fill="none" stroke={route.color} strokeWidth={route.width} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                );
              })}

              {/* PLOT STATIONS */}
              {Object.entries(SCHEMATIC_STATION_COORDS).map(([name, coords]) => {
                const stationData = stations.find(s => s.name === name);
                const isHovered = hoveredNode === name;
                const isSelected = selectedStation?.name === name;
                
                let mainColor = '#3b82f6';
                if (stationData) {
                  if (stationData.riskLevel === 'critical') mainColor = '#a855f7';
                  else if (stationData.riskLevel === 'high') mainColor = '#f43f5e';
                  else if (stationData.riskLevel === 'medium') mainColor = '#f59e0b';
                  else mainColor = '#10b981';
                }

                return (
                  <g key={name} className="cursor-pointer" onMouseEnter={() => setHoveredNode(name)} onMouseLeave={() => setHoveredNode(null)} onClick={() => handleStationClick(name)}>
                    {(isHovered || isSelected) && <circle cx={coords.x} cy={coords.y} r={isSelected ? "22" : "18"} fill={mainColor} fillOpacity="0.3" filter="url(#glow-station)" />}
                    <circle cx={coords.x} cy={coords.y} r={isSelected ? "14" : "10"} fill="#0f172a" stroke={mainColor} strokeWidth={isSelected ? "5" : "3"} />
                    <circle cx={coords.x} cy={coords.y} r={isSelected ? "5" : "3.5"} fill={stationData?.riskLevel === 'critical' ? '#ef4444' : '#ffffff'} />
                    <text x={coords.x} y={coords.y + (name === 'Provenza' ? -22 : 28)} fill={isHovered || isSelected ? '#ffffff' : '#94a3b8'} fontSize={isHovered || isSelected ? "13" : "11"} fontWeight={isHovered || isSelected ? "bold" : "medium"} textAnchor="middle" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{name}</text>
                  </g>
                );
              })}

              {/* PLOT BUSES */}
              {buses.map((bus) => {
                const route = routes.find(r => r.id === bus.routeId);
                const parentCoords = getSchematicCoords(bus.nextStation);
                const originCoordName = route ? (route.origin === bus.nextStation ? route.destination : route.origin) : 'Cañaveral';
                const originCoords = getSchematicCoords(originCoordName);
                
                const ratio = Math.max(0.1, Math.min(0.9, 1 - (bus.etaMinutes / 25)));
                const busX = originCoords.x + (parentCoords.x - originCoords.x) * ratio;
                const busY = originCoords.y + (parentCoords.y - originCoords.y) * ratio;

                const isSelected = selectedBus?.id === bus.id;
                let themeColor = '#2563eb';
                if (bus.occupancy === 'critical') themeColor = '#7c3aed';
                else if (bus.occupancy === 'high') themeColor = '#ef4444';
                else if (bus.occupancy === 'medium') themeColor = '#f59e0b';
                else themeColor = '#10b981';

                return (
                  <g key={bus.id} className="cursor-pointer" onClick={(e) => handleBusClick(bus, e)}>
                    {isSelected && <circle cx={busX} cy={busY} r="19" fill={themeColor} fillOpacity="0.4" className="animate-ping" />}
                    <rect x={busX - 9} y={busY - 9} width="18" height="18" rx="4" fill={themeColor} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={busX} y={busY + 3.5} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none">🚌</text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* INFO MODALS DETECTOR OVERLAYS (FOR BOTH MODES) */}
        {(selectedStation || selectedBus) && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-800 text-slate-100 rounded-lg p-3.5 shadow-xl md:max-w-md z-30 transition-all duration-300 animate-slide-up">
            <div className="flex items-start justify-between mb-2 pb-2 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-slate-900 text-blue-400">
                  {selectedStation ? <MapPin className="w-4 h-4" /> : <BusIcon className="w-4 h-4" />}
                </span>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-white">
                    {selectedStation ? `Estación: ${selectedStation.name}` : `Unidad: Bus ${selectedBus?.id}`}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 block tracking-wide uppercase mt-0.5">
                    {selectedStation ? `Capacidad Límite: ${selectedStation.capacity} Pax` : `Frecuencia Corredor: Ruta ${selectedBus?.routeId}`}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setSelectedStation(null); setSelectedBus(null); }}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedStation && (
              <div className="text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-2 my-2 font-mono">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Ocupación Actual</span>
                    <span className={`font-extrabold text-sm ${
                      selectedStation.occupancyCurrent > 85 ? 'text-red-400' : selectedStation.occupancyCurrent > 60 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {selectedStation.occupancyCurrent}%
                    </span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">ETA Pronóstico (20 Min)</span>
                    <span className={`font-extrabold text-sm ${
                      selectedStation.occupancyPrediction20Min > 85 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      ~{selectedStation.occupancyPrediction20Min}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 bg-blue-950/25 border border-blue-900/30 p-2.5 rounded text-slate-300 items-start">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong className="text-blue-400">Optimización IA: </strong> 
                    {selectedStation.recommendation}
                  </span>
                </div>
                
                {selectedStation.occupancyCurrent > 70 && (
                  <div className="text-[10px] bg-rose-950/40 border border-rose-911/20 text-rose-300 px-2 py-1 rounded flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-rose-450" />
                    <span>Riesgo Operativo: {selectedStation.riskLevel.toUpperCase()} (Elevada aglomeración).</span>
                  </div>
                )}
              </div>
            )}

            {selectedBus && (
              <div className="text-xs space-y-1.5">
                <div className="grid grid-cols-3 gap-1.5 my-2 text-center font-mono">
                  <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">ETA</span>
                    <span className="font-extrabold text-xs text-yellow-450">{selectedBus.etaMinutes} MIN</span>
                  </div>
                  <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Saturación</span>
                    <span className="font-extrabold text-[10px] text-white capitalize">{selectedBus.occupancy}</span>
                  </div>
                  <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Velocidad</span>
                    <span className="font-extrabold text-xs text-emerald-450">
                      {selectedBus.status === 'delayed' ? '12 km/h' : '28 km/h'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 bg-slate-900/40 p-2 rounded border border-slate-850">
                  <p>👤 <strong>Conductor a cargo:</strong> {selectedBus.driverName}</p>
                  <p>📍 <strong>Próximo Destino:</strong> Estación {selectedBus.nextStation}</p>
                  <p>🚦 <strong>Horario:</strong> {selectedBus.status === 'delayed' ? '⚠️ Unidad con demoras' : '✅ Transitando a tiempo'}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Map Legend representational keys */}
      <div className="bg-slate-950 px-4 py-3 border-t border-slate-800/80 text-[11px] text-slate-400 grid grid-cols-2 md:grid-cols-4 gap-2.5 z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Bajo / Fluido (Normal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Moderado (Congestión)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Alto / Retrasos de Flotas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
          <span>Alerta IA / Intervención Directa</span>
        </div>
      </div>
    </div>
  );
};
