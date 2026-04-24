import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        utd: {
          orange: '#E87722',
          'orange-dark': '#C75B12',
          green: '#154734',
        },
      },
    },
  },
} satisfies Config
