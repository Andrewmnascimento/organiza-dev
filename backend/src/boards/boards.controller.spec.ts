import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardsController } from './boards.controller';
import type { BoardsService } from './boards.service';

const mockBoardsService = {
  create: vi.fn(),
  findAllByUser: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('BoardsController', () => {
  let controller: BoardsController;

  beforeEach(() => {
    Object.values(mockBoardsService).forEach((mockFn) => mockFn.mockReset());
    controller = new BoardsController(
      mockBoardsService as unknown as BoardsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should forward user id and dto to service', () => {
    const dto = { name: 'My board' };
    mockBoardsService.create.mockReturnValue(dto);

    const result = controller.create(
      {
        user: {
          id: 'user-id'
        }
      }
      dto,
    );

    expect(mockBoardsService.create).toHaveBeenCalledWith('user-id', dto);
    expect(result).toBe(dto);
  });

  it('findAll should forward user id to service', () => {
    mockBoardsService.findAllByUser.mockReturnValue([]);

    const result = controller.findAll({ user: { id: 'user-id' } } as never);

    expect(mockBoardsService.findAllByUser).toHaveBeenCalledWith('user-id');
    expect(result).toEqual([]);
  });

  it('findOne should forward board id to service', () => {
    mockBoardsService.findOne.mockReturnValue({});

    const result = controller.findOne('board-id');

    expect(mockBoardsService.findOne).toHaveBeenCalledWith('board-id');
    expect(result).toEqual({});
  });
});
