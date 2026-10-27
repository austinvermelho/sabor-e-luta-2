import { Establishment, AdSenseConfig, ProjectSupportConfig } from '../types';

const STORAGE_KEY = 'sabor_luta_estabelecimentos';
const ADSENSE_KEY = 'sabor_luta_adsense_config';
const PROJECT_PIX_KEY = 'sabor_luta_project_pix';

export const DEFAULT_PROJECT_SUPPORT: ProjectSupportConfig = {
  pixKey: 'contato@ordinario.bar',
  pixType: 'email',
  recipientName: 'Sabor & Luta — Mapeamento Independente',
  description: 'O apoio via Pix financia diretamente os custos de servidores, software livre e catalogação colaborativa do Sabor & Luta. Nenhum valor vai para os estabelecimentos comerciais.',
};

export const getProjectSupportConfig = (): ProjectSupportConfig => {
  try {
    const raw = localStorage.getItem(PROJECT_PIX_KEY);
    if (!raw) return DEFAULT_PROJECT_SUPPORT;
    return { ...DEFAULT_PROJECT_SUPPORT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROJECT_SUPPORT;
  }
};

const ADMIN_PIN_KEY = 'sabor_luta_admin_pin';

export const getAdminPin = (): string => {
  try {
    return localStorage.getItem(ADMIN_PIN_KEY) || 'sabor2026';
  } catch {
    return 'sabor2026';
  }
};

export const setAdminPin = (newPin: string): void => {
  try {
    localStorage.setItem(ADMIN_PIN_KEY, newPin);
  } catch (error) {
    console.error('Erro ao salvar PIN de admin:', error);
  }
};

export const saveProjectSupportConfig = (config: ProjectSupportConfig): void => {
  try {
    localStorage.setItem(PROJECT_PIX_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Erro ao salvar configuração de apoio do projeto:', error);
  }
};

// Internal local storage helpers
const getEstablishmentsLocally = (): Establishment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: any) => ({
      ...e,
      latitude: typeof e.latitude === 'number' ? e.latitude : parseFloat(e.latitude) || 0,
      longitude: typeof e.longitude === 'number' ? e.longitude : parseFloat(e.longitude) || 0,
      status: e.status === 'pending' ? 'pending' : 'approved',
    }));
  } catch (error) {
    console.error('Erro ao ler estabelecimentos do localStorage:', error);
    return [];
  }
};

const saveEstablishmentsLocally = (items: Establishment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

// Synchronous fallback read
export const getEstablishments = (): Establishment[] => {
  return getEstablishmentsLocally();
};

export const saveEstablishments = (items: Establishment[]): void => {
  saveEstablishmentsLocally(items);
  // Also sync bulk items to API if server is active
  fetch('/api/establishments/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  }).catch(() => {});
};

export const clearLocalCacheAndReload = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Erro ao limpar cache local:', err);
  }
  window.location.href = window.location.origin + '?v=' + Date.now();
};

// Async fetch from central API server (for multi-device / multi-user persistence)
export const fetchEstablishmentsAsync = async (): Promise<Establishment[]> => {
  try {
    const res = await fetch(`/api/establishments?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length > 0) {
          saveEstablishmentsLocally(data);
          return data;
        } else {
          // If server database is empty, seed defaults and sync
          saveEstablishmentsLocally(SUGGESTED_EXAMPLES);
          await fetch('/api/establishments/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(SUGGESTED_EXAMPLES),
          }).catch(() => {});
          return SUGGESTED_EXAMPLES;
        }
      }
    }
  } catch (err) {
    console.warn('API central de estabelecimentos indisponível, usando armazenamento local:', err);
  }
  
  // Fallback to local storage or suggested examples if completely empty
  const local = getEstablishmentsLocally();
  if (local.length === 0) {
    saveEstablishmentsLocally(SUGGESTED_EXAMPLES);
    return SUGGESTED_EXAMPLES;
  }
  return local;
};

// Async API persistence sync
export const syncEstablishmentToAPI = async (item: Establishment): Promise<Establishment[] | null> => {
  try {
    const res = await fetch('/api/establishments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const result = await res.json();
      if (result && Array.isArray(result.items)) {
        saveEstablishmentsLocally(result.items);
        return result.items;
      }
    }
  } catch (err) {
    console.warn('Não foi possível sincronizar com o servidor central:', err);
  }
  return null;
};

export const deleteEstablishmentFromAPI = async (id: string): Promise<Establishment[] | null> => {
  try {
    const res = await fetch(`/api/establishments/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const result = await res.json();
      if (result && Array.isArray(result.items)) {
        saveEstablishmentsLocally(result.items);
        return result.items;
      }
    }
  } catch (err) {
    console.warn('Não foi possível remover no servidor central:', err);
  }
  return null;
};

export const addEstablishment = (item: Establishment): Establishment[] => {
  const current = getEstablishmentsLocally();
  const updated = [item, ...current.filter((e) => e.id !== item.id)];
  saveEstablishmentsLocally(updated);
  syncEstablishmentToAPI(item);
  return updated;
};

export const updateEstablishment = (item: Establishment): Establishment[] => {
  const current = getEstablishmentsLocally();
  const updated = current.map((e) => (e.id === item.id ? item : e));
  saveEstablishmentsLocally(updated);
  syncEstablishmentToAPI(item);
  return updated;
};

export const approveEstablishment = (id: string): Establishment[] => {
  const current = getEstablishmentsLocally();
  const target = current.find((e) => e.id === id);
  const updatedItem = target ? { ...target, status: 'approved' as const } : null;
  const updated = current.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e));
  saveEstablishmentsLocally(updated);
  if (updatedItem) {
    syncEstablishmentToAPI(updatedItem);
  }
  return updated;
};

export const rejectEstablishment = (id: string): Establishment[] => {
  const current = getEstablishmentsLocally();
  const updated = current.filter((e) => e.id !== id);
  saveEstablishmentsLocally(updated);
  deleteEstablishmentFromAPI(id);
  return updated;
};

export const deleteEstablishment = (id: string): Establishment[] => {
  const current = getEstablishmentsLocally();
  const updated = current.filter((e) => e.id !== id);
  saveEstablishmentsLocally(updated);
  deleteEstablishmentFromAPI(id);
  return updated;
};

// Exportação e Importação de base de dados
export const exportCatalogJSON = (items: Establishment[]): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `sabor_e_luta_catalogo_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importCatalogJSON = (jsonString: string): Establishment[] => {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('O arquivo não contém uma lista válida de estabelecimentos.');
  }
  const formatted = parsed.map((e: any) => ({
    ...e,
    status: e.status || 'approved',
  }));
  saveEstablishments(formatted);
  return formatted;
};

// Configurações do Google AdSense
export const getAdSenseConfig = (): AdSenseConfig => {
  try {
    const raw = localStorage.getItem(ADSENSE_KEY);
    if (!raw) {
      return {
        enabled: false,
        clientId: '',
        slotIdTop: '',
        slotIdSidebar: ''
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      enabled: false,
      clientId: '',
      slotIdTop: '',
      slotIdSidebar: ''
    };
  }
};

export const saveAdSenseConfig = (config: AdSenseConfig): void => {
  try {
    localStorage.setItem(ADSENSE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Erro ao salvar AdSense config:', error);
  }
};

// Exemplos autênticos sugeridos
export const SUGGESTED_EXAMPLES: Establishment[] = [
  {
    id: 'ex-armazem-campo-sp',
    name: 'Armazém do Campo SP',
    category: 'agroecologia',
    tags: ['Reforma Agrária', 'Agroecologia', 'Café & Almoço', 'Debate Político'],
    city: 'São Paulo',
    state: 'SP',
    address: 'Alameda Eduardo Prado, 499 - Campos Elíseos',
    latitude: -23.5303,
    longitude: -46.6502,
    description: 'Espaço de comercialização direta da produção de assentamentos e cooperativas da agricultura familiar camponesa e reforma agrária. Alimentos sem veneno, café orgânico e culinária popular.',
    operatingHours: 'Segunda a Sábado, das 9h às 19h',
    instagram: '@armazemdocampo.sp',
    status: 'approved',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'ex-al-janiah-sp',
    name: 'Al Janiah',
    category: 'cozinha_solidaria',
    tags: ['Culinária Palestina', 'Acolhimento Refugiados', 'Espaço Cultural', 'Luta Antifascista'],
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua Rui Barbosa, 269 - Bela Vista',
    latitude: -23.5594,
    longitude: -46.6481,
    description: 'Restaurante e centro cultural palestino gerido por refugiados e ativistas. Ponto de encontro dos movimentos sociais em São Paulo com culinária tradicional árabe, cervejas artesanais e debates.',
    operatingHours: 'Terça a Domingo, das 18h às 00h',
    instagram: '@aljaniah_sp',
    status: 'approved',
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'ex-ordinario-bar',
    name: 'Ordinário Bar & Café',
    category: 'bar_popular',
    tags: ['Cerveja Artesanal', 'Espaço Antifascista', 'Cultura & Resistência', 'Pet Friendly'],
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua Marechal Deodoro, 555 - Centro',
    latitude: -25.4309,
    longitude: -49.2685,
    description: 'Boteco progressista, independente e acolhedor. Comida honesta, cervejas artesanais locais e ponto de encontro para quem defende a democracia e os direitos dos trabalhadores.',
    operatingHours: 'Terça a Domingo, das 17h às 23h30',
    instagram: '@ordinario.bar',
    status: 'approved',
    createdAt: '2026-02-01T10:00:00.000Z'
  }
];
