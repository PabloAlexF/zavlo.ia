import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('test-pix')
export class TestPixController {
  constructor(private configService: ConfigService) {}

  @Get()
  async testPix() {
    try {
      const accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN');
      
      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: 1.00,
          description: 'Teste PIX Zavlo.ia',
          payment_method_id: 'pix',
          payer: {
            email: 'test@zavlo.ia'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        payment_id: response.data.id,
        status: response.data.status,
        qr_code: response.data.point_of_interaction?.transaction_data?.qr_code
      };

    } catch (error) {
      return {
        error: true,
        message: error.message,
        details: error.response?.data
      };
    }
  }
}