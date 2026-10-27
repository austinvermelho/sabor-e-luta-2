export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export const searchAddressCoordinates = async (query: string): Promise<GeocodeResult[]> => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const cleanQuery = query.trim();

  // Primary Free Provider: Photon by Komoot (OpenStreetMap search server)
  try {
    const encoded = encodeURIComponent(cleanQuery);
    // Lat/Lon center bias near Brazil (-14.2350, -51.9253)
    const url = `https://photon.komoot.io/api/?q=${encoded}&lat=-14.2350&lon=-51.9253&lang=pt&limit=5`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const results: GeocodeResult[] = data.features.map((feature: {
          geometry: { coordinates: [number, number] };
          properties: {
            name?: string;
            street?: string;
            housenumber?: string;
            city?: string;
            town?: string;
            village?: string;
            district?: string;
            state?: string;
            country?: string;
          };
        }) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties;

          const parts: string[] = [];
          if (props.name) parts.push(props.name);
          if (props.street && props.street !== props.name) {
            parts.push(props.housenumber ? `${props.street}, ${props.housenumber}` : props.street);
          }
          const city = props.city || props.town || props.village || props.district;
          if (city) parts.push(city);
          if (props.state) parts.push(props.state);
          if (props.country) parts.push(props.country);

          return {
            latitude: lat,
            longitude: lng,
            displayName: parts.length > 0 ? parts.join(', ') : cleanQuery,
          };
        });

        if (results.length > 0) {
          return results;
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar Photon Geocoding API:', err);
  }

  // Secondary Free Provider: OpenStreetMap Nominatim
  try {
    const encoded = encodeURIComponent(cleanQuery.includes('Brasil') ? cleanQuery : `${cleanQuery}, Brasil`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=5&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: { lat: string; lon: string; display_name: string }) => ({
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
        }));
      }
    }
  } catch (error) {
    console.warn('Falha no geocoding Nominatim:', error);
  }

  return [];
};

