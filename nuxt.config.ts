export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['/assets/css/main.css'],
  compatibilityDate: '2025-04-23',
  fonts: {
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false,
    },
  },
  typescript: {
    strict: true,
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  // Fix for Windows: Prisma engine uses absolute C:\ paths that break ESM loader
  nitro: {
    externals: {
      external: ['@prisma/client', '.prisma/client'],
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['@prisma/client'],
    },
  },
  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    nodemailerEmail: process.env.NODEMAILER_EMAIL,
    nodemailerPassword: process.env.NODEMAILER_PASSWORD,
    microsoftClientId: process.env.MICROSOFT_CLIENT_ID,
    microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    microsoftTenantId: process.env.MICROSOFT_TENANT_ID,
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    },
  },
})
