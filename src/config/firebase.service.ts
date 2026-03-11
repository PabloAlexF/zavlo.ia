import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firestore: admin.firestore.Firestore;
  private auth: admin.auth.Auth;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {
    try {
      if (!admin.apps.length) {
        const projectId = this.configService.get('FIREBASE_PROJECT_ID');
        const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
        const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');

        if (!projectId || !privateKey || !clientEmail) {
          const isDevelopment = this.configService.get('NODE_ENV') !== 'production';
          if (isDevelopment) {
            this.logger.warn('Firebase credentials missing - running in development mode without Firebase');
            return;
          }
          throw new Error('Firebase credentials missing in .env');
        }

        const app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });
        
        this.firestore = app.firestore();
        this.auth = app.auth();
        this.logger.log('Firebase initialized successfully');
      } else {
        this.firestore = admin.app().firestore();
        this.auth = admin.app().auth();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error.message);
      const isDevelopment = this.configService.get('NODE_ENV') !== 'production';
      if (!isDevelopment) {
        throw error;
      }
    }
  }

  getFirestore(): admin.firestore.Firestore | null {
    if (!this.firestore) {
      this.logger.warn('Firestore not initialized - Firebase credentials missing');
      return null;
    }
    return this.firestore;
  }

  getAuth(): admin.auth.Auth | null {
    if (!this.auth) {
      this.logger.warn('Auth not initialized - Firebase credentials missing');
      return null;
    }
    return this.auth;
  }
}
