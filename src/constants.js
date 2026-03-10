export const TOTAL_PHASES = 10;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const PHASES = [
  { num: 1, desc: '2 Drillinge' },
  { num: 2, desc: '1 Drilling + 1 Vierer-Sequenz' },
  { num: 3, desc: '1 Vierling + 1 Vierer-Sequenz' },
  { num: 4, desc: '1 Siebener-Sequenz' },
  { num: 5, desc: '1 Achter-Sequenz' },
  { num: 6, desc: '1 Neuner-Sequenz' },
  { num: 7, desc: '2 Vierlinge' },
  { num: 8, desc: '7 Karten einer Farbe' },
  { num: 9, desc: '1 Fünfling + 1 Pärchen' },
  { num: 10, desc: '1 Fünfling + 1 Drilling' },
];

// Each color has Tailwind classes for bg, text, border, badge, and gradient
export const PLAYER_COLORS = [
  {
    bg: 'bg-red-600',
    text: 'text-red-400',
    border: 'border-red-600',
    badge: 'bg-red-600 text-white',
    gradient: 'from-red-950/60 to-transparent',
  },
  {
    bg: 'bg-blue-600',
    text: 'text-blue-400',
    border: 'border-blue-600',
    badge: 'bg-blue-600 text-white',
    gradient: 'from-blue-950/60 to-transparent',
  },
  {
    bg: 'bg-green-600',
    text: 'text-green-400',
    border: 'border-green-600',
    badge: 'bg-green-600 text-white',
    gradient: 'from-green-950/60 to-transparent',
  },
  {
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
    badge: 'bg-yellow-500 text-black',
    gradient: 'from-yellow-950/60 to-transparent',
  },
  {
    bg: 'bg-purple-600',
    text: 'text-purple-400',
    border: 'border-purple-600',
    badge: 'bg-purple-600 text-white',
    gradient: 'from-purple-950/60 to-transparent',
  },
  {
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-500',
    badge: 'bg-orange-500 text-white',
    gradient: 'from-orange-950/60 to-transparent',
  },
];
