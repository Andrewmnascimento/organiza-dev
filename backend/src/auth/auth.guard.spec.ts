import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from '../supabase/supabase.service';
import type { FastifyRequest } from 'fastify';

type TestRequest = FastifyRequest & { user?: { id: string; email?: string } };

describe('AuthGuard', () => {
  let moduleRef: TestingModule;
  let guard: AuthGuard;
  const mockGetUser = vi.fn();
  const mockSupabase = {
    auth: { getUser: mockGetUser },
  } as unknown as SupabaseService;

  beforeEach(async () => {
    mockGetUser.mockReset();

    moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: SupabaseService, useValue: mockSupabase },
      ],
    }).compile();

    guard = moduleRef.get<AuthGuard>(AuthGuard);
  });

  it('happy path: should allow request with valid token and attach user to request', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'me@example.com' } },
      error: null,
    });

    const request = {
      headers: { authorization: 'Bearer validtoken' },
    } as unknown as TestRequest;
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(mockGetUser).toHaveBeenCalledWith('validtoken');
    expect(result).toBe(true);
    expect(request.user).toEqual({ id: 'user-id', email: 'me@example.com' });
  });

  it('no token in request: should throw UnauthorizedException', async () => {
    const request = { headers: {} } as unknown as TestRequest;
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('service failure (returns error): should throw UnauthorizedException', async () => {
    mockGetUser.mockResolvedValue({ data: null, error: new Error('fail') });

    const request = {
      headers: { authorization: 'Bearer token' },
    } as unknown as TestRequest;
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('service failure (throws): should reject with error', async () => {
    mockGetUser.mockRejectedValue(new Error('network'));

    const request = {
      headers: { authorization: 'Bearer token' },
    } as unknown as TestRequest;
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(Error);
  });
});
