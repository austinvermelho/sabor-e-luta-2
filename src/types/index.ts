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
  operatingHours?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
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
