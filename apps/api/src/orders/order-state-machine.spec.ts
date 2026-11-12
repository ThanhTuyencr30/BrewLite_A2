import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrderStateMachine } from './order-state-machine.service';
import { OrderStatus } from '../generated/prisma/client';

describe('OrderStateMachine (Unit Test)', () => {
  let stateMachine: OrderStateMachine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderStateMachine],
    }).compile();

    stateMachine = module.get<OrderStateMachine>(OrderStateMachine);
  });

  describe('1. Luồng chuyển trạng thái hợp lệ (Valid Transitions)', () => {
    it('Cho phép: PENDING -> PAID', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.PENDING, OrderStatus.PAID)
      ).not.toThrow();
    });

    it('Cho phép: PAID -> PREPARING', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.PAID, OrderStatus.PREPARING)
      ).not.toThrow();
    });

    it('Cho phép: PREPARING -> READY', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.PREPARING, OrderStatus.READY)
      ).not.toThrow();
    });

    it('Cho phép: READY -> COMPLETED', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.READY, OrderStatus.COMPLETED)
      ).not.toThrow();
    });

    it('Cho phép hủy đơn: PENDING -> CANCELLED', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)
      ).not.toThrow();
    });

    it('Cho phép thử lại thanh toán: PAYMENT_FAILED -> PENDING', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.PAYMENT_FAILED, OrderStatus.PENDING)
      ).not.toThrow();
    });
  });

  describe('2. Chặn chuyển sai quy trình (Invalid Transitions - Yêu cầu Task 10 A1)', () => {
    it('Chặn nhảy cóc từ PENDING -> COMPLETED', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.PENDING, OrderStatus.COMPLETED)
      ).toThrow(BadRequestException);
    });

    it('Chặn chuyển trạng thái khi đơn đã COMPLETED', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.COMPLETED, OrderStatus.CANCELLED)
      ).toThrow(BadRequestException);
    });

    it('Chặn chuyển trạng thái khi đơn đã CANCELLED', () => {
      expect(() =>
        stateMachine.assertTransition(OrderStatus.CANCELLED, OrderStatus.PREPARING)
      ).toThrow(BadRequestException);
    });
  });
});