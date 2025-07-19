/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#007BFF",
          50: "#E6F3FF",
          100: "#CCE7FF",
          200: "#99CFFF",
          300: "#66B7FF",
          400: "#339FFF",
          500: "#007BFF",
          600: "#0066CC",
          700: "#004C99",
          800: "#003366",
          900: "#001A33",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#28A745",
          50: "#E8F5E8",
          100: "#D1EBD1",
          200: "#A3D7A3",
          300: "#75C375",
          400: "#47AF47",
          500: "#28A745",
          600: "#208637",
          700: "#186529",
          800: "#10441B",
          900: "#08220E",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC3545",
          50: "#FDF2F2",
          100: "#FCE8E8",
          200: "#F8D1D1",
          300: "#F4BABA",
          400: "#F0A3A3",
          500: "#DC3545",
          600: "#B02A37",
          700: "#841F29",
          800: "#58151B",
          900: "#2C0A0E",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8F9FA",
          foreground: "#495057",
        },
        accent: {
          DEFAULT: "#E9ECEF",
          foreground: "#495057",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic colors from BRD
        success: "#28A745",
        warning: "#FFC107",
        error: "#DC3545",
        // Neutral colors from BRD
        neutral: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
          400: "#ADB5BD",
          500: "#6C757D",
          600: "#495057",
          700: "#343A40",
          800: "#212529",
          900: "#000000",
        },
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      spacing: {
        // 4px base unit spacing system from BRD
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      fontSize: {
        // Typography system from BRD
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      fontFamily: {
        // Font families from BRD
        'heading': ['Montserrat', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // Shadow system from BRD
        'sm': '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        'md': '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}