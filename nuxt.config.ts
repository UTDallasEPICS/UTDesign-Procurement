export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-04-23',
  typescript: {
    strict: true,
  },

  // Fix for Windows: Prisma uses absolute paths that break Node ESM loader
  nitro: {
    moduleSideEffects: ['@prisma/client', '.prisma/client'],
    externals: {
      inline: ['@prisma/client', '.prisma/client'],
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
