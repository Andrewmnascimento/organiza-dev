import * as z from 'zod';

const schema = z.object({
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  DATABASE_URL: z.string(),
});

export const rootConfig = {
  // Use a custom validate function because Nest's ConfigModule expects
  // a Joi-style schema with a `.validate` method when using
  // `validationSchema`. Zod schemas don't have `.validate`, so provide
  // a `validate` function that parses and returns the validated config.
  validate: (config: Record<string, unknown>) => {
    const result = schema.safeParse(config);
    if (!result.success) {
      // Throw a clear error so Nest boot will fail with the validation issues
      throw new Error(
        `Configuration validation error: ${result.error.message}`,
      );
    }
    return result.data;
  },
};
