import React from 'react';
import { DaySchedule, OperatingHours } from '../types';

interface OperatingHoursSelectorProps {
  value: OperatingHours;
  onChange: (value: OperatingHours) => void;
}

const DAYS: (keyof OperatingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<keyof OperatingHours, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const OperatingHoursSelector: React.FC<OperatingHoursSelectorProps> = ({ value, onChange }) => {
  const updateDay = (day: keyof OperatingHours, updates: Partial<DaySchedule>) => {
    onChange({ ...value, [day]: { ...value[day], ...updates } });
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold text-[#141210]">Horário de Funcionamento Semanal</label>
      <div className="space-y-1.5">
        {DAYS.map((day) => (
          <div key={day} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg border border-[#e4dcce] bg-[#fbf8f3]">
            <label className="flex items-center gap-2 cursor-pointer shrink-0 min-w-[110px]">
              <input
                type="checkbox"
                checked={value[day].isOpen}
                onChange={(e) => updateDay(day, { isOpen: e.target.checked })}
                className="w-4 h-4 rounded text-[#b91c1c] focus:ring-[#b91c1c] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#141210]">{DAY_LABELS[day]}</span>
            </label>

            {value[day].isOpen ? (
              <div className="flex items-center gap-1.5 text-xs text-[#57534e]">
                <input
                  type="time"
                  value={value[day].open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  className="px-2 py-1 bg-white border border-[#e4dcce] rounded text-xs text-[#141210] focus:ring-1 focus:ring-[#b91c1c] focus:outline-none font-mono"
                />
                <span className="text-[11px] font-medium text-stone-500">até</span>
                <input
                  type="time"
                  value={value[day].close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  className="px-2 py-1 bg-white border border-[#e4dcce] rounded text-xs text-[#141210] focus:ring-1 focus:ring-[#b91c1c] focus:outline-none font-mono"
                />
              </div>
            ) : (
              <span className="text-[11px] font-medium text-stone-400 italic pr-1">Fechado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
