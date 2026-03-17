// Script de teste para verificar API Key da Apify
require('dotenv').config();

const APIFY_API_KEY = process.env.APIFY_API_KEY;

console.log('🔍 Testando API Key da Apify...\n');
console.log('API Key:', APIFY_API_KEY ? `${APIFY_API_KEY.substring(0, 20)}...` : 'NÃO ENCONTRADA');

if (!APIFY_API_KEY) {
  console.error('❌ ERRO: APIFY_API_KEY não encontrada no .env');
  process.exit(1);
}

// Testar chamada simples à API
async function testApifyAPI() {
  try {
    console.log('\n📡 Testando conexão com Apify API...');
    
    const response = await fetch(
      `https://api.apify.com/v2/acts/burbn~google-shopping-scraper?token=${APIFY_API_KEY}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Key válida!');
      console.log('Actor:', data.data?.name || 'N/A');
      console.log('Username:', data.data?.username || 'N/A');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status);
      console.error('Resposta:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    return false;
  }
}

// Testar busca real
async function testRealSearch() {
  try {
    console.log('\n🔍 Testando busca real no Google Shopping...');
    
    const input = {
      country: 'BR',
      language: 'pt-BR',
      limit: 20,
      searchQuery: 'iPhone 13',
      sortBy: 'BEST_MATCH',
    };

    console.log('Input:', JSON.stringify(input, null, 2));

    const response = await fetch(
      `https://api.apify.com/v2/acts/burbn~google-shopping-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );

    console.log('Status:', response.status);

    if (response.ok) {
      const results = await response.json();
      console.log('✅ Busca realizada com sucesso!');
      console.log('Resultados:', results.length);
      
      if (results.length > 0) {
        console.log('\nPrimeiro resultado:');
        console.log('- Título:', results[0].productTitle);
        console.log('- Preço:', results[0].price);
        console.log('- Loja:', results[0].storeName);
      }
      
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na busca:', response.status);
      console.error('Resposta:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar busca:', error.message);
    return false;
  }
}

// Executar testes
(async () => {
  const apiValid = await testApifyAPI();
  
  if (apiValid) {
    await testRealSearch();
  }
  
  console.log('\n✅ Testes concluídos!');
})();
