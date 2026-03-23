/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        p: {
            50: '#f0f8ff',
            100: '#dff0ff',
            200: '#b9e2fe',
            300: '#7bcdfe',
            400: '#47bbfc',
            500: '#0a9bed',
            600: '#007acb',
            700: '#0062a4',
            800: '#055387',
            900: '#0a4670',
            950: '#072c4a',
        },

        n: {
          50: "hsl(210, 14%, 98%)", // #F7F8F9
          100: "hsl(210, 20%, 93%)", // #E7EAEE
          200: "hsl(210, 22%, 85%)", // #D0D5DD
          500: "hsl(217, 20%, 58%)", // #64748B
          600: "hsl(217, 18%, 54%)", // #4B5768
          700: "hsl(217, 17%, 40%)", // #323A46
          800: "hsl(220, 14%, 12%)", // #191D23
        },

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

        success: "hsl(120, 85%, 60%)",
        warning: "hsl(60, 85%, 60%)",
        error: "hsl(0, 85%, 60%)",

        "success-content": "hsl(120, 69%, 8%)",
        "warning-content": "hsl(60, 69%, 8%)",
        "error-content": "hsl(0, 0%, 100%)"

      },
    },
  },
  plugins: [],
};
