import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RotateCw, Navigation, Maximize2, MapPin, LocateFixed, Loader2, Flame } from 'lucide-react';
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

// Custom DivIcon for Leaflet: Resilient, no broken asset links, perfectly styled with brand colors
const createCustomMarker = (isSelected: boolean) => {
  const pinColor = isSelected ? '#b71c1c' : '#d32f2f';

  const html = `
    <div style="position:relative;width:32px;height:40px;cursor:pointer;transform:${isSelected ? 'scale(1.2)' : 'scale(1)'};transition:transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
      <svg viewBox="0 0 24 30" width="32" height="40" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));">
        <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="12" cy="11" r="4.5" fill="#ffffff" />
        <circle cx="12" cy="11" r="2.5" fill="#fbc02d" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker-icon',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
  });
};

const createPickedCoordMarker = () => {
  const html = `
    <div style="position:relative;width:36px;height:44px;cursor:pointer;animation:bounce 1s infinite alternate;">
      <svg viewBox="0 0 24 30" width="36" height="44" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
        <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#fbc02d" stroke="#1c1917" stroke-width="2" />
        <circle cx="12" cy="11" r="4.5" fill="#1c1917" />
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-marker-icon',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  });
};

// Pulsing user live location marker
const createUserLocationIcon = () => {
  const html = `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;width:24px;height:24px;border-radius:50%;background:#d32f2f;opacity:0.35;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <span style="position:relative;width:14px;height:14px;border-radius:50%;background:#d32f2f;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on Brazil
    const map = L.map(mapContainerRef.current, {
      center: [-14.235, -51.925],
      zoom: 4,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    // Custom Zoom control position bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Official Free OpenStreetMap Tile Layer (no CORS, no tokens, resilient)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> colaboradores',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const heatmapGroup = L.layerGroup().addTo(map);
    heatmapLayerRef.current = heatmapGroup;

    mapInstanceRef.current = map;

    // Click handler for picking coordinates in register mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (interactiveSelectMode && onCoordinatesPicked) {
        onCoordinatesPicked(e.latlng.lat, e.latlng.lng);
      }
    });

    // Resize observer for layout integrity
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      userLocationMarkerRef.current = null;
      userLocationCircleRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Picked Marker (in Registration Mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedMarkerRef.current) {
      map.removeLayer(pickedMarkerRef.current);
      pickedMarkerRef.current = null;
    }

    if (pickedCoordinates && pickedCoordinates.lat && pickedCoordinates.lng) {
      const marker = L.marker([pickedCoordinates.lat, pickedCoordinates.lng], {
        icon: createPickedCoordMarker(),
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 10px; font-size: 13px;">
          <strong style="color: #d32f2f;">Ponto Selecionado</strong><br/>
          Lat: ${pickedCoordinates.lat.toFixed(5)}<br/>
          Lng: ${pickedCoordinates.lng.toFixed(5)}
        </div>
      `).openPopup();

      pickedMarkerRef.current = marker;
      map.panTo([pickedCoordinates.lat, pickedCoordinates.lng], { animate: true });
    }
  }, [pickedCoordinates]);

  // Update Markers from Establishments
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (establishments.length === 0) return;

    const bounds = L.latLngBounds([]);

    establishments.forEach((item) => {
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return;
      if (isNaN(item.latitude) || isNaN(item.longitude)) return;

      const isSelected = item.id === selectedId;
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createCustomMarker(isSelected),
        title: item.name,
      });

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

      // Build popup content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 bg-white max-w-[270px]';
      popupDiv.innerHTML = `
        <div class="border-b border-neutral-100 pb-2 mb-2">
          <h4 class="font-bold text-sm text-neutral-900 leading-tight">${item.name}</h4>
          <span class="text-[11px] text-neutral-500">${item.city} - ${item.state}</span>
        </div>
        <p class="text-xs text-neutral-600 line-clamp-2 mb-3">${item.description}</p>
        <div class="grid grid-cols-2 gap-1.5">
          <button id="btn-popup-${item.id}" class="bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-[11px] font-semibold py-1.5 px-2 rounded transition-colors text-center">
            Ver Detalhes
          </button>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold py-1.5 px-2 rounded transition-colors text-center inline-flex items-center justify-center gap-1">
            Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            onOpenDetails(item);
          };
        }
      });

      marker.on('click', () => {
        onSelectEstablishment(item.id);
      });

      markersGroup.addLayer(marker);
      bounds.extend([item.latitude, item.longitude]);
    });

    // Auto fit bounds if establishments exist and not picking
    if (establishments.length > 0 && !pickedCoordinates && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [establishments, selectedId]);

  // Handle Heatmap and Regional Density Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const heatmapGroup = heatmapLayerRef.current;
    if (!map || !heatmapGroup) return;

    heatmapGroup.clearLayers();

    if (!showHeatmap || establishments.length === 0) return;

    // 1. Add radiant heat circles around each establishment
    establishments.forEach((item) => {
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return;
      if (isNaN(item.latitude) || isNaN(item.longitude)) return;

      const circle = L.circle([item.latitude, item.longitude], {
        radius: 18000,
        color: '#d32f2f',
        weight: 1,
        opacity: 0.2,
        fillColor: '#fbc02d',
        fillOpacity: 0.25,
      });
      heatmapGroup.addLayer(circle);

      const coreCircle = L.circle([item.latitude, item.longitude], {
        radius: 8000,
        color: '#b71c1c',
        weight: 0.5,
        opacity: 0.3,
        fillColor: '#d32f2f',
        fillOpacity: 0.35,
      });
      heatmapGroup.addLayer(coreCircle);
    });

    // 2. Compute and add regional density clusters
    const regionCounts: { [key: string]: { count: number; latSum: number; lngSum: number; city: string; state: string } } = {};
    establishments.forEach((item) => {
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return;
      const key = `${item.city}-${item.state}`;
      if (!regionCounts[key]) {
        regionCounts[key] = { count: 0, latSum: 0, lngSum: 0, city: item.city, state: item.state };
      }
      regionCounts[key].count += 1;
      regionCounts[key].latSum += item.latitude;
      regionCounts[key].lngSum += item.longitude;
    });

    Object.values(regionCounts).forEach((region) => {
      const avgLat = region.latSum / region.count;
      const avgLng = region.lngSum / region.count;

      const size = Math.min(Math.max(44 + region.count * 6, 52), 76);
      const html = `
        <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
          <span style="position:absolute;width:100%;height:100%;border-radius:50%;background:#d32f2f;opacity:0.3;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
          <div style="position:relative;background:linear-gradient(135deg, #d32f2f, #b71c1c);color:#ffffff;width:${size - 10}px;height:${size - 10}px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(211,47,47,0.5);border:2.5px solid #ffffff;font-family:sans-serif;text-align:center;padding:2px;">
            <span style="font-size:13px;font-weight:800;line-height:1;color:#ffffff;">${region.count}</span>
            <span style="font-size:9px;font-weight:600;opacity:0.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${size - 14}px;">${region.city}</span>
          </div>
        </div>
      `;
      const densityIcon = L.divIcon({
        html,
        className: 'density-cluster-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      });

      const densityMarker = L.marker([avgLat, avgLng], { icon: densityIcon, zIndexOffset: 900 });
      densityMarker.bindPopup(`
        <div style="padding: 10px; font-size: 13px; text-align: center;">
          <strong style="color: #d32f2f; font-size: 14px;">Concentração Regional</strong><br/>
          <div style="margin: 4px 0 6px; font-weight: 600; color: #1c1917;">${region.city} - ${region.state}</div>
          <span style="background: #fef2f2; color: #b71c1c; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700;">
            ${region.count} ${region.count === 1 ? 'estabelecimento cadastrado' : 'estabelecimentos cadastrados'}
          </span>
        </div>
      `);
      heatmapGroup.addLayer(densityMarker);
    });
  }, [showHeatmap, establishments]);

  // Handle selected establishment pan
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const current = establishments.find((e) => e.id === selectedId);
    if (current && !isNaN(current.latitude) && !isNaN(current.longitude)) {
      map.setView([current.latitude, current.longitude], 15, { animate: true });
    }
  }, [selectedId, establishments]);

  // Recarregar Mapa (explicit requirement)
  const handleReloadMap = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize();
    setMapNotice('Mapa recarregado e renderizado com sucesso.');
    setTimeout(() => setMapNotice(null), 2500);
  };

  // Minha Localização (Geolocalização e auto-centralização)
  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      setMapNotice('Geolocalização não é suportada pelo seu navegador.');
      setTimeout(() => setMapNotice(null), 3000);
      return;
    }

    setIsLocating(true);
    setMapNotice('Obtendo sinal GPS para centralizar...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;

        // Animação suave para centralizar o mapa na posição atual do usuário
        map.flyTo([latitude, longitude], 15, {
          animate: true,
          duration: 1.2,
        });

        // Limpar marcadores anteriores do usuário se houver
        if (userLocationMarkerRef.current) {
          map.removeLayer(userLocationMarkerRef.current);
          userLocationMarkerRef.current = null;
        }
        if (userLocationCircleRef.current) {
          map.removeLayer(userLocationCircleRef.current);
          userLocationCircleRef.current = null;
        }

        // Adicionar círculo com raio de precisão
        const circle = L.circle([latitude, longitude], {
          radius: Math.max(accuracy || 80, 40),
          color: '#d32f2f',
          weight: 1.5,
          fillColor: '#fbc02d',
          fillOpacity: 0.18,
        }).addTo(map);

        // Adicionar marcador pulsante
        const userMarker = L.marker([latitude, longitude], {
          icon: createUserLocationIcon(),
          zIndexOffset: 1200,
        }).addTo(map);

        userMarker
          .bindPopup(`
            <div style="padding: 6px; font-size: 12px; text-align: center; min-width: 140px;">
              <strong style="color: #d32f2f; font-size: 13px;">📍 Você está aqui</strong>
              <div style="color: #666; font-size: 11px; margin-top: 3px;">
                Precisão: ~${Math.round(accuracy || 50)} metros
              </div>
            </div>
          `)
          .openPopup();

        userLocationMarkerRef.current = userMarker;
        userLocationCircleRef.current = circle;

        setMapNotice('Mapa centralizado na sua localização atual!');
        setTimeout(() => setMapNotice(null), 3000);
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = 'Não foi possível obter sua localização.';
        if (err.code === 1) {
          errorMsg = 'Permissão de localização negada pelo navegador.';
        } else if (err.code === 2) {
          errorMsg = 'Sinal de localização geográfica indisponível.';
        } else if (err.code === 3) {
          errorMsg = 'Tempo limite de busca de localização esgotado.';
        }
        setMapNotice(errorMsg);
        setTimeout(() => setMapNotice(null), 3500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Ajustar para todos os pontos
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (establishments.length > 0) {
      const bounds = L.latLngBounds(
        establishments.map((e) => [e.latitude, e.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        return;
      }
    }
    // Default to Brazil
    map.setView([-14.235, -51.925], 4);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-rose-200/80 shadow-2xs bg-neutral-50">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Modern Minimalist Map Controls (Top Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-rose-200/70 shadow-xs">
        <button
          onClick={handleReloadMap}
          title="Recarregar e redimensionar mapa"
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

      {/* Novo Botão de Geolocalização no Canto Inferior */}
      <div className="absolute bottom-5 left-4 z-[1000]">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Centralizar o mapa na minha localização atual"
          aria-label="Centralizar na minha localização atual"
          className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-white/95 hover:bg-white active:bg-rose-50 text-neutral-800 hover:text-[#d32f2f] rounded-full shadow-md hover:shadow-lg border border-rose-200/80 transition-all font-medium text-xs backdrop-blur-md cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              isLocating
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-50 text-[#d32f2f] group-hover:bg-[#d32f2f] group-hover:text-white'
            }`}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="font-semibold tracking-tight text-neutral-800 group-hover:text-[#d32f2f] pr-1">
            {isLocating ? 'Buscando sinal GPS...' : 'Minha Localização'}
          </span>
        </button>
      </div>

      {/* Map Status Notice */}
      {mapNotice && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] bg-neutral-900/90 text-white text-xs px-3.5 py-2 rounded-full shadow-lg border border-neutral-700 backdrop-blur-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fbc02d] animate-ping" />
          <span>{mapNotice}</span>
        </div>
      )}

      {/* Interactive Pin Drop Helper Banner (when in picking mode) */}
      {interactiveSelectMode && (
        <div className="absolute top-3 right-3 z-[1000] bg-[#fbc02d] text-neutral-900 px-3 py-2 rounded-lg shadow-lg border border-amber-400 flex items-center gap-2 text-xs font-bold animate-pulse">
          <MapPin className="w-4 h-4 text-[#d32f2f]" />
          <span>Clique no mapa para marcar o ponto exato</span>
        </div>
      )}
    </div>
  );
};
