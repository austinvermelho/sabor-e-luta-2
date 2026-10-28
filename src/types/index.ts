export type CategoryType = 
  | 'cooperativa'
  | 'agroecologia'
  | 'livraria_cultural'
  | 'cozinha_solidaria'
  | 'bar_popular'
  | 'cervejaria_artesanal'
  | 'cafe_resistencia'
  | 'vegano_acessivel';

export interface Establishment {
  id: string;
  name: string;
  category: CategoryType;
  tags: string[];
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  instagram?: string;
  whatsapp?: string;
  website?: string;
  imageUrl?: string;
  suggestedCategory?: string;
  suggestedTags?: string[];
  history?: string;
  operatingHours?: OperatingHours;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface AdPartner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl?: string;
  linkUrl: string;
  callToAction: string;
}

export interface AdSenseConfig {
  enabled: boolean;
  clientId: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
  slotIdTop: string;
  slotIdSidebar: string;
}

export interface ProjectSupportConfig {
  pixKey: string;
  pixType: 'email' | 'cpf' | 'cnpj' | 'phone' | 'random';
  recipientName: string;
  description: string;
}

export type VolunteerSkill =
  | 'curadoria'
  | 'design'
  | 'dev'
  | 'agroecologia'
  | 'comunicacao'
  | 'mapeamento'
  | 'eventos'
  | 'traducao';

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  skills: VolunteerSkill[];
  availability: string;
  message?: string;
  status: 'pending' | 'contacted' | 'archived';
  createdAt: string;
}

