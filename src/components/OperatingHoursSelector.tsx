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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">Horário de Funcionamento</label>
      {DAYS.map((day) => (
        <div key={day} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value[day].isOpen}
            onChange={(e) => updateDay(day, { isOpen: e.target.checked })}
          />
          <span className="w-20 text-sm">{DAY_LABELS[day]}</span>
          <input
            type="time"
            value={value[day].open}
            disabled={!value[day].isOpen}
            onChange={(e) => updateDay(day, { open: e.target.value })}
            className="border rounded px-2 py-1 text-sm disabled:bg-neutral-100"
          />
          <span className="text-sm">até</span>
          <input
            type="time"
            value={value[day].close}
            disabled={!value[day].isOpen}
            onChange={(e) => updateDay(day, { close: e.target.value })}
            className="border rounded px-2 py-1 text-sm disabled:bg-neutral-100"
          />
        </div>
      ))}
    </div>
  );
};
