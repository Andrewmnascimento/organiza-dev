import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return void', async () => {
    expect(await service.onModuleInit()).toBe(await service.$connect());
  });
});
