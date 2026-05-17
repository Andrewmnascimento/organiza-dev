import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { SupabaseJwtPayload } from './interfaces/supabase.jwt.payload.interface';
import { RequestUser } from './interfaces/request.user.interface';
import { AuthenticatedSocket } from '../@types/authenticated.socket';

@Injectable()
export class AuthWSGuard implements CanActivate {
  private supabaseUrl = process.env.SUPABASE_URL as string;
  private JWKS = createRemoteJWKSet(
    new URL(`${this.supabaseUrl}/auth/v1/.well-known/jwks.json`),
  );
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = client.handshake.auth?.token as string;

    if (!token) throw new UnauthorizedException('Unauthorized');

    const { payload } = await jwtVerify(token, this.JWKS, {
      issuer: `${this.supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });

    client.data.user = {
      ...(payload as SupabaseJwtPayload),
      id: payload.sub as string,
    } satisfies RequestUser;

    return true;
  }
}
