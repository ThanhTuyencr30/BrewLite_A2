import { SizeCode } from '../generated/prisma/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  it('creates an order using the user id mapped by JwtStrategy', async () => {
    const ordersService = {
      createOrder: jest.fn().mockResolvedValue({ id: 'order-1' }),
    };
    const controller = new OrdersController(
      ordersService as unknown as OrdersService,
    );
    const request = {
      user: { userId: 'user-1', email: 'user@example.com' },
    } as Parameters<typeof controller.createOrder>[0];
    const dto: CreateOrderDto = {
      items: [{ productId: 1, size: SizeCode.M, quantity: 1 }],
    };

    await controller.createOrder(request, dto);

    expect(ordersService.createOrder).toHaveBeenCalledWith('user-1', dto);
  });
});
