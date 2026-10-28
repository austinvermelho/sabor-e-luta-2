import { Establishment, AdSenseConfig, ProjectSupportConfig, Volunteer } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'sabor_luta_estabelecimentos';
const ADSENSE_KEY = 'sabor_luta_adsense_config';
const PROJECT_PIX_KEY = 'sabor_luta_project_pix';

// Firestore Collections
const ESTABLISHMENTS_COL = collection(db, 'establishments');
const VOLUNTEERS_COL = collection(db, 'volunteers');
const MOCK_EXAMPLE_IDS = ['ex-armazem-campo-sp', 'ex-al-janiah-sp', 'ex-ordinario-bar'];


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
    const stored = localStorage.getItem(ADMIN_PIN_KEY);
    if (!stored || stored === 'sabor2026' || stored === 'luta2026' || stored === 'saboreluta' || stored === 'sabor&luta') {
      localStorage.setItem(ADMIN_PIN_KEY, 'ordinario8054');
      return 'ordinario8054';
    }
    return stored;
  } catch {
    return 'ordinario8054';
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

export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore).filter((item) => item !== undefined && item !== null);
  }
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        res[key] = sanitizeForFirestore(value);
      }
    }
    return res;
  }
  return obj;
};

export const fetchEstablishmentsAsync = async (): Promise<Establishment[]> => {
  const itemsMap = new Map<string, Establishment>();
  let firestoreFailed = false;

  try {
    const snapshot = await getDocs(ESTABLISHMENTS_COL);
    for (const docSnap of snapshot.docs) {
      if (MOCK_EXAMPLE_IDS.includes(docSnap.id) || docSnap.id.startsWith('ex-')) {
        deleteDoc(docSnap.ref).catch(() => {});
      } else {
        const data = docSnap.data() as Establishment;
        if (data && data.id) {
          itemsMap.set(data.id, data);
        }
      }
    }
  } catch (err) {
    console.error('Erro ao buscar do Firestore:', err);
    firestoreFailed = true;
  }

  // Also query server fallback to ensure no submissions are lost
  try {
    const res = await fetch('/api/establishments');
    if (res.ok) {
      const serverItems = await res.json();
      if (Array.isArray(serverItems)) {
        for (const sItem of serverItems) {
          if (sItem && sItem.id && !MOCK_EXAMPLE_IDS.includes(sItem.id) && !sItem.id.startsWith('ex-')) {
            if (!itemsMap.has(sItem.id)) {
              itemsMap.set(sItem.id, sItem);
              // Backfill into Firestore if Firestore is accessible
              if (!firestoreFailed) {
                setDoc(doc(ESTABLISHMENTS_COL, sItem.id), sanitizeForFirestore(sItem)).catch(() => {});
              }
            }
          }
        }
      }
    }
  } catch (serverErr) {
    // Silent catch for server fallback
  }

  return Array.from(itemsMap.values());
};

export const syncEstablishmentToAPI = async (item: Establishment): Promise<Establishment[]> => {
  const sanitized = sanitizeForFirestore(item);

  // 1. Write to Firestore
  try {
    await setDoc(doc(ESTABLISHMENTS_COL, item.id), sanitized);
  } catch (err) {
    console.error('Erro ao salvar no Firestore:', err);
  }

  // 2. Mirror to server endpoint
  try {
    await fetch('/api/establishments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
  } catch (serverErr) {
    console.error('Erro ao sincronizar com servidor Express:', serverErr);
  }

  return await fetchEstablishmentsAsync();
};

export const deleteEstablishmentFromAPI = async (id: string): Promise<Establishment[]> => {
  try {
    await deleteDoc(doc(ESTABLISHMENTS_COL, id));
  } catch (err) {
    console.error('Erro ao deletar no Firestore:', err);
  }

  try {
    await fetch(`/api/establishments/${id}`, { method: 'DELETE' });
  } catch (serverErr) {
    console.error('Erro ao deletar no servidor:', serverErr);
  }

  return await fetchEstablishmentsAsync();
};

export const saveEstablishmentAsync = async (item: Establishment, _isEdit: boolean): Promise<Establishment[]> => {
  return await syncEstablishmentToAPI(item);
};

export const approveEstablishmentAsync = async (id: string, updatedBy = 'Curadoria (ordinario8054)'): Promise<Establishment[]> => {
  const items = await fetchEstablishmentsAsync();
  const target = items.find((i) => i.id === id);
  if (target) {
    return await syncEstablishmentToAPI({
      ...target,
      status: 'approved',
      updatedAt: new Date().toISOString(),
      updatedBy,
    });
  }
  return items;
};

export const rejectEstablishmentAsync = async (id: string): Promise<Establishment[]> => {
  return await deleteEstablishmentFromAPI(id);
};

export const deleteEstablishmentAsync = async (id: string): Promise<Establishment[]> => {
  return await deleteEstablishmentFromAPI(id);
};

export const subscribeToEstablishments = (
  callback: (items: Establishment[]) => void
): (() => void) => {
  // Initial fetch
  fetchEstablishmentsAsync().then((items) => {
    if (items) callback(items);
  });

  try {
    const unsubscribe = onSnapshot(
      ESTABLISHMENTS_COL,
      (snapshot) => {
        const itemsMap = new Map<string, Establishment>();
        for (const docSnap of snapshot.docs) {
          if (!MOCK_EXAMPLE_IDS.includes(docSnap.id) && !docSnap.id.startsWith('ex-')) {
            const data = docSnap.data() as Establishment;
            if (data && data.id) {
              itemsMap.set(data.id, data);
            }
          }
        }
        callback(Array.from(itemsMap.values()));
      },
      (err) => {
        console.error('Erro no listener real-time do Firestore:', err);
        // Fallback: poll server if firestore listener encounters an issue
        fetchEstablishmentsAsync().then((items) => {
          if (items) callback(items);
        });
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Não foi possível iniciar onSnapshot:', err);
    return () => {};
  }
};

// Placeholder for remaining local storage functions for now
export const getEstablishments = (): Establishment[] => [];
export const saveEstablishments = (_items: Establishment[]): void => {};
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

export const SUGGESTED_EXAMPLES: Establishment[] = [];

// ==========================================
// VOLUNTEERS FIRESTORE & SERVER API SERVICES
// ==========================================

export const fetchVolunteersAsync = async (): Promise<Volunteer[]> => {
  const itemsMap = new Map<string, Volunteer>();
  let firestoreFailed = false;

  try {
    const snapshot = await getDocs(VOLUNTEERS_COL);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as Volunteer;
      if (data && data.id) {
        itemsMap.set(data.id, data);
      }
    }
  } catch (err) {
    console.error('Erro ao buscar voluntários do Firestore:', err);
    firestoreFailed = true;
  }

  // Also query Express server fallback
  try {
    const res = await fetch('/api/volunteers');
    if (res.ok) {
      const serverItems = await res.json();
      if (Array.isArray(serverItems)) {
        for (const vItem of serverItems) {
          if (vItem && vItem.id) {
            if (!itemsMap.has(vItem.id)) {
              itemsMap.set(vItem.id, vItem);
              if (!firestoreFailed) {
                setDoc(doc(VOLUNTEERS_COL, vItem.id), sanitizeForFirestore(vItem)).catch(() => {});
              }
            }
          }
        }
      }
    }
  } catch {
    // Silent catch
  }

  return Array.from(itemsMap.values());
};

export const saveVolunteerAsync = async (volunteer: Volunteer): Promise<Volunteer[]> => {
  const sanitized = sanitizeForFirestore(volunteer);

  // 1. Firestore write
  try {
    await setDoc(doc(VOLUNTEERS_COL, volunteer.id), sanitized);
  } catch (err) {
    console.error('Erro ao salvar voluntário no Firestore:', err);
  }

  // 2. Mirror server endpoint
  try {
    await fetch('/api/volunteers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
  } catch (serverErr) {
    console.error('Erro ao sincronizar voluntário no servidor Express:', serverErr);
  }

  return await fetchVolunteersAsync();
};

export const updateVolunteerStatusAsync = async (
  id: string,
  status: Volunteer['status']
): Promise<Volunteer[]> => {
  const items = await fetchVolunteersAsync();
  const target = items.find((v) => v.id === id);
  if (target) {
    const updated = { ...target, status };
    return await saveVolunteerAsync(updated);
  }
  return items;
};

export const deleteVolunteerAsync = async (id: string): Promise<Volunteer[]> => {
  try {
    await deleteDoc(doc(VOLUNTEERS_COL, id));
  } catch (err) {
    console.error('Erro ao deletar voluntário do Firestore:', err);
  }

  try {
    await fetch(`/api/volunteers/${id}`, { method: 'DELETE' });
  } catch {
    // Silent catch
  }

  return await fetchVolunteersAsync();
};

export const subscribeToVolunteers = (
  callback: (volunteers: Volunteer[]) => void
): (() => void) => {
  fetchVolunteersAsync().then((items) => {
    if (items) callback(items);
  });

  try {
    const unsubscribe = onSnapshot(
      VOLUNTEERS_COL,
      (snapshot) => {
        const itemsMap = new Map<string, Volunteer>();
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as Volunteer;
          if (data && data.id) {
            itemsMap.set(data.id, data);
          }
        }
        callback(Array.from(itemsMap.values()));
      },
      (err) => {
        console.error('Erro no listener real-time de voluntários:', err);
        fetchVolunteersAsync().then((items) => {
          if (items) callback(items);
        });
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
};

