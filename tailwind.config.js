export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        surface: "#111827",
        primary: "#38BDF8",
        success: "#22C55E",
        warning: "#FACC15",
        error: "#EF4444",
        textPrimary: "#FFFFFF",
        textSecondary: "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
