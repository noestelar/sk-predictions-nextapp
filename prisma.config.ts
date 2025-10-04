import { defineConfig } from 'prisma'

export default defineConfig({
  seed: {
    run: 'node prisma/seed.js',
  },
})
