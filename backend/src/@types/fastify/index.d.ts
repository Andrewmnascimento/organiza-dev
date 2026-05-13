import { User } from '@supabase/supabase-js';
import 'fasify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}