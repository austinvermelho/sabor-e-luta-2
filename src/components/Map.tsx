import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RotateCw, Maximize2, MapPin, LocateFixed, Loader2, Flame, ExternalLink } from 'lucide-react';
import { Establishment } from '../types';

interface MapProps {
  establishments: Establishment[];
  selectedId: string | null;
  onSelectEstablishment: (id: string) => void;
  onOpenDetails: (item: Establishment) => void;
  interactiveSelectMode?: boolean;
  onCoordinatesPicked?: (lat: number, lng: number) => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
}

// Custom Leaflet pin icon generator
const createCustomPinIcon = (isSelected: boolean) => {
  const color = isSelected ? '#b71c1c' : '#d32f2f';
  const size = isSelected ? 38 : 32;

  const svg = `
    <svg width="${size}" height="${size * 1.2}" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 0C8.5 0 0 8.5 0 19C0 31.5 19 46 19 46C19 46 38 31.5 38 19C38 8.5 29.5 0 19 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="19" cy="18" r="7" fill="#FBC02D" />
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon',
    iconSize: [size, size * 1.2],
    iconAnchor: [size / 2, size * 1.2],
    popupAnchor: [0, -size * 1.1],
  });
};

// Picked coordinates pin icon
const createPickedPinIcon = () => {
  const svg = `
    <svg width="36" height="44" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 0C8.5 0 0 8.5 0 19C0 31.5 19 46 19 46C19 46 38 31.5 38 19C38 8.5 29.5 0 19 0Z" fill="#FBC02D" stroke="#171717" stroke-width="2.5"/>
      <circle cx="19" cy="18" r="6" fill="#171717" />
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon animate-bounce',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
  });
};

// Density cluster pin icon
const createDensityIcon = (count: number, city: string) => {
  const html = `
    <div style="background: linear-gradient(135deg, #d32f2f, #b71c1c); color: #fff; border: 2px solid #ffffff; border-radius: 9999px; width: 48px; height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); text-align: center;">
      <span style="font-weight: 800; font-size: 13px; line-height: 1;">${count}</span>
      <span style="font-size: 9px; font-weight: 600; opacity: 0.9; max-width: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${city}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

export const Map: React.FC<MapProps> = ({
  establishments,
  selectedId,
  onSelectEstablishment,
  onOpenDetails,
  interactiveSelectMode = false,
  onCoordinatesPicked,
  pickedCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const heatmapGroupRef = useRef<L.LayerGroup | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Compute regional density for Heatmap overlay
  const regionalDensity = useMemo(() => {
    if (!showHeatmap || establishments.length === 0) return [];
    const counts: { [key: string]: { count: number; latSum: number; lngSum: number; city: string; state: string } } = {};

    establishments.forEach((e) => {
      if (typeof e.latitude !== 'number' || typeof e.longitude !== 'number' || isNaN(e.latitude) || isNaN(e.longitude)) return;
      const key = `${e.city}-${e.state}`;
      if (!counts[key]) {
        counts[key] = { count: 0, latSum: 0, lngSum: 0, city: e.city, state: e.state };
      }
      counts[key].count += 1;
      counts[key].latSum += e.latitude;
      counts[key].lngSum += e.longitude;
    });

    return Object.values(counts).map((r) => ({
      city: r.city,
      state: r.state,
      count: r.count,
      lat: r.latSum / r.count,
      lng: r.lngSum / r.count,
    }));
  }, [showHeatmap, establishments]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-14.235, -51.925],
      zoom: 4,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    heatmapGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle click events on map (for interactive coordinate picking)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (interactiveSelectMode && onCoordinatesPicked) {
        onCoordinatesPicked(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [interactiveSelectMode, onCoordinatesPicked]);

  // Update Establishment Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    establishments.forEach((item) => {
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number' || isNaN(item.latitude) || isNaN(item.longitude)) {
        return;
      }

      const isSelected = item.id === selectedId;
      const icon = createCustomPinIcon(isSelected);

      const marker = L.marker([item.latitude, item.longitude], { icon });

      // Custom Popup HTML
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 max-w-[240px] text-neutral-900 font-sans';
      popupDiv.innerHTML = `
        <h4 class="font-bold text-sm text-neutral-900 leading-tight mb-0.5">${item.name}</h4>
        <p class="text-[11px] text-neutral-500 mb-2">${item.address}, ${item.city} - ${item.state}</p>
        <p class="text-xs text-neutral-700 line-clamp-2 mb-3 leading-snug">${item.description}</p>
        <div class="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
          <button id="btn-details-${item.id}" class="bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-[11px] font-bold py-1.5 px-2.5 rounded transition-colors flex-1 text-center cursor-pointer">
            Ver Detalhes
          </button>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${item.address}, ${item.city} - ${item.state}, Brasil`)}" target="_blank" rel="noopener noreferrer" class="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium py-1.5 px-2 rounded transition-colors inline-flex items-center justify-center gap-1">
            <span>Rota</span>
          </a>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        onSelectEstablishment(item.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-details-${item.id}`);
        if (btn) {
          btn.onclick = () => onOpenDetails(item);
        }
      });

      markersGroup.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
        map.panTo([item.latitude, item.longitude]);
      }
    });
  }, [establishments, selectedId, onSelectEstablishment, onOpenDetails]);

  // Handle Picked Coordinates Marker in Registration Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedMarkerRef.current) {
      map.removeLayer(pickedMarkerRef.current);
      pickedMarkerRef.current = null;
    }

    if (pickedCoordinates && !isNaN(pickedCoordinates.lat) && !isNaN(pickedCoordinates.lng)) {
      const marker = L.marker([pickedCoordinates.lat, pickedCoordinates.lng], {
        icon: createPickedPinIcon(),
      }).addTo(map);

      pickedMarkerRef.current = marker;
      map.panTo([pickedCoordinates.lat, pickedCoordinates.lng]);
    }
  }, [pickedCoordinates]);

  // Handle Heatmap / Regional Density Markers
  useEffect(() => {
    const heatmapGroup = heatmapGroupRef.current;
    if (!heatmapGroup) return;

    heatmapGroup.clearLayers();

    if (showHeatmap) {
      regionalDensity.forEach((reg) => {
        const marker = L.marker([reg.lat, reg.lng], {
          icon: createDensityIcon(reg.count, reg.city),
        });
        heatmapGroup.addLayer(marker);
      });
    }
  }, [showHeatmap, regionalDensity]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setMapNotice('Geolocalização não é suportada pelo navegador.');
      setTimeout(() => setMapNotice(null), 3000);
      return;
    }

    setIsLocating(true);
    setMapNotice('Obtendo localização via GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([coords.lat, coords.lng], 15);
        }

        setMapNotice('Mapa centralizado na sua localização atual!');
        setTimeout(() => setMapNotice(null), 3000);
      },
      (err) => {
        setIsLocating(false);
        setMapNotice('Não foi possível obter sua localização atual.');
        setTimeout(() => setMapNotice(null), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || establishments.length === 0) return;

    const bounds = L.latLngBounds([]);
    let validCount = 0;

    establishments.forEach((e) => {
      if (typeof e.latitude === 'number' && typeof e.longitude === 'number' && !isNaN(e.latitude) && !isNaN(e.longitude)) {
        bounds.extend([e.latitude, e.longitude]);
        validCount++;
      }
    });

    if (validCount > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleReload = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.invalidateSize();
    }
    setMapNotice('Mapa atualizado!');
    setTimeout(() => setMapNotice(null), 2000);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-rose-200/80 shadow-2xs bg-neutral-100">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-10" />

      {/* Map Controls Toolbar (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-rose-200/70 shadow-xs">
        <button
          onClick={handleReload}
          title="Recarregar mapa"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 hover:text-[#d32f2f] hover:bg-rose-50/70 rounded transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCw className="w-3 h-3 text-[#d32f2f]" />
          <span>Recarregar</span>
        </button>

        <button
          onClick={handleFitAll}
          title="Ver todos os pontos cadastrados"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 hover:text-[#d32f2f] hover:bg-rose-50/70 rounded transition-colors whitespace-nowrap cursor-pointer"
        >
          <Maximize2 className="w-3 h-3 text-neutral-500" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          title="Alternar mapa de calor e densidade por região"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
            showHeatmap
              ? 'bg-[#d32f2f] text-white font-bold shadow-xs'
              : 'text-neutral-600 hover:text-[#d32f2f] hover:bg-rose-50/70'
          }`}
        >
          <Flame className={`w-3 h-3 ${showHeatmap ? 'text-white' : 'text-[#d32f2f]'}`} />
          <span>{showHeatmap ? 'Ocultar Calor' : 'Mapa de Calor'}</span>
        </button>
      </div>

      {/* GPS Location Button (Bottom Left) */}
      <div className="absolute bottom-5 left-4 z-20">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Centralizar o mapa na minha localização atual"
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-white/95 hover:bg-white active:bg-rose-50 text-neutral-800 hover:text-[#d32f2f] rounded-full shadow-md hover:shadow-lg border border-rose-200/80 transition-all font-medium text-xs backdrop-blur-md cursor-pointer disabled:opacity-75"
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              isLocating
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-50 text-[#d32f2f] group-hover:bg-[#d32f2f] group-hover:text-white'
            }`}
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          </div>
          <span className="font-semibold text-neutral-800 group-hover:text-[#d32f2f] pr-1">
            {isLocating ? 'Buscando GPS...' : 'Minha Localização'}
          </span>
        </button>
      </div>

      {/* Map Status Toast Banner */}
      {mapNotice && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-neutral-900/90 text-white text-xs px-3.5 py-2 rounded-full shadow-lg border border-neutral-700 backdrop-blur-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fbc02d] animate-ping" />
          <span>{mapNotice}</span>
        </div>
      )}

      {/* Interactive Pin Picker Mode Banner */}
      {interactiveSelectMode && (
        <div className="absolute top-3 right-3 z-20 bg-[#fbc02d] text-neutral-900 px-3 py-2 rounded-lg shadow-lg border border-amber-400 flex items-center gap-2 text-xs font-bold animate-pulse">
          <MapPin className="w-4 h-4 text-[#d32f2f]" />
          <span>Clique no mapa para marcar a localização exata</span>
        </div>
      )}
    </div>
  );
};
