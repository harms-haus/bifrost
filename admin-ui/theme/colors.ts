// Muted rainbow color palette for Bifrost UI
// ROYGBV without indigo

export const mutedRainbow = {
  red: {
    main: '#d95b43',
    light: '#e8a87c',
    dark: '#b53f2a'
  },
  orange: {
    main: '#d77a61',
    light: '#f0b692',
    dark: '#b86a52'
  },
  yellow: {
    main: '#e8c547',
    light: '#f5e6b3',
    dark: '#c9ab3e'
  },
  green: {
    main: '#99b898',
    light: '#c5e1a5',
    dark: '#7d9c7f'
  },
  blue: {
    main: '#7fc3ec',
    light: '#b3e0f2',
    dark: '#5d9fc5'
  },
  violet: {
    main: '#b5b9d5',
    light: '#d5d6e7',
    dark: '#9598b1'
  },
  neutral: {
    gray: '#6b7280',
    darkGray: '#374151',
    lightGray: '#f8fafc'
  }
};

// Page type to color mapping
export const pageColorMap = {
  runes: 'red',
  rune: 'red',
  'rune/new': 'red',
  realms: 'orange',
  realm: 'orange',
  accounts: 'yellow',
  account: 'yellow',
  sagas: 'green',
  saga: 'green',
  // Default to blue for other pages
  default: 'blue'
};