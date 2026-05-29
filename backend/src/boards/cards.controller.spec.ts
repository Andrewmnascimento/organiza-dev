import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CardsController } from './cards.controller';
import type { CardsService } from './cards.service';
import type { FastifyRequest } from 'fastify';

const mockCardsService = {
  findOne: vi.fn(),
  create: vi.fn(),
  reorder: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CardsController', () => {
  let controller: CardsController;

  beforeEach(() => {
    Object.values(mockCardsService).forEach((mockFn) => mockFn.mockReset());
    controller = new CardsController(
      mockCardsService as unknown as CardsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne should forward id and user id to service', () => {
    const card = { id: 'card-1' };
    mockCardsService.findOne.mockReturnValue(card);

    const result = controller.findOne(
      { user: { id: 'user-id' } } as FastifyRequest,
      'card-1',
    );

    expect(mockCardsService.findOne).toHaveBeenCalledWith('card-1', 'user-id');
    expect(result).toEqual(card);
  });

  it('create should forward dto, columnId and user id to service', async () => {
    const dto = { title: 'Card' };
    mockCardsService.create.mockResolvedValue({ id: 'card-1' });

    const result = await controller.create(
      { user: { id: 'user-id' } } as FastifyRequest,
      dto,
      'col-1',
    );

    expect(mockCardsService.create).toHaveBeenCalledWith(
      dto,
      'col-1',
      'user-id',
    );
    expect(result).toEqual({ id: 'card-1' });
  });

  it('reorder should forward dto, columnId and user id to service', async () => {
    const dto = { cards: [{ id: 'card-1', order: 1 }] };
    mockCardsService.reorder.mockResolvedValue(undefined);

    const result = await controller.reorder(
      dto,
      { user: { id: 'user-id' } } as FastifyRequest,
      'col-1',
    );

    expect(mockCardsService.reorder).toHaveBeenCalledWith(
      dto,
      'col-1',
      'user-id',
    );
    expect(result).toBeUndefined();
  });

  it('update should forward id, dto and user id to service', async () => {
    const dto = { title: 'Updated' };
    mockCardsService.update.mockResolvedValue({ id: 'card-1' });

    const result = await controller.update(
      { user: { id: 'user-id' } } as FastifyRequest,
      'card-1',
      dto,
    );

    expect(mockCardsService.update).toHaveBeenCalledWith(
      'card-1',
      dto,
      'user-id',
    );
    expect(result).toEqual({ id: 'card-1' });
  });

  it('remove should forward id and user id to service', async () => {
    mockCardsService.remove.mockResolvedValue({ id: 'card-1' });

    const result = await controller.remove(
      { user: { id: 'user-id' } } as FastifyRequest,
      'card-1',
    );

    expect(mockCardsService.remove).toHaveBeenCalledWith('card-1', 'user-id');
    expect(result).toEqual({ id: 'card-1' });
  });
});
