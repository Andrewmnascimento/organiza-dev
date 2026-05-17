import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private eventEmmiter: EventEmitter2,
  ) {}

  create(userId: string, dto: CreateBoardDto) {
    return this.prisma.boards.create({
      data: {
        name: dto.name,
        users: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.boards.findMany({
      where: {
        users: { some: { userId } },
      },
    });
  }

  async update(boardsId: string, dto: UpdateBoardDto) {
    const update = await this.prisma.boards.update({
      where: { id: boardsId },
      data: dto,
    });
    this.eventEmmiter.emit('board.updated', {
      boardId: boardsId,
      board: update,
    });
    return update;
  }

  async remove(boardId: string, userId: string) {
    // find the user's role on the board
    const membership = await this.prisma.userOnBoards.findUnique({
      where: { userId_boardId: { userId, boardId } },
    });

    if (!membership) throw new NotFoundException('Not Found');

    // If member -> simply remove the UserOnBoards relation
    if (membership.role === 'member') {
      await this.leaveBoard(userId, boardId);

      return { success: true, action: 'left' };
    }

    // If owner -> try to find the oldest member (by assignedAt) excluding the owner
    const oldestMember = await this.prisma.userOnBoards.findFirst({
      where: { boardId, role: 'member' },
      orderBy: { assignedAt: 'asc' },
    });

    if (oldestMember) {
      // promote oldest member to owner and delete the current owner in a single transaction
      await this.promoteToOwner(oldestMember.userId, boardId);
      await this.leaveBoard(userId, boardId);

      return { success: true, action: 'promoted' };
    }

    // No other members found -> delete the board (cascades will remove related rows)
    await this.prisma.boards.delete({ where: { id: boardId } });

    return { success: true, action: 'deleted' };
  }

  private async leaveBoard(userId: string, boardId: string) {
    return this.prisma.userOnBoards.delete({
      where: { userId_boardId: { userId, boardId } },
    });
  }

  private async promoteToOwner(userId: string, boardId: string) {
    return this.prisma.userOnBoards.update({
      where: {
        userId_boardId: { userId, boardId },
      },
      data: { role: 'owner' },
    });
  }
}
