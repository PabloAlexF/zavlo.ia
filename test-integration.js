/**
 * Teste End-to-End - Integração Completa
 * Python Service → NestJS → Frontend
 */

const PYTHON_URL = 'http://localhost:8001';
const NESTJS_URL = 'http://localhost:3000';

async function testPythonService() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 1: Python Service - Classificação Direta');
  console.log('='.repeat(60));

  const testQueries = [
    'honda civic 2011 manual',
    '15 resultados de iphone usado',
    'celular samsung galaxy',
    'notebook dell gamer',
    'moto yamaha fazer 250'
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n📝 Query: "${query}"`);
      
      const response = await fetch(`${PYTHON_URL}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        console.log(`❌ Erro: ${response.status}`);
        continue;
      }

      const result = await response.json();
      console.log(`✅ Categoria: ${result.category}`);
      console.log(`   Confiança: ${result.confidence}`);
      console.log(`   Scrapers: ${result.recommended_scrapers.join(', ')}`);
      console.log(`   Condição: ${result.condition}`);
      console.log(`   Limite: ${result.result_limit || 'não especificado'}`);
      console.log(`   Ano: ${result.detected_year || 'N/A'}`);
      console.log(`   Marca: ${result.detected_brand || 'N/A'}`);
      console.log(`   Campos faltantes: ${result.missing_fields?.join(', ') || 'nenhum'}`);
      
      if (result.suggested_question) {
        console.log(`   ❓ Pergunta: ${result.suggested_question}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
}

async function testNestJSIntegration() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 2: NestJS - Integração com Python');
  console.log('='.repeat(60));

  const testCases = [
    {
      query: 'honda civic 2011',
      description: 'Busca de carro (deve perguntar quantidade)'
    },
    {
      query: '20 resultados de iphone 13 usado',
      description: 'Busca completa (sem perguntas)'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📝 ${testCase.description}`);
      console.log(`   Query: "${testCase.query}"`);
      
      const response = await fetch(`${NESTJS_URL}/api/v1/search/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testCase.query })
      });

      if (!response.ok) {
        console.log(`❌ Erro: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Detalhes: ${errorText}`);
        continue;
      }

      const result = await response.json();
      
      if (result.needsQuestion) {
        console.log(`❓ Precisa fazer pergunta:`);
        console.log(`   Pergunta: ${result.question}`);
        console.log(`   Campos faltantes: ${result.missingFields.join(', ')}`);
      } else {
        console.log(`✅ Busca executada:`);
        console.log(`   Total de resultados: ${result.total}`);
        console.log(`   Produtos encontrados: ${result.results.length}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
}

async function testHealthChecks() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 3: Health Checks');
  console.log('='.repeat(60));

  // Python Service
  try {
    console.log('\n🐍 Python Service:');
    const response = await fetch(`${PYTHON_URL}/health`);
    const data = await response.json();
    console.log(`   Status: ${data.status}`);
    console.log(`   Classificador: ${data.classifier}`);
  } catch (error) {
    console.log(`   ❌ Offline: ${error.message}`);
  }

  // NestJS
  try {
    console.log('\n🟢 NestJS API:');
    const response = await fetch(`${NESTJS_URL}/api/v1/health`);
    const data = await response.json();
    console.log(`   Status: ${data.status}`);
  } catch (error) {
    console.log(`   ❌ Offline: ${error.message}`);
  }
}

async function testHotReload() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 4: Hot-Reload de Configurações');
  console.log('='.repeat(60));

  try {
    console.log('\n🔄 Recarregando configurações...');
    const response = await fetch(`${PYTHON_URL}/api/reload-config`, {
      method: 'POST'
    });

    if (!response.ok) {
      console.log(`❌ Erro: ${response.status}`);
      return;
    }

    const result = await response.json();
    console.log(`✅ ${result.message}`);
    console.log(`   Categorias: ${result.categories}`);
    console.log(`   Sinônimos: ${result.synonyms}`);
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTE END-TO-END - INTEGRAÇÃO COMPLETA');
  console.log('Python Service + NestJS + Frontend');
  console.log('='.repeat(60));

  await testHealthChecks();
  await testPythonService();
  await testNestJSIntegration();
  await testHotReload();

  console.log('\n' + '='.repeat(60));
  console.log('TODOS OS TESTES CONCLUÍDOS!');
  console.log('='.repeat(60));
}

// Executar testes
runAllTests().catch(console.error);
