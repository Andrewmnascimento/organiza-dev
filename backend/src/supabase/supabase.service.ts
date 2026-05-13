import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvVars } from '../env.interface';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  readonly auth: SupabaseClient['auth'];

  constructor(private config: ConfigService<EnvVars, true>) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL', {
      infer: true,
    });
    const supabaseKey = this.config.get<string>('SUPABASE_SERVICE_KEY', {
      infer: true,
    });

    if (!supabaseKey || !supabaseUrl) {
      throw new Error('Supabase env vars not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.client = createClient(supabaseUrl, supabaseKey);
    this.auth = this.client.auth;
  }

}
