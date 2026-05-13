import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Unauthorized');

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) throw new UnauthorizedException('Unauthorized');

    request.user = data.user;
    return true;
  }
}
