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

// Ler todos os estabelecimentos do localStorage (garantindo status válido)
export const getEstablishments = (): Establishment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: any) => ({
      ...e,
      status: e.status || 'approved',
    }));
  } catch (error) {
    console.error('Erro ao ler estabelecimentos do localStorage:', error);
    return [];
  }
};

export const saveEstablishments = (items: Establishment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

export const addEstablishment = (item: Establishment): Establishment[] => {
  const current = getEstablishments();
  const updated = [item, ...current];
  saveEstablishments(updated);
  return updated;
};

export const updateEstablishment = (item: Establishment): Establishment[] => {
  const current = getEstablishments();
  const updated = current.map((e) => (e.id === item.id ? item : e));
  saveEstablishments(updated);
  return updated;
};

export const approveEstablishment = (id: string): Establishment[] => {
  const current = getEstablishments();
  const updated = current.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e));
  saveEstablishments(updated);
  return updated;
};

export const rejectEstablishment = (id: string): Establishment[] => {
  const current = getEstablishments();
  const updated = current.filter((e) => e.id !== id);
  saveEstablishments(updated);
  return updated;
};

export const deleteEstablishment = (id: string): Establishment[] => {
  const current = getEstablishments();
  const updated = current.filter((e) => e.id !== id);
  saveEstablishments(updated);
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

// Exemplos autênticos sugeridos (Aprovados por padrão caso carregados manualmente)
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
    instagram: '@armazemdocampo.sp',
    status: 'approved',
    createdAt: new Date().toISOString()
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
    instagram: '@aljaniah_sp',
    status: 'approved',
    createdAt: new Date().toISOString()
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
    instagram: '@ordinario.bar',
    status: 'approved',
    createdAt: new Date().toISOString()
  }
];
