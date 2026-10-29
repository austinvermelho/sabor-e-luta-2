// Lista de termos, ofensas, termos discriminatórios e padrões suspeitos
const PROHIBITED_WORDS = [
  'palavrao1',
  'palavrao2',
  'ofensa1',
  'arrombado',
  'arrombada',
  'babaca',
  'bosta',
  'caralho',
  'foder',
  'foda-se',
  'fodase',
  'filho da puta',
  'fdp',
  'merda',
  'otario',
  'otaria',
  'puta',
  'puto',
  'vagabundo',
  'vagabunda',
  'viado',
  'viadinho',
  'sapatão',
  'nazista',
  'fascista lixo',
  'genocida',
  'racista'
];

/**
 * Verifica se um texto contém palavras ou expressões impróprias/ofensivas.
 */
export const containsInappropriateContent = (text?: string): boolean => {
  if (!text) return false;
  // Normaliza removendo acentos e pontuações para análise
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return PROHIBITED_WORDS.some((word) => {
    const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    return regex.test(normalized) || normalized.includes(normalizedWord);
  });
};

/**
 * Validação preliminar para fotos enviadas (tamanho, formato suspeito, etc.)
 */
export const isPhotoSuspicious = (photoUrls?: string[]): boolean => {
  if (!photoUrls || photoUrls.length === 0) return false;
  for (const url of photoUrls) {
    if (!url.startsWith('data:image/') && !url.startsWith('http://') && !url.startsWith('https://')) {
      return true;
    }
  }
  return false;
};
