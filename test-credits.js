// Script de teste para verificar os logs de créditos
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCredits() {
  try {
    console.log('🧪 Testando logs de créditos...\n');
    
    // 1. Fazer login (substitua com suas credenciais)
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com', // Substitua pelo seu email
      password: 'password123'    // Substitua pela sua senha
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login realizado com sucesso\n');
    
    // 2. Verificar créditos atuais
    console.log('2. Verificando créditos atuais...');
    const creditsResponse = await axios.get(`${BASE_URL}/search/debug/credits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Créditos atuais:', creditsResponse.data);
    console.log('');
    
    // 3. Fazer uma busca de teste
    console.log('3. Fazendo busca de teste: "cadeira gamer vermelha"...');
    const searchResponse = await axios.get(`${BASE_URL}/search/text`, {
      params: { query: 'cadeira gamer vermelha' },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('🔍 Resultado da busca:');
    console.log(`   - Resultados encontrados: ${searchResponse.data.results?.length || 0}`);
    console.log(`   - Créditos usados: ${searchResponse.data.creditsUsed || 0}`);
    console.log(`   - Créditos restantes: ${searchResponse.data.remainingCredits || 'N/A'}`);
    console.log('');
    
    // 4. Verificar créditos após busca
    console.log('4. Verificando créditos após busca...');
    const creditsAfterResponse = await axios.get(`${BASE_URL}/search/debug/credits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Créditos após busca:', creditsAfterResponse.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testCredits();