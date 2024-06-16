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
  theme: {
      daisyui: {
        theme: [
          "light",
        ]
      },
      container: {
        center: true,
      }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "light", 
    ],
  },
}

