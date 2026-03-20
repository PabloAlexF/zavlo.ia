import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
};

initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Criar usuário admin
    const adminData = {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin Zavlo',
      role: 'admin',
      credits: 999999,
      plan: 'unlimited',
      planExpiry: new Date('2099-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      permissions: [
        'manage_users',
        'manage_products',
        'manage_credits',
        'view_analytics',
        'unlimited_searches',
      ],
    };

    // Verificar se já existe
    const existingUser = await db
      .collection('users')
      .where('email', '==', adminEmail)
      .get();

    if (!existingUser.empty) {
      console.log('⚠️  Usuário admin já existe. Atualizando...');
      const docId = existingUser.docs[0].id;
      await db.collection('users').doc(docId).update({
        ...adminData,
        password: hashedPassword,
      });
      console.log('✅ Admin atualizado com sucesso!');
    } else {
      await db.collection('users').add(adminData);
      console.log('✅ Admin criado com sucesso!');
    }

    console.log('\n📋 Credenciais do Admin:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Senha:    ${adminPassword}`);
    console.log(`Créditos: ${adminData.credits.toLocaleString()}`);
    console.log(`Plano:    ${adminData.plan}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
}

createAdminUser();
