import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('BoardsService', () => {
  let service: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsService],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
