import { Socket } from 'socket.io';
import { RequestUser } from '../auth/interfaces/request.user.interface';

export type AuthenticatedSocket = Socket<any, any, any, { user: RequestUser }>;
