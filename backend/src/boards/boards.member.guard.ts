import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';

type BoardIdRequest = FastifyRequest & {
  params: {
    boardId: string;
  };
};

@Injectable()
export class BoardsMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: BoardIdRequest = context
      .switchToHttp()
      .getRequest<BoardIdRequest>();

    if (!request.user) throw new UnauthorizedException('Unauthorized');

    const membership = await this.prisma.userOnBoards.findUnique({
      where: {
        userId_boardId: {
          userId: request.user.id,
          boardId: request.params.boardId,
        },
      },
      include: { board: true },
    });

    if (!membership) throw new ForbiddenException('Forbidden');

    request.board = membership.board;
    request.userRole = membership.role;

    return true;
  }
}
