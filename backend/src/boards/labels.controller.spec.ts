import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LabelsController } from './labels.controller';
import type { LabelsService } from './labels.service';
import type { FastifyRequest } from 'fastify';

const mockLabelsService = {
  create: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  linkToCard: vi.fn(),
  unlinkFromCard: vi.fn(),
};

describe('LabelsController', () => {
  let controller: LabelsController;

  beforeEach(() => {
    Object.values(mockLabelsService).forEach((mockFn) => mockFn.mockReset());
    controller = new LabelsController(
      mockLabelsService as unknown as LabelsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should forward boardId, body and user id to service', async () => {
    const dto = { name: 'Label', color: '#fff' };
    mockLabelsService.create.mockResolvedValue({ id: 'label-1' });

    const result = await controller.create('board-1', dto, {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockLabelsService.create).toHaveBeenCalledWith(
      'board-1',
      dto,
      'user-id',
    );
    expect(result).toEqual({ id: 'label-1' });
  });

  it('findOne should forward labelId and user id to service', () => {
    const label = { id: 'label-1' };
    mockLabelsService.findOne.mockReturnValue(label);

    const result = controller.findOne('label-1', {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockLabelsService.findOne).toHaveBeenCalledWith(
      'label-1',
      'user-id',
    );
    expect(result).toEqual(label);
  });

  it('update should forward labelId, dto and user id to service', async () => {
    const dto = { name: 'Updated' };
    mockLabelsService.update.mockResolvedValue({ id: 'label-1' });

    const result = await controller.update('label-1', dto, {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockLabelsService.update).toHaveBeenCalledWith(
      'label-1',
      dto,
      'user-id',
    );
    expect(result).toEqual({ id: 'label-1' });
  });

  it('remove should forward labelId and user id to service', async () => {
    mockLabelsService.remove.mockResolvedValue({ id: 'label-1' });

    const result = await controller.remove('label-1', {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockLabelsService.remove).toHaveBeenCalledWith('label-1', 'user-id');
    expect(result).toEqual({ id: 'label-1' });
  });

  it('linkToCard should forward cardId, labelId and user id to service', async () => {
    mockLabelsService.linkToCard.mockResolvedValue({ id: 'relation-1' });

    const result = await controller.linkToCard('card-1', 'label-1', {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockLabelsService.linkToCard).toHaveBeenCalledWith(
      'card-1',
      'label-1',
      'user-id',
    );
    expect(result).toEqual({ id: 'relation-1' });
  });

  it('unlinkFromCard should forward cardId, labelId and user id to service', async () => {
    mockLabelsService.unlinkFromCard.mockResolvedValue({ id: 'relation-1' });

    const result = await controller.unlinkFromCard('card-1', 'label-1', {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockLabelsService.unlinkFromCard).toHaveBeenCalledWith(
      'card-1',
      'label-1',
      'user-id',
    );
    expect(result).toEqual({ id: 'relation-1' });
  });
});
