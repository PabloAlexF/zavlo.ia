import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly accessToken: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN');
    this.logger.log('PaymentsService initialized');
    this.logger.debug('Access token present:', !!this.accessToken);
  }

  async debugInfo() {
    const hasToken = !!this.accessToken;
    const tokenValue = this.accessToken || 'NO_TOKEN_SET';
    
    return {
      hasAccessToken: hasToken,
      tokenStart: hasToken ? tokenValue.substring(0, 20) + '...' : 'NO_TOKEN',
      envCheck: !!this.configService.get('MERCADOPAGO_ACCESS_TOKEN'),
      nodeEnv: this.configService.get('NODE_ENV'),
      port: this.configService.get('PORT'),
      mercadopagoConfigured: hasToken && tokenValue.length > 10,
    };
  }

  async testConnection() {
    try {
      this.logger.log('Testing Mercado Pago connection...');
      
      if (!this.accessToken) {
        return { 
          error: 'MERCADOPAGO_ACCESS_TOKEN not configured',
          solution: 'Add MERCADOPAGO_ACCESS_TOKEN to your .env file',
          hint: 'Get your token from https://www.mercadopago.com.br/developers/panel/credentials'
        };
      }
      
      const response = await axios.get(
        'https://api.mercadopago.com/v1/payment_methods',
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      
      return {
        success: true,
        message: 'Mercado Pago connection successful',
        methods: response.data.length,
      };
    } catch (error) {
      this.logger.error('Mercado Pago connection failed:', error.response?.data || error.message);
      return {
        error: 'Connection failed',
        details: error.response?.data || error.message,
      };
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
        return {
          error: true,
          statusCode: 503,
          message: 'Payment gateway is not configured',
        };
      }

      const payload = {
        transaction_amount: data.amount,
        token: data.cardToken,
        description: `Plano ${data.plan} - Zavlo.ia`,
        installments: data.installments,
        payment_method_id: 'visa', // Será detectado automaticamente pelo token
        payer: {
          email: data.payer.email,
          identification: {
            type: data.payer.identification?.type || 'CPF',
            number: data.payer.identification?.number,
          },
        },
        external_reference: `${data.userId}-${data.plan}`,
        statement_descriptor: 'ZAVLO.IA',
      };

      this.logger.log('[CARD] Payload:', JSON.stringify(payload, null, 2));

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

      this.logger.log('[CARD] Payment created:', response.data.id);
      this.logger.log('[CARD] Status:', response.data.status);

      // Se aprovado, atualizar usuário imediatamente
      if (response.data.status === 'approved') {
        const billingCycle = data.amount >= 200 ? 'yearly' : 'monthly';
        let creditsToAdd = 15;
        
        if (data.plan === 'basic') {
          creditsToAdd = billingCycle === 'yearly' ? 180 : 15;
        } else if (data.plan === 'pro') {
          creditsToAdd = billingCycle === 'yearly' ? 576 : 48;
        } else if (data.plan === 'business') {
          creditsToAdd = billingCycle === 'yearly' ? 2400 : 200;
        }

        await this.usersService.addCredits(data.userId, creditsToAdd);
        await this.usersService.updatePlan(data.userId, data.plan as any, billingCycle);
        
        this.logger.log(`[CARD] ✅ User updated: ${creditsToAdd} credits, plan ${data.plan}`);
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
        return {
          error: true,
          statusCode: error.response.status,
          message: error.response.data?.message || 'Payment failed',
          details: error.response.data,
        };
      }
      
      return {
        error: true,
        statusCode: 500,
        message: 'Internal payment error',
      };
    }
  }

  async createPayment(data: {
    plan: string;
    amount: number;
    userId: string;
    userEmail: string;
    payer?: {
      name?: string;
      surname?: string;
      email?: string;
      phone?: { number?: string };
    };
  }) {
    try {
      this.logger.log('[PAYMENT] Creating payment preference:', { plan: data.plan, amount: data.amount });
      
      if (!this.accessToken) {
        this.logger.error('[PAYMENT] MERCADOPAGO_ACCESS_TOKEN is not configured');
        return {
          error: true,
          statusCode: 503,
          message: 'Payment gateway is not configured',
          solution: 'Add MERCADOPAGO_ACCESS_TOKEN to your .env file'
        };
      }
      
      // Preparar dados do pagador
      const payerData: any = {
        email: data.payer?.email || data.userEmail,
      };

      // Adicionar nome se fornecido
      if (data.payer?.name) {
        payerData.name = data.payer.name;
      }
      if (data.payer?.surname) {
        payerData.surname = data.payer.surname;
      }

      // Adicionar telefone se fornecido
      if (data.payer?.phone?.number) {
        payerData.phone = {
          area_code: data.payer.phone.number.substring(0, 2),
          number: data.payer.phone.number.substring(2),
        };
      }
      
      const response = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        {
          items: [
            {
              title: `Plano ${data.plan} - Zavlo.ia`,
              quantity: 1,
              unit_price: data.amount,
              currency_id: 'BRL',
            },
          ],
          payer: payerData,
          back_urls: {
            success: 'https://zavlo.ia/checkout/success',
            failure: 'https://zavlo.ia/checkout/failure',
            pending: 'https://zavlo.ia/checkout/pending',
          },
          auto_return: 'approved',
          external_reference: `${data.userId}-${data.plan}`,
          statement_descriptor: 'ZAVLO.IA',
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        init_point: response.data.init_point,
        sandbox_init_point: response.data.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('[PAYMENT] Mercado Pago Error:', error.response?.data || error.message);
      
      if (error.response) {
        return {
          error: true,
          statusCode: error.response.status,
          message: error.response.data?.message || 'Payment failed',
          details: error.response.data,
        };
      }
      
      return {
        error: true,
        statusCode: 500,
        message: 'Internal payment error',
        details: error.message,
      };
    }
  }

  async createPixPayment(data: {
    plan: string;
    amount: number;
    userId: string;
    userEmail: string;
  }) {
    try {
      this.logger.log('[PIX] Starting payment creation...');
      this.logger.log('[PIX] Input data:', { plan: data.plan, amount: data.amount, userId: data.userId, email: data.userEmail });
      
      // Check if token is configured FIRST, before making any API calls
      if (!this.accessToken) {
        this.logger.error('[PIX] MERCADOPAGO_ACCESS_TOKEN is not configured in .env file');
        
        // Return a clear error instead of throwing
        return {
          error: true,
          statusCode: 503,
          message: 'Payment gateway is not configured',
          details: 'MERCADOPAGO_ACCESS_TOKEN is missing. Please configure your Mercado Pago credentials.',
          solution: 'Add MERCADOPAGO_ACCESS_TOKEN to your backend/.env file. Get your credentials from: https://www.mercadopago.com.br/developers/panel/credentials',
          hint: 'For testing, you can use the /pix-test endpoint without authentication',
        };
      }
      
      this.logger.log('[PIX] Access token check:', {
        hasToken: !!this.accessToken,
        tokenStart: this.accessToken.substring(0, 20),
        tokenLength: this.accessToken.length,
      });
      
      // Generate idempotency key
      const idempotencyKey = `${data.userId}-${data.plan}-${Date.now()}`;
      
      const payload = {
        transaction_amount: data.amount,
        description: `Plano ${data.plan} - Zavlo.ia`,
        payment_method_id: 'pix',
        payer: {
          email: data.userEmail,
        },
        external_reference: `${data.userId}-${data.plan}`,
      };
      
      this.logger.log('[PIX] Request payload:', JSON.stringify(payload, null, 2));
      this.logger.log('[PIX] Idempotency-Key:', idempotencyKey);
      this.logger.log('[PIX] Making request to Mercado Pago...');
      
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

      this.logger.log('[PIX] Success! Payment ID:', response.data.id);
      this.logger.log('[PIX] Response status:', response.data.status);
      
      return {
        id: response.data.id,
        payment_id: response.data.id,
        status: response.data.status,
        qr_code: response.data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.data.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.data.point_of_interaction?.transaction_data?.ticket_url,
      };
    } catch (error) {
      this.logger.error('[PIX] ERROR OCCURRED!');
      this.logger.error('[PIX] Error type:', error.constructor.name);
      this.logger.error('[PIX] Error message:', error.message);
      
      if (error.response) {
        this.logger.error('[PIX] HTTP Status:', error.response.status);
        this.logger.error('[PIX] HTTP Status Text:', error.response.statusText);
        this.logger.error('[PIX] Response Data:', JSON.stringify(error.response.data, null, 2));
        
        // Return a more informative error instead of throwing
        return {
          error: true,
          statusCode: error.response.status,
          message: error.response.data?.message || 'Payment failed',
          details: error.response.data,
          merchant_message: error.response.data?.cause?.[0]?.description || 'Unknown error',
        };
      } else if (error.request) {
        this.logger.error('[PIX] No response received:', error.request);
        return {
          error: true,
          statusCode: 503,
          message: 'Payment gateway unavailable',
          details: 'Could not reach Mercado Pago API',
        };
      } else {
        this.logger.error('[PIX] Request setup error:', error.message);
        return {
          error: true,
          statusCode: 500,
          message: error.message || 'Internal payment error',
        };
      }
    }
  }

  async handleWebhook(data: any) {
    try {
      this.logger.log('[WEBHOOK] Received notification:', JSON.stringify(data, null, 2));
      
      // Mercado Pago webhook structure
      if (data.type === 'payment') {
        const paymentId = data.data?.id;
        
        if (paymentId) {
          // Get payment details
          const paymentDetails = await this.getPaymentDetails(paymentId);
          
          this.logger.log('[WEBHOOK] Payment details:', paymentDetails);
          
          // Process payment status
          if (paymentDetails.status === 'approved') {
            this.logger.log('[WEBHOOK] Payment approved:', paymentId);
            
            // Extract userId and planName from external_reference (format: userId-planName)
            const externalRef = paymentDetails.external_reference || '';
            const [userId, planName] = externalRef.split('-');
            const amount = paymentDetails.transaction_amount;
            
            if (userId && planName) {
              this.logger.log(`[WEBHOOK] Processing payment for user ${userId}, plan ${planName}`);
              
              // Check if it's a credits purchase
              if (planName.startsWith('credits-')) {
                const credits = parseInt(planName.replace('credits-', ''));
                await this.usersService.addCredits(userId, credits);
                this.logger.log(`[WEBHOOK] ✅ Added ${credits} credits to user ${userId}`);
                
                return { 
                  received: true, 
                  processed: true,
                  userId,
                  credits: credits,
                };
              }
              
              // 1. Determine credits based on plan and cycle
              let creditsToAdd = 15; // default basic monthly
              const billingCycle = amount >= 100 ? 'yearly' : 'monthly';
              
              if (planName === 'basic') {
                creditsToAdd = billingCycle === 'yearly' ? 180 : 15; // 15/mês
              } else if (planName === 'pro') {
                creditsToAdd = billingCycle === 'yearly' ? 576 : 48; // 48/mês
              } else if (planName === 'business') {
                creditsToAdd = billingCycle === 'yearly' ? 2400 : 200; // 200/mês
              }
              
              await this.usersService.addCredits(userId, creditsToAdd);
              this.logger.log(`[WEBHOOK] ✅ Added ${creditsToAdd} credits to user ${userId}`);
              
              // 2. Update user plan
              await this.usersService.updatePlan(userId, planName as any, billingCycle);
              this.logger.log(`[WEBHOOK] ✅ Updated user plan to ${planName} (${billingCycle})`);
              
              // 3. Email confirmation (TODO: implement email service)
              this.logger.log(`[WEBHOOK] 📧 Email confirmation would be sent here`);
              
              return { 
                received: true, 
                processed: true,
                userId,
                credits: creditsToAdd,
                plan: planName
              };
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
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      this.logger.error('[WEBHOOK] Error getting payment details:', error);
      throw error;
    }
  }

  async confirmPixPayment(paymentId: string, userId: string) {
    try {
      this.logger.log(`[PIX CONFIRM] Checking payment ${paymentId} for user ${userId}`);
      
      // Get payment details from Mercado Pago
      const paymentDetails = await this.getPaymentDetails(paymentId);
      
      this.logger.log(`[PIX CONFIRM] Payment status: ${paymentDetails.status}`);
      this.logger.log(`[PIX CONFIRM] Payment amount: ${paymentDetails.transaction_amount}`);
      this.logger.log(`[PIX CONFIRM] External reference: ${paymentDetails.external_reference}`);
      
      // Check if payment is approved
      if (paymentDetails.status === 'approved') {
        // Extract plan from external_reference (format: userId-planName)
        const externalRef = paymentDetails.external_reference || '';
        const planName = externalRef.split('-')[1] || 'basic';
        const amount = paymentDetails.transaction_amount;
        
        this.logger.log(`[PIX CONFIRM] Processing approved payment for plan: ${planName}`);
        
        // Check if it's a credits purchase (format: credits-10, credits-25, credits-60)
        if (planName.startsWith('credits-')) {
          const credits = parseInt(planName.replace('credits-', ''));
          await this.usersService.addCredits(userId, credits);
          this.logger.log(`[PIX CONFIRM] ✅ Added ${credits} credits to user ${userId}`);
          
          return {
            success: true,
            status: 'approved',
            message: 'Pagamento confirmado! Créditos adicionados à sua conta.',
            payment: {
              id: paymentDetails.id,
              status: paymentDetails.status,
              amount: paymentDetails.transaction_amount,
            },
            credits: credits,
          };
        }
        
        // 1. Determine credits based on plan and cycle
        let creditsToAdd = 15; // default basic monthly
        const billingCycle = amount >= 200 ? 'yearly' : 'monthly';
        
        if (planName === 'basic') {
          creditsToAdd = billingCycle === 'yearly' ? 180 : 15; // 15/mês
        } else if (planName === 'pro') {
          creditsToAdd = billingCycle === 'yearly' ? 576 : 48; // 48/mês
        } else if (planName === 'business') {
          creditsToAdd = billingCycle === 'yearly' ? 2400 : 200; // 200/mês
        }
        
        await this.usersService.addCredits(userId, creditsToAdd);
        this.logger.log(`[PIX CONFIRM] ✅ Added ${creditsToAdd} credits to user ${userId}`);
        
        // 2. Update user plan
        await this.usersService.updatePlan(userId, planName as any, billingCycle);
        this.logger.log(`[PIX CONFIRM] ✅ Updated user plan to ${planName} (${billingCycle})`);
        
        // 3. Send confirmation email (TODO: implement email service)
        this.logger.log(`[PIX CONFIRM] 📧 Email confirmation would be sent here`);
        // await this.emailService.sendPaymentConfirmation(userId, planName, amount);
        
        return {
          success: true,
          status: 'approved',
          message: 'Pagamento confirmado! Créditos adicionados à sua conta.',
          payment: {
            id: paymentDetails.id,
            status: paymentDetails.status,
            amount: paymentDetails.transaction_amount,
          },
          credits: creditsToAdd,
          plan: planName,
        };
      } else if (paymentDetails.status === 'pending') {
        return {
          success: false,
          status: 'pending',
          message: 'Pagamento ainda não foi identificado. Aguarde alguns instantes.',
        };
      } else {
        return {
          success: false,
          status: paymentDetails.status,
          message: 'Pagamento não foi aprovado.',
        };
      }
    } catch (error) {
      this.logger.error('[PIX CONFIRM] Error:', error);
      return {
        success: false,
        status: 'error',
        message: 'Erro ao verificar pagamento.',
        error: error.message,
      };
    }
  }
}
