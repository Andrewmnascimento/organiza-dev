import { RequestUser } from '../../auth/interfaces/request.user.interface';
import 'fasify';

declare module 'fastify' {
  interface FastifyRequest {
    user: RequestUser;
  }
}
