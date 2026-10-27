import { CategoryType } from '../types';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  cooperativa: {
    id: 'cooperativa',
    label: 'Cooperativa / Autogestão',
    shortLabel: 'Cooperativa',
    icon: '🤝',
    description: 'Gestão democrática por trabalhadores, divisão equitativa e sem patrão.'
  },
  agroecologia: {
    id: 'agroecologia',
    label: 'Agroecologia & Reforma Agrária',
    shortLabel: 'Agroecologia',
    icon: '🌱',
    description: 'Produtos de assentamentos, agricultura familiar camponesa e sem agrotóxicos.'
  },
  livraria_cultural: {
    id: 'livraria_cultural',
    label: 'Livraria / Espaço Cultural',
    shortLabel: 'Espaço Cultural',
    icon: '📚',
    description: 'Debate político, lançamentos, rodas de conversa e literatura crítica.'
  },
  cozinha_solidaria: {
    id: 'cozinha_solidaria',
    label: 'Cozinha Solidária / Comunitária',
    shortLabel: 'Cozinha Solidária',
    icon: '🍲',
    description: 'Segurança alimentar, refeições populares e acolhimento comunitário.'
  },
  bar_popular: {
    id: 'bar_popular',
    label: 'Bar Popular & Resistência',
    shortLabel: 'Bar Popular',
    icon: '🍻',
    description: 'Boteco raiz, preço justo, reduto de conversas progressistas e antifascistas.'
  },
  cervejaria_artesanal: {
    id: 'cervejaria_artesanal',
    label: 'Cervejaria Independente',
    shortLabel: 'Cervejaria Artesanal',
    icon: '🍺',
    description: 'Produção local, independente de grandes monopólios cervejeiros.'
  },
  cafe_resistencia: {
    id: 'cafe_resistencia',
    label: 'Café & Ponto de Encontro',
    shortLabel: 'Café Progressista',
    icon: '☕',
    description: 'Cafés agroecológicos, acolhimento e trocas de ideias.'
  },
  vegano_acessivel: {
    id: 'vegano_acessivel',
    label: 'Culinária Vegana Acessível',
    shortLabel: 'Vegano Popular',
    icon: '🥗',
    description: 'Alimentação vegetal consciente sem gourmetização e com preço acessível.'
  }
};

export const POPULAR_TAGS = [
  'Autogestão / Cooperativa',
  'Reforma Agrária / MST',
  'Espaço LGBTQIA+ Acolhedor',
  'Ingredientes Agroecológicos',
  'Roda de Samba & Cultura',
  'Preço Popular & Solidário',
  'Trabalho Decente',
  'Acolhimento a Refugiados',
  'Pet Friendly',
  'Café Orgânico',
  'Cerveja Local'
];
