import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { AuthenticatedSocket } from '../@types/authenticated.socket';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { AuthWSGuard } from '../auth/auth.ws.guard';
import { RequestUser } from '../auth/interfaces/request.user.interface';
import { SupabaseJwtPayload } from '../auth/interfaces/supabase.jwt.payload.interface';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Boards, Cards, Columns, Labels } from '../generated/prisma/browser';

@WebSocketGateway({
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})
@UseGuards(AuthWSGuard)
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private prisma: PrismaService) {}

  private supabaseUrl = process.env.SUPABASE_URL as string;
  private JWKS = createRemoteJWKSet(
    new URL(`${this.supabaseUrl}/auth/v1/.well-known/jwks.json`),
  );

  @WebSocketServer()
  server: Server;

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake?.auth.token as string;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const { payload } = await jwtVerify(token, this.JWKS, {
        issuer: `${this.supabaseUrl}/auth/v1`,
        audience: 'authenticated',
      });

      client.data.user = {
        ...(payload as SupabaseJwtPayload),
        id: payload.sub as string,
      } satisfies RequestUser;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() boardId: string,
  ) {
    const membership = await this.prisma.userOnBoards.findUnique({
      where: {
        userId_boardId: {
          userId: client.data.user.id,
          boardId,
        },
      },
      select: { userId: true },
    });

    if (!membership) throw new ForbiddenException('Forbidden');

    await client.join(boardId);
  }

  @OnEvent('board.updated')
  handleBoardUpdated(payload: {
    boardId: string;
    board: Boards;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('board:updated', { data: payload.board, userId: payload.userId });
  }

  @OnEvent('card.created')
  handleCardCreated(payload: { boardId: string; card: Cards; userId: string }) {
    this.server
      .to(payload.boardId)
      .emit('card:created', { data: payload.card, userId: payload.userId });
  }

  @OnEvent('card.updated')
  handleCardUpdated(payload: { boardId: string; card: Cards; userId: string }) {
    this.server
      .to(payload.boardId)
      .emit('card:updated', { data: payload.card, userId: payload.userId });
  }

  @OnEvent('card.deleted')
  handleCardDeleted(payload: { boardId: string; card: Cards; userId: string }) {
    this.server
      .to(payload.boardId)
      .emit('card:deleted', { data: payload.card, userId: payload.userId });
  }

  @OnEvent('column.created')
  handleColumnCreated(payload: {
    boardId: string;
    column: Columns;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('column:created', { data: payload.column, userId: payload.userId });
  }

  @OnEvent('column.updated')
  handleColumnUpdated(payload: {
    boardId: string;
    column: Columns;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('column:updated', { data: payload.column, userId: payload.userId });
  }

  @OnEvent('column.deleted')
  handleColumnDeleted(payload: {
    boardId: string;
    column: Columns;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('column:deleted', { data: payload.column, userId: payload.userId });
  }

  @OnEvent('label.created')
  handleLabelCreated(payload: {
    boardId: string;
    label: Labels;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('label:created', { data: payload.label, userId: payload.userId });
  }

  @OnEvent('label.updated')
  handleLabelUpdated(payload: {
    boardId: string;
    label: Labels;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('label:updated', { data: payload.label, userId: payload.userId });
  }

  @OnEvent('label.deleted')
  handleLabelDeleted(payload: {
    boardId: string;
    label: Labels;
    userId: string;
  }) {
    this.server
      .to(payload.boardId)
      .emit('label:deleted', { data: payload.label, userId: payload.userId });
  }

  @OnEvent('label.linked')
  handleLabelLinked(payload: {
    boardId: string;
    card: Cards;
    label: Labels;
    userId: string;
  }) {
    this.server.to(payload.boardId).emit('label:linked', {
      data: {
        card: payload.card,
        label: payload.label,
      },
      userId: payload.userId,
    });
  }

  @OnEvent('label.unlinked')
  handleLabelUnlinked(payload: {
    boardId: string;
    card: Cards;
    label: Labels;
    userId: string;
  }) {
    this.server.to(payload.boardId).emit('label:unlinked', {
      data: {
        card: payload.card,
        label: payload.label,
      },
      userId: payload.userId,
    });
  }
}
