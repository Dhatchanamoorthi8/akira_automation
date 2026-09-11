/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          primary: "#0055A5",
          dark: "#0B1F33",
          secondary: "#1E6FB7",
          bg: "#F5F7F9",
          surface: "#FFFFFF",
          text: "#1B2530",
          muted: "#667085",
          accent: "#E6EEF6",
          border: "#E2E8F0",
          highlight: "#0284C7",
          hover: "#00478a",
          darkhover: "#142c44",
        },
        tolerance: {
          red: "#DC2626",
          amber: "#F59E0B",
          green: "#10B981",
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      maxWidth: {
        'site': '1380px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(11, 31, 51, 0.05), 0 1px 2px -1px rgba(11, 31, 51, 0.05)',
        'card': '0 4px 12px 0 rgba(11, 31, 51, 0.06), 0 2px 4px -2px rgba(11, 31, 51, 0.04)',
        'card-hover': '0 12px 24px -4px rgba(0, 85, 165, 0.12), 0 4px 6px -2px rgba(11, 31, 51, 0.05)',
        'elevated': '0 20px 25px -5px rgba(11, 31, 51, 0.1), 0 8px 10px -6px rgba(11, 31, 51, 0.1)',
      }
    },
  },
  plugins: [],
}
