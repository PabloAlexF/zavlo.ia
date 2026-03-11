import { Controller, Post, Body, UseGuards, Get, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { PixSimpleService } from './pix-simple.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private paymentsService: PaymentsService,
    private pixSimpleService: PixSimpleService
  ) {}

  @Get('pix-simple')
  async pixSimple() {
    return this.pixSimpleService.createSimplePix();
  }

  @Get('debug')
  async debugPayment() {
    return this.paymentsService.debugInfo();
  }

  @Get('test')
  async testPayment() {
    return this.paymentsService.testConnection();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @CurrentUser() user: any,
    @Body() body: { plan: string; amount: number },
  ) {
    const userId = user?.userId || user?.id;
    this.logger.log(`Criando pagamento para usuário: ${userId}`);
    return this.paymentsService.createPayment({
      plan: body.plan,
      amount: body.amount,
      userId: userId,
      userEmail: user.email,
    });
  }

  @Post('pix')
  @UseGuards(JwtAuthGuard)
  async createPixPayment(
    @CurrentUser() user: any,
    @Body() body: { plan: string; amount: number },
  ) {
    const userId = user?.userId || user?.id;
    this.logger.log(`Criando PIX para usuário: ${userId}`);
    return this.paymentsService.createPixPayment({
      plan: body.plan,
      amount: body.amount,
      userId: userId,
      userEmail: user.email,
    });
  }

  @Post('pix/:paymentId/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPixPayment(
    @CurrentUser() user: any,
    @Body() body: { paymentId: string },
  ) {
    const userId = user?.userId || user?.id;
    const paymentId = body.paymentId;
    this.logger.log(`Confirmando PIX ${paymentId} para usuário: ${userId}`);
    return this.paymentsService.confirmPixPayment(paymentId, userId);
  }

  @Post('pix-test')
  async createPixPaymentTest(
    @Body() body: { plan: string; amount: number },
  ) {
    return this.paymentsService.createPixPayment({
      plan: body.plan,
      amount: body.amount,
      userId: 'test-user',
      userEmail: 'test@zavlo.ia',
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
  ) {
    return this.paymentsService.handleWebhook(body);
  }

  // Checkout Pro test - works with TEST tokens
  @Post('create-test')
  async createPaymentTest(
    @Body() body: { plan: string; amount: number },
  ) {
    return this.paymentsService.createPayment({
      plan: body.plan,
      amount: body.amount,
      userId: 'test-user',
      userEmail: 'test@zavlo.ia',
    });
  }
}
