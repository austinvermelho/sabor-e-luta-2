import { OperatingHours } from '../types';

export const DAY_KEYS: (keyof OperatingHours)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_PT: Record<keyof OperatingHours, string> = {
  monday: 'SEG',
  tuesday: 'TER',
  wednesday: 'QUA',
  thursday: 'QUI',
  friday: 'SEX',
  saturday: 'SÁB',
  sunday: 'DOM',
};

/**
 * Formats time string like "18:00" to "18h" or "18:30" to "18h30"
 */
export function formatTimePT(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (!h) return timeStr;
  const hourNum = parseInt(h, 10);
  const formattedHour = hourNum < 10 ? `0${hourNum}` : `${hourNum}`;
  if (!m || m === '00') {
    return `${formattedHour}h`;
  }
  return `${formattedHour}h${m}`;
}

/**
 * Formats OperatingHours object into Portuguese abbreviated format like:
 * "SEG a SÁB 11h-23h" or "SÁB 18h-00h · DOM 12h-18h"
 */
export function formatOperatingHoursPT(hours?: OperatingHours): string {
  if (!hours) return 'Horário sob consulta';

  const openDays = DAY_KEYS.filter((day) => hours[day]?.isOpen);
  if (openDays.length === 0) return 'Horário sob consulta';

  const schedules: { days: (keyof OperatingHours)[]; open: string; close: string }[] = [];

  DAY_KEYS.forEach((day) => {
    const sched = hours[day];
    if (!sched || !sched.isOpen) return;

    const formattedOpen = formatTimePT(sched.open);
    const formattedClose = formatTimePT(sched.close);

    const last = schedules[schedules.length - 1];
    if (last && last.open === formattedOpen && last.close === formattedClose) {
      last.days.push(day);
    } else {
      schedules.push({ days: [day], open: formattedOpen, close: formattedClose });
    }
  });

  if (schedules.length === 0) return 'Horário sob consulta';

  return schedules
    .map((s) => {
      let dayRange = '';
      if (s.days.length === 1) {
        dayRange = DAY_PT[s.days[0]];
      } else if (s.days.length === 7) {
        dayRange = 'Todos os dias';
      } else {
        const indices = s.days.map((d) => DAY_KEYS.indexOf(d));
        const isConsecutive = indices.every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);

        if (isConsecutive && s.days.length > 2) {
          dayRange = `${DAY_PT[s.days[0]]} a ${DAY_PT[s.days[s.days.length - 1]]}`;
        } else {
          dayRange = s.days.map((d) => DAY_PT[d]).join(', ');
        }
      }
      return `${dayRange} ${s.open}-${s.close}`;
    })
    .join(' · ');
}

/**
 * Calculates current real-time status: "Aberto agora", "Fechado agora", or "Horário sob consulta"
 */
export function getOpeningStatusPT(hours?: OperatingHours) {
  if (!hours) {
    return {
      isOpen: false,
      label: 'Horário sob consulta',
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
    };
  }

  const openDays = DAY_KEYS.filter((day) => hours[day]?.isOpen);
  if (openDays.length === 0) {
    return {
      isOpen: false,
      label: 'Horário sob consulta',
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
    };
  }

  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const dayKeyMap: (keyof OperatingHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const todayKey = dayKeyMap[jsDay];
  const todaySched = hours[todayKey];

  if (!todaySched || !todaySched.isOpen) {
    return {
      isOpen: false,
      label: 'Fechado agora',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (todaySched.open || '00:00').split(':').map(Number);
  const [closeH, closeM] = (todaySched.close || '00:00').split(':').map(Number);

  const openMinutes = (openH || 0) * 60 + (openM || 0);
  let closeMinutes = (closeH || 0) * 60 + (closeM || 0);

  let isCurrentlyOpen = false;

  if (closeMinutes <= openMinutes) {
    // Spans past midnight, e.g., 18:00 to 02:00
    isCurrentlyOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  } else {
    // Standard hours e.g. 11:00 to 23:00
    isCurrentlyOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  if (isCurrentlyOpen) {
    return {
      isOpen: true,
      label: 'Aberto agora',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  return {
    isOpen: false,
    label: 'Fechado agora',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  };
}

/**
 * Formats ISO date string to Brazilian PT-BR date and time (e.g., "28/10/2026 às 10:55")
 */
export function formatDatePT(dateStr?: string): string {
  if (!dateStr) return 'Data não informada';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

