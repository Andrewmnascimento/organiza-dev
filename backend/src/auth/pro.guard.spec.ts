import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProGuard } from './pro.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('ProGuard', () => {
  let moduleRef: TestingModule;
  let guard: ProGuard;
  const mockFindUnique = vi.fn();
  const mockPrisma = {
    user: { findUnique: mockFindUnique },
  } as unknown as PrismaService;

  beforeEach(async () => {
    mockFindUnique.mockReset();

    moduleRef = await Test.createTestingModule({
      providers: [ProGuard, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    guard = moduleRef.get<ProGuard>(ProGuard);
  });

  it('happy path: should allow when user plan is pro', async () => {
    mockFindUnique.mockResolvedValue({ plan: 'pro' });

    const request = { user: { id: 'user-id' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      select: { plan: true },
    });
    expect(result).toBe(true);
  });

  it('no user on request: should throw UnauthorizedException', async () => {
    const request = {} as unknown as { user?: { id: string } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('service returns non-pro plan: should throw UnauthorizedException', async () => {
    mockFindUnique.mockResolvedValue({ plan: 'free' });

    const request = { user: { id: 'user-id' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('service failure (throws): should reject with error', async () => {
    mockFindUnique.mockRejectedValue(new Error('db error'));

    const request = { user: { id: 'user-id' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(Error);
  });
});
