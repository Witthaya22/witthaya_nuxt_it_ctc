/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      // {
      //   // ธีมที่เราสร้างเอง
      //   synthwave: [
      //   "light",
      //   "dark",

      //   ],
      // },
      "light",
    ],
  },
  theme: {
      daisyui: {
        theme:
          ["light", "dark", "cupcake","../frontend/assets/css/styles.css"],
      },
      container: {
        center: true,
      }
  },
}

