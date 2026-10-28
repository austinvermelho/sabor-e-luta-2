export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  precisionType: 'exact_street' | 'approximate';
}

export const searchAddressCoordinates = async (query: string): Promise<GeocodeResult[]> => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const cleanQuery = query.trim();

  // Primary Free Provider: Photon by Komoot (OpenStreetMap search server with Brazil bias)
  try {
    const encoded = encodeURIComponent(cleanQuery.includes('Brasil') ? cleanQuery : `${cleanQuery}, Brasil`);
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
            osm_type?: string;
            osm_key?: string;
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

          const isStreetLevel = Boolean(props.street || props.housenumber || props.osm_key === 'building' || props.osm_key === 'amenity');

          return {
            latitude: lat,
            longitude: lng,
            displayName: parts.length > 0 ? parts.join(', ') : cleanQuery,
            precisionType: isStreetLevel ? 'exact_street' : 'approximate',
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

  // Secondary Free Provider: OpenStreetMap Nominatim with address details
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
        return data.map((item: { 
          lat: string; 
          lon: string; 
          display_name: string;
          address?: { road?: string; house_number?: string; suburb?: string };
        }) => {
          const isStreet = Boolean(item.address?.road || item.address?.house_number);
          return {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            displayName: item.display_name,
            precisionType: isStreet ? 'exact_street' : 'approximate',
          };
        });
      }
    }
  } catch (error) {
    console.warn('Falha no geocoding Nominatim:', error);
  }

  return [];
};
