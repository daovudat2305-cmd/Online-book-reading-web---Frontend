/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(215, 71%, 58%)",
        "primary-content": "hsl(0, 0%, 100%)",
        "primary-dark": "hsl(215, 71%, 48%)",
        "primary-light": "hsl(215, 71%, 68%)",

        secondary: "hsl(275, 71%, 58%)",
        "secondary-content": "hsl(0, 0%, 100%)",
        "secondary-dark": "hsl(275, 71%, 48%)",
        "secondary-light": "hsl(275, 71%, 68%)",

        background: "hsl(216, 16%, 94%)",
        foreground: "hsl(240, 14%, 99%)",
        border: "hsl(218, 17%, 88%)",

        copy: "hsl(217, 17%, 15%)",
        "copy-light": "hsl(215, 18%, 40%)",
        "copy-lighter": "hsl(215, 17%, 55%)",

        success: "hsl(120, 71%, 58%)",
        warning: "hsl(60, 71%, 58%)",
        error: "hsl(0, 71%, 58%)",

        "success-content": "hsl(120, 69%, 8%)",
        "warning-content": "hsl(60, 69%, 8%)",
        "error-content": "hsl(0, 0%, 100%)"
      },
    },
  },
  plugins: [],
};
