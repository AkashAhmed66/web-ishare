// Theme colors and styles for the application

export const COLORS = {
  primary: '#2563EB', // Blue 600
  primaryDark: '#1D4ED8', // Blue 700
  secondary: '#8B5CF6', // Violet 500
  accent: '#F59E0B', // Amber 500
  success: '#10B981', // Emerald 500
  danger: '#EF4444', // Red 500
  warning: '#F59E0B', // Amber 500
  info: '#3B82F6', // Blue 500
  background: '#F3F4F6', // Gray 100
  card: '#FFFFFF', // White
  white: '#FFFFFF', // White
  error: '#EF4444', // Red 500 (alias for danger)
  text: '#111827', // Gray 900
  textSecondary: '#6B7280', // Gray 500
  border: '#E5E7EB', // Gray 200
  notification: '#EF4444', // Red 500
  placeholder: '#9CA3AF', // Gray 400
};

export const FONTS = {
  regular: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '400',
  },
  medium: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '500',
  },
  bold: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '700',
  },
  light: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '300',
  },
};

export const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  md: '1.125rem',   // 18px
  lg: '1.25rem',    // 20px
  xl: '1.5rem',     // 24px
  '2xl': '1.75rem', // 28px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
};

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
};

export const SHADOWS = {
  small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

export const BREAKPOINTS = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1536px',
};

export const Z_INDEX = {
  low: 10,
  medium: 50,
  high: 100,
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
};

// Predefined style presets for common UI components
export const STYLES = {
  container: {
    flex: '1',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    boxShadow: SHADOWS.medium,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    padding: `${SPACING.sm} ${SPACING.md}`,
    borderRadius: BORDER_RADIUS.default,
    fontWeight: FONTS.medium.fontWeight,
    cursor: 'pointer',
    border: 'none',
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    color: '#FFFFFF',
    padding: `${SPACING.sm} ${SPACING.md}`,
    borderRadius: BORDER_RADIUS.default,
    fontWeight: FONTS.medium.fontWeight,
    cursor: 'pointer',
    border: 'none',
  },
  input: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    border: `1px solid ${COLORS.border}`,
    fontSize: FONT_SIZES.base,
    width: '100%',
  },
  heading: {
    fontWeight: FONTS.bold.fontWeight,
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.md,
  },
}; 