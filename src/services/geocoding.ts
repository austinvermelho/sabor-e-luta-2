export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export const searchAddressCoordinates = async (query: string): Promise<GeocodeResult[]> => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=br&limit=5&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na busca de coordenadas: ${response.status}`);
    }

    const data = await response.json();
    return data.map((item: { lat: string; lon: string; display_name: string }) => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      displayName: item.display_name
    }));
  } catch (error) {
    console.warn('Falha no geocoding do Nominatim:', error);
    return [];
  }
};
