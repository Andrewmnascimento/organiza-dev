import { UserAppMetadata, UserMetadata } from '@supabase/supabase-js';

export interface RequestUser {
  id: string;
  email?: string;
  role?: string;
  phone?: string;

  app_metadata?: UserAppMetadata;
  user_metadata?: UserMetadata;
}
