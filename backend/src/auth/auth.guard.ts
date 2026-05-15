import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { FastifyRequest } from 'fastify';
import { RequestUser } from './interfaces/request.user.interface';
import { SupabaseJwtPayload } from './interfaces/supabase.jwt.payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabaseUrl = process.env.SUPABASE_URL as string;
  private JWKS = createRemoteJWKSet(
    new URL(`${this.supabaseUrl}/auth/v1/.well-known/jwks.json`),
  );
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Unauthorized');

    const { payload } = await jwtVerify(token, this.JWKS, {
      issuer: `${this.supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });

    request.user = {
      ...(payload as SupabaseJwtPayload),
      id: payload.sub as string,
    } satisfies RequestUser;
    return true;
  }
}
