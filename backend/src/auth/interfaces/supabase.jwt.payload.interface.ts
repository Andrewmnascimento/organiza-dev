import { UserAppMetadata, UserMetadata } from '@supabase/supabase-js';
import { JWTPayload } from 'jose';

export interface SupabaseJwtPayload extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  phone?: string;

  app_metadata?: UserAppMetadata;
  user_metadata?: UserMetadata;
}
