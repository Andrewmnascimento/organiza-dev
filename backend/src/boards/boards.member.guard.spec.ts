import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BoardsMemberGuard } from './boards.member.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('boardsGuard', () => {
  let moduleRef: TestingModule;
  let guard: BoardsMemberGuard;
  const mockFindUnique = vi.fn();
  const mockPrisma = {
    userOnBoards: { findUnique: mockFindUnique },
  } as unknown as PrismaService;

  beforeEach(async () => {
    mockFindUnique.mockReset();

    moduleRef = await Test.createTestingModule({
      providers: [
        BoardsMemberGuard,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = moduleRef.get<BoardsMemberGuard>(BoardsMemberGuard);
  });

  it('happy path: should allow when user is linked to the boards', async () => {
    mockFindUnique.mockResolvedValue({ userId: 'user-id' });

    const request = {
      user: { id: 'user-id' },
      params: { boardId: 'boards-id' },
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        userId_boardId: {
          userId: 'user-id',
          boardId: 'boards-id',
        },
      },
      select: {
        userId: true,
      },
    });
    expect(result).toBe(true);
  });

  it('no user on request: should throw UnauthorizedException', async () => {
    const request = { params: { boardId: 'boards-id' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('user not linked to boards: should throw ForbiddenException', async () => {
    mockFindUnique.mockResolvedValue(null);

    const request = {
      user: { id: 'user-id' },
      params: { boardId: 'boards-id' },
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
