import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PixSimpleService {
  private readonly logger = new Logger(PixSimpleService.name);

  constructor(private configService: ConfigService) {}

  async createSimplePix() {
    let isTestToken = false;
    
    try {
      const accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN');
      
      this.logger.log('=== PIX DEBUG ===');
      this.logger.debug('Access Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'NOT_FOUND');
      
      if (!accessToken) {
        return {
          error: true,
          statusCode: 503,
          message: 'Mercado Pago não configurado',
          details: 'Adicione MERCADOPAGO_ACCESS_TOKEN no arquivo .env',
          solution: 'Obtenha suas credenciais em: https://www.mercadopago.com.br/developers/panel/credentials'
        };
      }

      // Check if using test or production token
      isTestToken = accessToken.startsWith('TEST-');
      this.logger.log('Token type:', isTestToken ? 'TEST' : 'PRODUCTION');

      // For Mercado Pago test mode, use the test buyer account created in your dashboard
      // Test buyer account: TESTUSER1643143031681461731
      // Format: <user_id>@testuser.com
      const testEmail = 'test_user_1643143031681461731@testuser.com';
      
      const payload = {
        transaction_amount: 1.00,
        description: 'Teste PIX - Zavlo.ia',
        payment_method_id: 'pix',
        payer: {
          email: testEmail,
          first_name: 'Comprador',
          last_name: 'Teste',
          identification: {
            type: 'CPF',
            number: '12345678900'
          }
        }
      };

      this.logger.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        isTestToken 
          ? 'https://api.mercadopago.com/v1/payments' 
          : 'https://api.mercadopago.com/v1/payments',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.log('Success! Payment ID:', response.data.id);
      return {
        id: response.data.id,
        status: response.data.status,
        qr_code: response.data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.data.point_of_interaction?.transaction_data?.qr_code_base64,
      };

    } catch (error) {
      this.logger.error('=== PIX ERROR ===');
      this.logger.error('Error:', error.message);
      
      if (error.response) {
        this.logger.error('Status:', error.response.status);
        this.logger.error('Data:', JSON.stringify(error.response.data, null, 2));
        
        const errorData = error.response.data;
        
        // Handle specific Mercado Pago errors
        if (error.response.status === 401) {
          return {
            error: true,
            statusCode: 401,
            message: 'Credenciais inválidas',
            details: errorData,
            explanation: 'Tokens TEST- nao funcionam para API direta de PIX. Apenas funcionam com Checkout Pro (fluxo de redirecionamento).',
            solution: isTestToken 
              ? 'Para PIX via API direta, use token de producao (APP_USR-). Alternativa: Use Checkout Pro (/create).'
              : 'Verifique se o token de producao esta correto.',
            howToTest: 'Para testar PIX em modo de teste:\n1. Va para https://www.mercadopago.com.br/developers/panel\n2. Crie um usuário de teste na aba "Configurações > Usuários de teste"\n3. Use o email do usuário de teste para pagamentos\n4. Ou mude para um token de produção (APP_USR-...)'
          };
        }
        
        // Return detailed error instead of throwing
        return {
          error: true,
          statusCode: error.response.status,
          message: errorData?.message || 'Pagamento falhou',
          details: errorData,
        };
      }
      
      return {
        error: true,
        statusCode: 500,
        message: 'Erro interno do servidor',
        details: error.message,
      };
    }
  }
}
