import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IngredientsService } from './ingredients.service';

describe('IngredientsService', () => {
  const findMany = jest.fn();
  const findUnique = jest.fn();
  const update = jest.fn();
  const prisma = {
    ingredient: { findMany, findUnique, update },
  } as unknown as PrismaService;
  const service = new IngredientsService(prisma);

  beforeEach(() => {
    findMany.mockReset();
    findUnique.mockReset();
    update.mockReset();
  });

  it('lists ingredients by name with only inventory fields', async () => {
    findMany.mockResolvedValue([]);

    await service.findAll();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, unit: true, stock: true },
    });
  });

  it('increments the stock for an existing ingredient', async () => {
    findUnique.mockResolvedValue({ id: 3 });
    update.mockResolvedValue({ id: 3, name: 'Cà phê', unit: 'g', stock: 120 });

    await expect(service.restock(3, 20)).resolves.toMatchObject({ stock: 120 });
    expect(update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { stock: { increment: 20 } },
      select: { id: true, name: true, unit: true, stock: true },
    });
  });

  it('returns not found without updating a missing ingredient', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.restock(99, 20)).rejects.toThrow(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });
});
