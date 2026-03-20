import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '@config/firebase.service';
import axios from 'axios';

// Mapeamento de créditos por plano (sincronizado com plans.constants.ts)
const PLAN_CREDITS_MAP: Record<string, { monthly: number; yearly: number }> = {
  basic:    { monthly: 15,  yearly: 180  },
  pro:      { monthly: 48,  yearly: 576  },
  business: { monthly: 200, yearly: 2400 },
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly accessToken: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {
    this.accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN');
    this.logger.log('PaymentsService initialized');
    this.logger.debug('Access token present:', !!this.accessToken);
  }

  private resolveCreditsForPlan(plan: string, amount: number): { credits: number; billingCycle: 'monthly' | 'yearly' } {
    const billingCycle = amount >= 200 ? 'yearly' : 'monthly';
    const credits = PLAN_CREDITS_MAP[plan]?.[billingCycle] ?? PLAN_CREDITS_MAP['basic'].monthly;
    return { credits, billingCycle };
  }

  private async isPaymentProcessed(paymentId: string): Promise<boolean> {
    try {
      const firestore = this.firebaseService.getFirestore();
      if (!firestore) return false;
      const doc = await firestore.collection('processed_payments').doc(paymentId).get();
      return doc.exists;
    } catch {
      return false;
    }
  }

  private async markPaymentProcessed(paymentId: string): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      if (!firestore) return;
      await firestore.collection('processed_payments').doc(paymentId).set({ processedAt: new Date() });
    } catch (error) {
      this.logger.error('[WEBHOOK] Failed to mark payment as processed:', error.message);
    }
  }

  async createCardPayment(data: {
    plan: string;
    amount: number;
    userId: string;
    userEmail: string;
    cardToken: string;
    installments: number;
    payer: any;
  }) {
    try {
      this.logger.log('[CARD] Creating direct card payment...');

      if (!this.accessToken) {
        return { error: true, statusCode: 503, message: 'Payment gateway is not configured' };
      }

      const payload = {
        transaction_amount: data.amount,
        token: data.cardToken,
        description: `Plano ${data.plan} - Zavlo.ia`,
        installments: data.installments,
        payer: {
          email: data.payer.email,
          identification: {
            type: data.payer.identification?.type || 'CPF',
            number: data.payer.identification?.number,
          },
        },
        external_reference: `${data.userId}|${data.plan}`,
        statement_descriptor: 'ZAVLO.IA',
      };

      this.logger.log('[CARD] Creating payment:', { plan: data.plan, amount: data.amount, userId: data.userId });

      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `${data.userId}-${data.plan}-${Date.now()}`,
          },
        }
      );

      this.logger.log('[CARD] Payment created:', response.data.id, 'Status:', response.data.status);

      if (response.data.status === 'approved') {
        const { credits, billingCycle } = this.resolveCreditsForPlan(data.plan, data.amount);
        await this.usersService.addCredits(data.userId, credits);
        await this.usersService.updatePlan(data.userId, data.plan as any, billingCycle);
        this.logger.log(`[CARD] ✅ User updated: ${credits} credits, plan ${data.plan}`);
      }

      return {
        id: response.data.id,
        status: response.data.status,
        status_detail: response.data.status_detail,
        payment_method_id: response.data.payment_method_id,
        payment_type_id: response.data.payment_type_id,
      };
    } catch (error) {
      this.logger.error('[CARD] Error:', error.response?.data || error.message);
      if (error.response) {
        return { error: true, statusCode: error.response.status, message: error.response.data?.message || 'Payment failed', details: error.response.data };
      }
      return { error: true, statusCode: 500, message: 'Internal payment error' };
    }
  }

  async createPayment(data: {
    plan: string;
    amount: number;
    userId: string;
    userEmail: string;
    payer?: { name?: string; surname?: string; email?: string; phone?: { number?: string } };
  }) {
    try {
      this.logger.log('[PAYMENT] Creating payment preference:', { plan: data.plan, amount: data.amount });

      if (!this.accessToken) {
        return { error: true, statusCode: 503, message: 'Payment gateway is not configured', solution: 'Add MERCADOPAGO_ACCESS_TOKEN to your .env file' };
      }

      const payerData: any = { email: data.payer?.email || data.userEmail };
      if (data.payer?.name) payerData.name = data.payer.name;
      if (data.payer?.surname) payerData.surname = data.payer.surname;
      if (data.payer?.phone?.number) {
        payerData.phone = {
          area_code: data.payer.phone.number.substring(0, 2),
          number: data.payer.phone.number.substring(2),
        };
      }

      const response = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        {
          items: [{ title: `Plano ${data.plan} - Zavlo.ia`, quantity: 1, unit_price: data.amount, currency_id: 'BRL' }],
          payer: payerData,
          back_urls: {
            success: 'https://zavlo.ia/checkout/success',
            failure: 'https://zavlo.ia/checkout/failure',
            pending: 'https://zavlo.ia/checkout/pending',
          },
          auto_return: 'approved',
          external_reference: `${data.userId}|${data.plan}`,
          statement_descriptor: 'ZAVLO.IA',
        },
        { headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' } }
      );

      return { id: response.data.id, init_point: response.data.init_point, sandbox_init_point: response.data.sandbox_init_point };
    } catch (error) {
      this.logger.error('[PAYMENT] Mercado Pago Error:', error.response?.data || error.message);
      if (error.response) {
        return { error: true, statusCode: error.response.status, message: error.response.data?.message || 'Payment failed', details: error.response.data };
      }
      return { error: true, statusCode: 500, message: 'Internal payment error', details: error.message };
    }
  }

  async createPixPayment(data: {
    plan: string;
    amount: number;
    userId: string;
    userEmail: string;
    payer?: { firstName?: string; lastName?: string; email?: string; phone?: string; cpf?: string };
  }) {
    try {
      this.logger.log('[PIX] Starting payment creation...', { plan: data.plan, amount: data.amount, userId: data.userId });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.userEmail)) {
        return { error: true, statusCode: 400, message: 'Email inválido', details: 'O email fornecido não é válido' };
      }

      if (!this.accessToken) {
        return {
          error: true, statusCode: 503, message: 'Payment gateway is not configured',
          details: 'MERCADOPAGO_ACCESS_TOKEN is missing.',
          solution: 'Add MERCADOPAGO_ACCESS_TOKEN to your backend/.env file.',
        };
      }

      const idempotencyKey = `${data.userId}-${data.plan}-${Date.now()}`;
      const cleanEmail = data.userEmail.trim().toLowerCase();

      const payerData: any = {
        email: cleanEmail,
        first_name: data.payer?.firstName || 'Cliente',
        last_name: data.payer?.lastName || 'Zavlo',
      };

      if (data.payer?.cpf) {
        payerData.identification = { type: 'CPF', number: data.payer.cpf.replace(/\D/g, '') };
      }

      if (data.payer?.phone) {
        const phoneClean = data.payer.phone.replace(/\D/g, '');
        if (phoneClean.length >= 10) {
          payerData.phone = { area_code: phoneClean.substring(0, 2), number: phoneClean.substring(2) };
        }
      }

      const payload = {
        transaction_amount: data.amount,
        description: `Plano ${data.plan} - Zavlo.ia`,
        payment_method_id: 'pix',
        payer: payerData,
        external_reference: `${data.userId}|${data.plan}`,
        statement_descriptor: 'ZAVLO.IA',
        notification_url: `${this.configService.get('API_URL') || 'https://zavlo-ia.onrender.com/api/v1'}/payments/webhook`,
      };

      this.logger.log(`[PIX] Sending payment request, idempotency-key: ${idempotencyKey}`);

      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );

      this.logger.log('[PIX] Success! Payment ID:', response.data.id, 'Status:', response.data.status);

      return {
        id: response.data.id,
        payment_id: response.data.id,
        status: response.data.status,
        qr_code: response.data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.data.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.data.point_of_interaction?.transaction_data?.ticket_url,
      };
    } catch (error) {
      this.logger.error('[PIX] Error:', error.message);
      if (error.response) {
        return {
          error: true, statusCode: error.response.status,
          message: error.response.data?.message || 'Payment failed',
          details: error.response.data,
          merchant_message: error.response.data?.cause?.[0]?.description || error.response.data?.message || 'Unknown error',
        };
      } else if (error.request) {
        return { error: true, statusCode: 503, message: 'Payment gateway unavailable', details: 'Could not reach Mercado Pago API' };
      }
      return { error: true, statusCode: 500, message: error.message || 'Internal payment error' };
    }
  }

  async handleWebhook(data: any) {
    try {
      this.logger.log('[WEBHOOK] Received notification:', JSON.stringify(data, null, 2));

      if (data.type === 'payment') {
        const paymentId = data.data?.id;

        if (paymentId) {
          const paymentDetails = await this.getPaymentDetails(paymentId);
          this.logger.log('[WEBHOOK] Payment details:', paymentDetails);

          // Idempotência: evitar processar o mesmo pagamento duas vezes
          const alreadyProcessed = await this.isPaymentProcessed(String(paymentId));
          if (alreadyProcessed) {
            this.logger.warn(`[WEBHOOK] Payment ${paymentId} already processed, skipping.`);
            return { received: true, processed: false, reason: 'already_processed' };
          }

          if (paymentDetails.status === 'approved') {
            this.logger.log('[WEBHOOK] Payment approved:', paymentId);

            // Separador | para evitar ambiguidade com Firebase UIDs que contêm hífens
            const externalRef = paymentDetails.external_reference || '';
            const separatorIdx = externalRef.indexOf('|');
            const userId = externalRef.substring(0, separatorIdx);
            const planName = externalRef.substring(separatorIdx + 1);
            const amount = paymentDetails.transaction_amount;

            if (userId && planName) {
              this.logger.log(`[WEBHOOK] Processing payment for user ${userId}, plan ${planName}`);

              await this.markPaymentProcessed(String(paymentId));

              if (planName.startsWith('credits-')) {
                const credits = parseInt(planName.replace('credits-', ''));
                await this.usersService.addCredits(userId, credits);
                this.logger.log(`[WEBHOOK] ✅ Added ${credits} credits to user ${userId}`);
                return { received: true, processed: true, userId, credits };
              }

              const { credits: creditsToAdd, billingCycle } = this.resolveCreditsForPlan(planName, amount);
              await this.usersService.addCredits(userId, creditsToAdd);
              await this.usersService.updatePlan(userId, planName as any, billingCycle);
              this.logger.log(`[WEBHOOK] ✅ user=${userId} plan=${planName} credits=${creditsToAdd}`);

              return { received: true, processed: true, userId, credits: creditsToAdd, plan: planName };
            } else {
              this.logger.warn('[WEBHOOK] Invalid external_reference format:', externalRef);
            }
          }
        }
      }

      return { received: true, processed: false };
    } catch (error) {
      this.logger.error('[WEBHOOK] Error processing webhook:', error);
      return { error: true, message: error.message };
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );
      return response.data;
    } catch (error) {
      this.logger.error('[WEBHOOK] Error getting payment details:', error);
      throw error;
    }
  }

  async createBoletoPayment(data: {
    plan: string;
    amount: number;
    userId: string;
    userEmail: string;
    payer: {
      firstName: string; lastName: string; email: string; phone: string; cpf: string;
      address: { zipCode: string; street: string; number: string; complement?: string; neighborhood: string; city: string; state: string };
    };
  }) {
    try {
      this.logger.log('[BOLETO] Starting payment creation...', { plan: data.plan, amount: data.amount, userId: data.userId });

      if (!this.accessToken) {
        return { error: true, statusCode: 503, message: 'Payment gateway is not configured' };
      }

      const cpfClean = data.payer.cpf.replace(/\D/g, '');
      const phoneClean = data.payer.phone.replace(/\D/g, '');
      const zipCodeClean = data.payer.address.zipCode.replace(/\D/g, '');

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 3);

      const payload: any = {
        transaction_amount: data.amount,
        description: `Plano ${data.plan} - Zavlo.ia`,
        payment_method_id: 'bolbradesco',
        payer: {
          email: data.payer.email,
          first_name: data.payer.firstName,
          last_name: data.payer.lastName,
          identification: { type: 'CPF', number: cpfClean },
          address: {
            zip_code: zipCodeClean,
            street_name: data.payer.address.street,
            street_number: data.payer.address.number,
            neighborhood: data.payer.address.neighborhood,
            city: data.payer.address.city,
            federal_unit: data.payer.address.state,
          },
        },
        external_reference: `${data.userId}|${data.plan}`,
        statement_descriptor: 'ZAVLO.IA',
        date_of_expiration: expirationDate.toISOString(),
        notification_url: `${this.configService.get('API_URL') || 'https://zavlo-ia.onrender.com/api/v1'}/payments/webhook`,
      };

      if (phoneClean.length >= 10) {
        payload.payer.phone = { area_code: phoneClean.substring(0, 2), number: phoneClean.substring(2) };
      }

      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `${data.userId}-${data.plan}-${Date.now()}`,
          },
        }
      );

      this.logger.log('[BOLETO] Success! Payment ID:', response.data.id, 'Status:', response.data.status);

      return {
        id: response.data.id,
        payment_id: response.data.id,
        status: response.data.status,
        barcode: response.data.barcode?.content,
        ticket_url: response.data.transaction_details?.external_resource_url,
        pdf_url: response.data.transaction_details?.external_resource_url,
        expiration_date: response.data.date_of_expiration,
      };
    } catch (error) {
      this.logger.error('[BOLETO] Error:', error.message);
      if (error.response) {
        return { error: true, statusCode: error.response.status, message: error.response.data?.message || 'Payment failed', details: error.response.data };
      }
      return { error: true, statusCode: 500, message: error.message || 'Internal payment error' };
    }
  }

  async confirmPixPayment(paymentId: string, userId: string) {
    try {
      this.logger.log(`[PIX CONFIRM] Checking payment ${paymentId} for user ${userId}`);

      const paymentDetails = await this.getPaymentDetails(paymentId);
      this.logger.log(`[PIX CONFIRM] Status: ${paymentDetails.status}, Amount: ${paymentDetails.transaction_amount}, Ref: ${paymentDetails.external_reference}`);

      // Validar ownership
      const externalRefCheck = paymentDetails.external_reference || '';
      const ownerUserId = externalRefCheck.substring(0, externalRefCheck.indexOf('|'));
      if (ownerUserId && ownerUserId !== userId) {
        this.logger.warn(`[PIX CONFIRM] Ownership mismatch: token=${userId}, payment owner=${ownerUserId}`);
        return { success: false, status: 'forbidden', message: 'Pagamento não pertence a este usuário.' };
      }

      if (paymentDetails.status === 'approved') {
        const externalRef = paymentDetails.external_reference || '';
        const separatorIdx = externalRef.indexOf('|');
        const planName = externalRef.substring(separatorIdx + 1) || 'basic';
        const amount = paymentDetails.transaction_amount;

        this.logger.log(`[PIX CONFIRM] Processing approved payment for plan: ${planName}`);

        if (planName.startsWith('credits-')) {
          const credits = parseInt(planName.replace('credits-', ''));
          await this.usersService.addCredits(userId, credits);
          this.logger.log(`[PIX CONFIRM] ✅ Added ${credits} credits to user ${userId}`);
          return {
            success: true, status: 'approved',
            message: 'Pagamento confirmado! Créditos adicionados à sua conta.',
            payment: { id: paymentDetails.id, status: paymentDetails.status, amount: paymentDetails.transaction_amount },
            credits,
          };
        }

        const { credits: creditsToAdd, billingCycle } = this.resolveCreditsForPlan(planName, amount);
        await this.usersService.addCredits(userId, creditsToAdd);
        await this.usersService.updatePlan(userId, planName as any, billingCycle);
        this.logger.log(`[PIX CONFIRM] ✅ user=${userId} plan=${planName} credits=${creditsToAdd}`);

        return {
          success: true, status: 'approved',
          message: 'Pagamento confirmado! Créditos adicionados à sua conta.',
          payment: { id: paymentDetails.id, status: paymentDetails.status, amount: paymentDetails.transaction_amount },
          credits: creditsToAdd, plan: planName,
        };
      } else if (paymentDetails.status === 'pending') {
        return { success: false, status: 'pending', message: 'Pagamento ainda não foi identificado. Aguarde alguns instantes.' };
      } else {
        return { success: false, status: paymentDetails.status, message: 'Pagamento não foi aprovado.' };
      }
    } catch (error) {
      this.logger.error('[PIX CONFIRM] Error:', error);
      return { success: false, status: 'error', message: 'Erro ao verificar pagamento.', error: error.message };
    }
  }
}
