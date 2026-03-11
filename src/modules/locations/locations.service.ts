import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

@Injectable()
export class LocationsService {
  constructor(private configService: ConfigService) {}

  async getCepData(cep: string): Promise<CepData | null> {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      const url = `${this.configService.get('VIACEP_URL')}/${cleanCep}/json/`;
      const response = await axios.get<CepData>(url);

      if (response.data && !response.data['erro']) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }

  async getStateByName(stateName: string): Promise<string | null> {
    const statesMap = {
      'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amazonas': 'AM',
      'bahia': 'BA', 'ceará': 'CE', 'distrito federal': 'DF', 'espírito santo': 'ES',
      'goiás': 'GO', 'maranhão': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
      'minas gerais': 'MG', 'pará': 'PA', 'paraíba': 'PB', 'paraná': 'PR',
      'pernambuco': 'PE', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
      'rio grande do sul': 'RS', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
      'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO'
    };

    return statesMap[stateName.toLowerCase()] || null;
  }

  getAllStates() {
    return [
      { code: 'AC', name: 'Acre' },
      { code: 'AL', name: 'Alagoas' },
      { code: 'AP', name: 'Amapá' },
      { code: 'AM', name: 'Amazonas' },
      { code: 'BA', name: 'Bahia' },
      { code: 'CE', name: 'Ceará' },
      { code: 'DF', name: 'Distrito Federal' },
      { code: 'ES', name: 'Espírito Santo' },
      { code: 'GO', name: 'Goiás' },
      { code: 'MA', name: 'Maranhão' },
      { code: 'MT', name: 'Mato Grosso' },
      { code: 'MS', name: 'Mato Grosso do Sul' },
      { code: 'MG', name: 'Minas Gerais' },
      { code: 'PA', name: 'Pará' },
      { code: 'PB', name: 'Paraíba' },
      { code: 'PR', name: 'Paraná' },
      { code: 'PE', name: 'Pernambuco' },
      { code: 'PI', name: 'Piauí' },
      { code: 'RJ', name: 'Rio de Janeiro' },
      { code: 'RN', name: 'Rio Grande do Norte' },
      { code: 'RS', name: 'Rio Grande do Sul' },
      { code: 'RO', name: 'Rondônia' },
      { code: 'RR', name: 'Roraima' },
      { code: 'SC', name: 'Santa Catarina' },
      { code: 'SP', name: 'São Paulo' },
      { code: 'SE', name: 'Sergipe' },
      { code: 'TO', name: 'Tocantins' }
    ];
  }
}
