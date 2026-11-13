import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    seed: 'tsx prisma/seed.ts',
  },

  datasource: {
    url: process.env.DATABASE_URL || "postgresql://brewlite:change_this_local_password@localhost:5433/brewlite?schema=public",
  },
});