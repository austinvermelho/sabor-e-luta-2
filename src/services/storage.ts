import { Establishment, AdSenseConfig, ProjectSupportConfig } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'sabor_luta_estabelecimentos';
const ADSENSE_KEY = 'sabor_luta_adsense_config';
const PROJECT_PIX_KEY = 'sabor_luta_project_pix';

// ... (Keep existing config helpers using localStorage)
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

// Firestore Helpers
const ESTABLISHMENTS_COL = collection(db, 'establishments');

export const fetchEstablishmentsAsync = async (): Promise<Establishment[]> => {
  try {
    const snapshot = await getDocs(ESTABLISHMENTS_COL);
    return snapshot.docs.map(doc => doc.data() as Establishment);
  } catch (err) {
    console.error('Erro ao buscar do Firestore:', err);
    return [];
  }
};

export const syncEstablishmentToAPI = async (item: Establishment): Promise<Establishment[] | null> => {
  try {
    await setDoc(doc(ESTABLISHMENTS_COL, item.id), item);
    return await fetchEstablishmentsAsync();
  } catch (err) {
    console.error('Erro ao salvar no Firestore:', err);
    return null;
  }
};

export const deleteEstablishmentFromAPI = async (id: string): Promise<Establishment[] | null> => {
  try {
    await deleteDoc(doc(ESTABLISHMENTS_COL, id));
    return await fetchEstablishmentsAsync();
  } catch (err) {
    console.error('Erro ao deletar no Firestore:', err);
    return null;
  }
};

export const saveEstablishmentAsync = async (item: Establishment, isEdit: boolean): Promise<Establishment[]> => {
  await syncEstablishmentToAPI(item);
  return await fetchEstablishmentsAsync() || [];
};

export const approveEstablishmentAsync = async (id: string): Promise<Establishment[]> => {
  // We need to fetch it first to approve it, or pass the object
  // Simplify: update status in firestore
  const items = await fetchEstablishmentsAsync();
  const target = items.find(i => i.id === id);
  if (target) {
    await syncEstablishmentToAPI({ ...target, status: 'approved' });
  }
  return await fetchEstablishmentsAsync() || [];
};

export const rejectEstablishmentAsync = async (id: string): Promise<Establishment[]> => {
  await deleteEstablishmentFromAPI(id);
  return await fetchEstablishmentsAsync() || [];
};

export const deleteEstablishmentAsync = async (id: string): Promise<Establishment[]> => {
  await deleteEstablishmentFromAPI(id);
  return await fetchEstablishmentsAsync() || [];
};

// Placeholder for remaining local storage functions for now
export const getEstablishments = (): Establishment[] => [];
export const saveEstablishments = (items: Establishment[]): void => {};
export const clearLocalCacheAndReload = (): void => { window.location.reload(); };

// ... (Keep existing AdSense config and SUGGESTED_EXAMPLES)
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
