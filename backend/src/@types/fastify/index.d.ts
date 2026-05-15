import { RequestUser } from '../../auth/interfaces/request.user.interface';
import { Boards } from '../../generated/prisma/browser';
import 'fasify';

declare module 'fastify' {
  interface FastifyRequest {
    user: RequestUser;
    board?: Boards;
    userRole?: string;
  }
}
