import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
};

initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

async function addCreditsToUser() {
  try {
    const email = process.argv[2] || 'admin@zavlo.ia';
    const credits = parseInt(process.argv[3]) || 999999;

    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      console.log(`❌ Usuário ${email} não encontrado`);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      credits,
      plan: 'business',
      updatedAt: new Date(),
    });

    console.log(`✅ Créditos atualizados com sucesso!`);
    console.log(`📧 Email: ${email}`);
    console.log(`💰 Créditos: ${credits.toLocaleString()}`);
    console.log(`🎯 Plano: Business`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

addCreditsToUser();
