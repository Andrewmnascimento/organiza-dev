import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.userOnBoards.findMany({
      where: { userId },
      include: {
        board: true,
      },
    });
  }

  async findOne(boardsId: string) {
    const boards = await this.prisma.boards.findUnique({
      where: { id: boardsId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!boards) throw new NotFoundException('boards not found');
    return boards;
  }

  update(boardsId: string, dto: UpdateBoardDto) {
    return this.prisma.boards.update({
      where: { id: boardsId },
      data: dto,
    });
  }

  async remove(boardsId: string, userId: string) {
    // find the user's role on the board
    const membership = await this.prisma.userOnBoards.findUnique({
      where: { userId_boardId: { userId: userId, boardId: boardsId } },
    });

    if (!membership) throw new NotFoundException('User not part of board');

    // If member -> simply remove the UserOnBoards relation
    if (membership.role === 'member') {
      await this.prisma.$transaction([
        this.prisma.userOnBoards.delete({
          where: { userId_boardId: { userId: userId, boardId: boardsId } },
        }),
      ]);

      return { success: true };
    }

    // If owner -> try to find the oldest member (by assignedAt) excluding the owner
    const oldestMember = await this.prisma.userOnBoards.findFirst({
      where: { boardId: boardsId, role: 'member' },
      orderBy: { assignedAt: 'asc' },
    });

    if (oldestMember) {
      // promote oldest member to owner and delete the current owner in a single transaction
      const result = await this.prisma.$transaction([
        this.prisma.userOnBoards.update({
          where: {
            userId_boardId: { userId: oldestMember.userId, boardId: boardsId },
          },
          data: { role: 'owner' },
        }),
        this.prisma.userOnBoards.delete({
          where: { userId_boardId: { userId: userId, boardId: boardsId } },
        }),
      ]);

      return result;
    }

    // No other members found -> delete the board (cascades will remove related rows)
    const deleted = await this.prisma.$transaction([
      this.prisma.boards.delete({ where: { id: boardsId } }),
    ]);

    return deleted[0];
  }
}
