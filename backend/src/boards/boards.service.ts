import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
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
    const boards = await this.prisma.board.findUnique({
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
    return this.prisma.board.update({
      where: { id: boardsId },
      data: dto,
    });
  }

  remove(boardsId: string) {
    return this.prisma.board.delete({
      where: { id: boardsId },
    });
  }
}
