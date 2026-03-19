import { Controller, Post, Body, UseGuards, Get, Logger, Headers, UnauthorizedException } from '@nestjs/common';
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

  @Post('card')
  @UseGuards(JwtAuthGuard)
  async createCardPayment(
    @CurrentUser() user: any,
    @Body() body: { plan: string; amount: number; cardToken: string; installments: number; payer: any },
  ) {
    const userId = user?.userId || user?.id;
    return this.paymentsService.createCardPayment({
      plan: body.plan, amount: body.amount, userId,
      userEmail: user.email, cardToken: body.cardToken,
      installments: body.installments || 1, payer: body.payer,
    });
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @CurrentUser() user: any,
    @Body() body: { plan: string; amount: number },
  ) {
    const userId = user?.userId || user?.id;
    return this.paymentsService.createPayment({
      plan: body.plan, amount: body.amount, userId, userEmail: user.email,
    });
  }

  @Post('pix')
  @UseGuards(JwtAuthGuard)
  async createPixPayment(
    @CurrentUser() user: any,
    @Body() body: { plan: string; amount: number; userEmail?: string; payer?: { firstName?: string; lastName?: string; email?: string; phone?: string; cpf?: string } },
  ) {
    const userId = user?.userId || user?.id;
    return this.paymentsService.createPixPayment({
      plan: body.plan, amount: body.amount, userId,
      userEmail: body.userEmail || body.payer?.email || user.email,
      payer: body.payer,
    });
  }

  @Post('pix/:paymentId/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPixPayment(
    @CurrentUser() user: any,
    @Body() body: { paymentId: string },
  ) {
    const userId = user?.userId || user?.id;
    return this.paymentsService.confirmPixPayment(body.paymentId, userId);
  }

  @Post('pix/:paymentId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelPixPayment() {
    return { success: true, message: 'Pagamento cancelado' };
  }

  @Post('boleto')
  @UseGuards(JwtAuthGuard)
  async createBoletoPayment(
    @CurrentUser() user: any,
    @Body() body: { plan: string; amount: number; userEmail?: string; payer: { firstName: string; lastName: string; email: string; phone: string; cpf: string; address: { zipCode: string; street: string; number: string; complement?: string; neighborhood: string; city: string; state: string } } },
  ) {
    const userId = user?.userId || user?.id;
    return this.paymentsService.createBoletoPayment({
      plan: body.plan, amount: body.amount, userId,
      userEmail: body.userEmail || body.payer.email || user.email,
      payer: body.payer,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string,
  ) {
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret && signature !== webhookSecret) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    return this.paymentsService.handleWebhook(body);
  }
}
