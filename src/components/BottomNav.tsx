import React from 'react';
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Flame,
  Quote,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { ModuleTab } from '../types';

interface BottomNavProps {
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
}

const NAV_ITEMS: {
  id: ModuleTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'progress', label: 'Progress', icon: Flame },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'review', label: 'Review', icon: BarChart3 },
  { id: 'quotes', label: 'Quotes', icon: Quote },
  { id: 'mentor', label: 'Mentor', icon: ShieldAlert },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'settings', label: 'Setup', icon: SlidersHorizontal },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-800/90 pb-safe"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-7 h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors relative ${
                active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#e11d48] rounded-full"
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-[#e11d48]' : ''
                }`}
              />
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
