import React, { useMemo, useState } from 'react';
import { useMetro } from '../../contexts/MetroContext';
import { AdminBus, AdminRoute, UpsertBusPayload, UpsertRoutePayload } from '../../types';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Bus, ChevronDown, ChevronUp, Edit3, PlusCircle, RefreshCw, Route as RouteIcon, Save, Trash2, XCircle } from 'lucide-react';

const emptyRouteForm: UpsertRoutePayload = {
  code: '',
  name: '',
  description: '',
  stationCodes: [],
  avgTimeMinutes: 24,
  delayMinutes: 0,
  occupancy: 'low',
  status: 'normal',
  routeType: 'Trunk'
};

const emptyBusForm: UpsertBusPayload = {
  internalCode: '',
  plate: '',
  driverName: '',
  busType: 'Standard',
  capacity: 90,
  currentOccupancy: 0,
  occupancy: 'low',
  routeCode: '',
  nextStationCode: '',
  etaMinutes: 4,
  status: 'active'
};

export const AdminFleetManager: React.FC = () => {
  const {
    stations,
    routes,
    adminRoutes,
    adminBuses,
    refreshAdminFleet,
    createManagedRoute,
    updateManagedRoute,
    deleteManagedRoute,
    createManagedBus,
    updateManagedBus,
    deleteManagedBus,
    addToast
  } = useMetro();

  const [routeForm, setRouteForm] = useState<UpsertRoutePayload>(emptyRouteForm);
  const [editingRouteCode, setEditingRouteCode] = useState<string | null>(null);
  const [busForm, setBusForm] = useState<UpsertBusPayload>({ ...emptyBusForm, routeCode: routes[0]?.id ?? '' });
  const [editingBusCode, setEditingBusCode] = useState<string | null>(null);

  const selectedRoute = adminRoutes.find((route) => route.code === busForm.routeCode);
  const selectedRouteStations = selectedRoute?.stations ?? [];

  const stationLookup = useMemo(
    () => new Map(stations.map((station) => [station.id, station])),
    [stations]
  );

  const selectedStationNames = routeForm.stationCodes
    .map((code) => stationLookup.get(code)?.name ?? code);

  const resetRouteForm = () => {
    setRouteForm(emptyRouteForm);
    setEditingRouteCode(null);
  };

  const resetBusForm = () => {
    setBusForm({ ...emptyBusForm, routeCode: routes[0]?.id ?? '', nextStationCode: '' });
    setEditingBusCode(null);
  };

  const addStationToRoute = (code: string) => {
    if (!code || routeForm.stationCodes.includes(code)) return;
    setRouteForm((current) => ({ ...current, stationCodes: [...current.stationCodes, code] }));
  };

  const removeStationFromRoute = (code: string) => {
    setRouteForm((current) => ({ ...current, stationCodes: current.stationCodes.filter((item) => item !== code) }));
  };

  const moveStation = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= routeForm.stationCodes.length) return;
    const stationCodes = [...routeForm.stationCodes];
    [stationCodes[index], stationCodes[nextIndex]] = [stationCodes[nextIndex], stationCodes[index]];
    setRouteForm((current) => ({ ...current, stationCodes }));
  };

  const editRoute = (route: AdminRoute) => {
    setEditingRouteCode(route.code);
    setRouteForm({
      code: route.code,
      name: route.name,
      description: `${route.origin} hacia ${route.destination}`,
      stationCodes: route.stations.map((station) => station.code),
      avgTimeMinutes: route.avgTimeMinutes,
      delayMinutes: route.delayMinutes,
      occupancy: route.occupancy,
      status: route.status,
      routeType: route.routeType
    });
  };

  const submitRoute = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!routeForm.name.trim()) {
      addToast('error', 'Ruta incompleta', 'Ingresa el nombre de la ruta.');
      return;
    }
    if (routeForm.stationCodes.length < 2) {
      addToast('error', 'Ruta incompleta', 'Selecciona al menos dos estaciones.');
      return;
    }

    if (editingRouteCode) {
      await updateManagedRoute(editingRouteCode, routeForm);
    } else {
      await createManagedRoute(routeForm);
    }
    resetRouteForm();
  };

  const editBus = (bus: AdminBus) => {
    const route = adminRoutes.find((item) => item.code === bus.routeId);
    const nextStation = route?.stations.find((station) => station.name === bus.nextStation);
    setEditingBusCode(bus.internalCode);
    setBusForm({
      internalCode: bus.internalCode,
      plate: bus.plate,
      driverName: bus.driverName,
      busType: bus.busType,
      capacity: bus.capacity,
      currentOccupancy: bus.currentOccupancy,
      occupancy: bus.occupancy,
      routeCode: bus.routeId,
      nextStationCode: nextStation?.code ?? route?.stations[0]?.code ?? '',
      etaMinutes: bus.etaMinutes,
      status: bus.status
    });
  };

  const submitBus = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!busForm.internalCode.trim() || !busForm.driverName.trim() || !busForm.routeCode) {
      addToast('error', 'Bus incompleto', 'Completa codigo, conductor y ruta asignada.');
      return;
    }

    if (editingBusCode) {
      await updateManagedBus(editingBusCode, busForm);
    } else {
      await createManagedBus(busForm);
    }
    resetBusForm();
  };

  const confirmDeleteRoute = async (code: string) => {
    if (!window.confirm(`Eliminar la ruta ${code}? Solo se permite si no tiene buses asignados.`)) return;
    await deleteManagedRoute(code);
  };

  const confirmDeleteBus = async (code: string) => {
    if (!window.confirm(`Eliminar el bus ${code}?`)) return;
    await deleteManagedBus(code);
  };

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                <RouteIcon className="w-4.5 h-4.5 text-blue-600" />
                Gestion de rutas
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Define estaciones en orden para conservar direccion, segmentos y trazado.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refreshAdminFleet} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Sync
            </Button>
          </div>

          <form onSubmit={submitRoute} className="space-y-3 bg-slate-50/70 border border-slate-150 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={routeForm.code ?? ''}
                onChange={(event) => setRouteForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="Codigo opcional, ej. R7"
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
              />
              <input
                value={routeForm.name}
                onChange={(event) => setRouteForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre de la ruta"
                className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                type="number"
                value={routeForm.avgTimeMinutes}
                onChange={(event) => setRouteForm((current) => ({ ...current, avgTimeMinutes: Number(event.target.value) }))}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                min={1}
              />
              <input
                type="number"
                value={routeForm.delayMinutes}
                onChange={(event) => setRouteForm((current) => ({ ...current, delayMinutes: Number(event.target.value) }))}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                min={0}
              />
              <select
                value={routeForm.occupancy}
                onChange={(event) => setRouteForm((current) => ({ ...current, occupancy: event.target.value as UpsertRoutePayload['occupancy'] }))}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="low">Ocup. baja</option>
                <option value="medium">Ocup. media</option>
                <option value="high">Ocup. alta</option>
                <option value="critical">Critica</option>
              </select>
              <select
                value={routeForm.routeType}
                onChange={(event) => setRouteForm((current) => ({ ...current, routeType: event.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="Trunk">Troncal</option>
                <option value="Feeder">Alimentadora</option>
                <option value="Express">Expresa</option>
                <option value="Circular">Circular</option>
              </select>
            </div>

            <select
              value=""
              onChange={(event) => addStationToRoute(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
            >
              <option value="">Agregar estacion a la ruta...</option>
              {stations.filter((station) => !routeForm.stationCodes.includes(station.id)).map((station) => (
                <option key={station.id} value={station.id}>{station.name} ({station.id})</option>
              ))}
            </select>

            <div className="rounded-xl border border-slate-200 bg-white p-3 min-h-24">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Orden y direccion del recorrido</span>
              {routeForm.stationCodes.length === 0 ? (
                <p className="text-xs text-slate-400 mt-2">Agrega estaciones para construir el trayecto.</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {routeForm.stationCodes.map((code, index) => (
                    <div key={code} className="flex items-center gap-2 rounded-lg border border-slate-150 bg-slate-50 px-2.5 py-1.5">
                      <span className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                      <span className="flex-1 text-xs font-bold text-slate-750 truncate">{stationLookup.get(code)?.name ?? code}</span>
                      <button type="button" onClick={() => moveStation(index, -1)} className="p-1 text-slate-400 hover:text-blue-600"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => moveStation(index, 1)} className="p-1 text-slate-400 hover:text-blue-600"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => removeStationFromRoute(code)} className="p-1 text-rose-500 hover:text-rose-700"><XCircle className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 font-semibold">
              Vista previa: {selectedStationNames.length ? selectedStationNames.join(' -> ') : 'Sin estaciones seleccionadas'}
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="flex-1" icon={<Save className="w-4 h-4" />}>
                {editingRouteCode ? 'Guardar ruta' : 'Crear ruta'}
              </Button>
              {editingRouteCode && (
                <Button type="button" variant="outline" onClick={resetRouteForm}>Cancelar</Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4.5 h-4.5 text-emerald-600" />
                Gestion de buses
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Crea unidades y asignalas a rutas existentes.
              </p>
            </div>
            <Badge color="green">{adminBuses.length} buses</Badge>
          </div>

          <form onSubmit={submitBus} className="space-y-3 bg-slate-50/70 border border-slate-150 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={busForm.internalCode} onChange={(event) => setBusForm((current) => ({ ...current, internalCode: event.target.value }))} placeholder="Codigo interno BUS-900" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
              <input value={busForm.plate ?? ''} onChange={(event) => setBusForm((current) => ({ ...current, plate: event.target.value }))} placeholder="Placa" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
              <input value={busForm.driverName} onChange={(event) => setBusForm((current) => ({ ...current, driverName: event.target.value }))} placeholder="Conductor" className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select value={busForm.routeCode} onChange={(event) => setBusForm((current) => ({ ...current, routeCode: event.target.value, nextStationCode: '' }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                <option value="">Ruta asignada...</option>
                {adminRoutes.map((route) => <option key={route.code} value={route.code}>{route.code} - {route.name}</option>)}
              </select>
              <select value={busForm.nextStationCode ?? ''} onChange={(event) => setBusForm((current) => ({ ...current, nextStationCode: event.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                <option value="">Proxima estacion...</option>
                {selectedRouteStations.map((station) => <option key={station.code} value={station.code}>{station.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input type="number" min={1} value={busForm.capacity} onChange={(event) => setBusForm((current) => ({ ...current, capacity: Number(event.target.value) }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
              <input type="number" min={0} value={busForm.currentOccupancy} onChange={(event) => setBusForm((current) => ({ ...current, currentOccupancy: Number(event.target.value) }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
              <input type="number" min={0} value={busForm.etaMinutes} onChange={(event) => setBusForm((current) => ({ ...current, etaMinutes: Number(event.target.value) }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold" />
              <select value={busForm.status} onChange={(event) => setBusForm((current) => ({ ...current, status: event.target.value as UpsertBusPayload['status'] }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                <option value="active">Activo</option>
                <option value="delayed">Retrasado</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select value={busForm.occupancy} onChange={(event) => setBusForm((current) => ({ ...current, occupancy: event.target.value as UpsertBusPayload['occupancy'] }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                <option value="low">Ocup. baja</option>
                <option value="medium">Ocup. media</option>
                <option value="high">Ocup. alta</option>
                <option value="critical">Critica</option>
              </select>
              <select value={busForm.busType} onChange={(event) => setBusForm((current) => ({ ...current, busType: event.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
                <option value="Standard">Estandar</option>
                <option value="Articulated">Articulado</option>
                <option value="Feeder">Alimentador</option>
                <option value="Electric">Electrico</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="flex-1" icon={<PlusCircle className="w-4 h-4" />}>
                {editingBusCode ? 'Guardar bus' : 'Crear bus'}
              </Button>
              {editingBusCode && <Button type="button" variant="outline" onClick={resetBusForm}>Cancelar</Button>}
            </div>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5 border border-slate-200">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Rutas registradas</h4>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {adminRoutes.map((route) => (
              <div key={route.code} className="rounded-xl border border-slate-150 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge color="blue">{route.code}</Badge>
                      <strong className="text-xs text-slate-850">{route.name}</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">{route.origin} {'->'} {route.destination}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editRoute(route)} className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => confirmDeleteRoute(route.code)} className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  {route.stations.map((station) => station.name).join(' -> ')}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Buses registrados</h4>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {adminBuses.map((bus) => (
              <div key={bus.internalCode} className="rounded-xl border border-slate-150 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge color={bus.status === 'maintenance' ? 'yellow' : bus.status === 'delayed' ? 'red' : 'green'}>{bus.internalCode}</Badge>
                      <strong className="text-xs text-slate-850">{bus.driverName}</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Ruta {bus.routeId} - proxima estacion: {bus.nextStation}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editBus(bus)} className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => confirmDeleteBus(bus.internalCode)} className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-bold">
                  <span>ETA {bus.etaMinutes}m</span>
                  <span>{bus.currentOccupancy}/{bus.capacity}</span>
                  <span>{bus.occupancy}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
