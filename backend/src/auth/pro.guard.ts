import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class ProGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (!request.user) throw new UnauthorizedException('Unauthorized');

    const user = await this.prisma.users.findUnique({
      where: { id: request.user.id },
      select: { plan: true },
    });

    if (user?.plan !== 'pro') throw new ForbiddenException('Unauthorized');
    return true;
  }
}
