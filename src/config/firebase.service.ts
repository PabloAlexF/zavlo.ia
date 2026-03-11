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
      throw error;
    }
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  getAuth(): admin.auth.Auth {
    return this.auth;
  }
}
