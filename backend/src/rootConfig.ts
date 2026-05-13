import * as z from 'zod';

export const rootConfig = {
  validationSchema: z.object({
    SUPABASE_URL: z.string(),
    SUPABASE_SERVICE_KEY: z.string(),
    DATABASE_URL: z.string(),
  }),
};
