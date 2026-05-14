import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';

type BoardsRequest = FastifyRequest & {
  user?: { id: string };
  params: { boardId: string };
};

@Injectable()
export class BoardsMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<BoardsRequest>();

    if (!request.user) throw new UnauthorizedException('Unauthorized');

    const boardsUser = await this.prisma.userOnBoards.findUnique({
      where: {
        userId_boardId: {
          userId: request.user.id,
          boardId: request.params.boardId,
        },
      },
      select: {
        userId: true,
      },
    });

    if (!boardsUser) throw new ForbiddenException('Unauthorized');

    return true;
  }
}
