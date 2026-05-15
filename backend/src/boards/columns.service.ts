import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  private async assertCanManageColumn(columnId: string, userId: string) {
    const column = await this.prisma.columns.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });

    if (!column) throw new NotFoundException('column not found');

    const membership = await this.prisma.userOnBoards.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId: column.boardId,
        },
      },
      select: { userId: true },
    });

    if (!membership) throw new ForbiddenException('Unauthorized');
  }

  async update(columnId: string, dto: UpdateColumnDto, userId: string) {
    await this.assertCanManageColumn(columnId, userId);

    return this.prisma.columns.update({
      where: { id: columnId },
      data: {
        name: dto.name,
      },
    });
  }

  async remove(columnId: string, userId: string) {
    await this.assertCanManageColumn(columnId, userId);

    return this.prisma.columns.delete({
      where: { id: columnId },
    });
  }
}
