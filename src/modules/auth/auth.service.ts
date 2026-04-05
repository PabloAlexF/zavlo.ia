import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto, ip: string) {
    try {
      const { email, password, name, phone, location } = registerDto;

      // Verificar se o IP já criou uma conta — Redis primeiro, Firestore como fallback
      const ipKey = `register:ip:${ip}`;
      const ipUsed = await this.redisService.get(ipKey);
      if (ipUsed) {
        this.logger.warn(`[AUTH] IP ${ip} tentou criar segunda conta (Redis)`);
        throw new ForbiddenException(
          'Este dispositivo já possui uma conta cadastrada. Faça login ou entre em contato com o suporte.',
        );
      }

      // Fallback: checar Firestore caso Redis tenha perdido a chave
      const firestore = this.firebaseService.getFirestore();
      const usersRef = firestore.collection('users');
      const ipInFirestore = await usersRef.where('registrationIp', '==', ip).limit(1).get();
      if (!ipInFirestore.empty) {
        this.logger.warn(`[AUTH] IP ${ip} tentou criar segunda conta (Firestore fallback)`);
        // Restaurar chave no Redis para evitar consultas futuras ao Firestore
        await this.redisService.set(ipKey, ipInFirestore.docs[0].id, 31536000);
        throw new ForbiddenException(
          'Este dispositivo já possui uma conta cadastrada. Faça login ou entre em contato com o suporte.',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await usersRef.where('email', '==', email).get();
      if (!existingUser.empty) {
        throw new ConflictException('Email já cadastrado');
      }

      let firebaseUid: string | null = null;
      const firebaseAuth = this.firebaseService.getAuth();
      if (firebaseAuth) {
        try {
          const existingFirebaseUser = await firebaseAuth.getUserByEmail(email).catch(() => null);
          if (existingFirebaseUser) {
            firebaseUid = existingFirebaseUser.uid;
          } else {
            const createdFirebaseUser = await firebaseAuth.createUser({
              email,
              password,
              displayName: name,
            });
            firebaseUid = createdFirebaseUser.uid;
          }
        } catch (firebaseError) {
          this.logger.warn(`[AUTH] Falha ao sincronizar usuário no Firebase Auth para ${email}: ${firebaseError.message}`);
        }
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const monthKey = now.toISOString().slice(0, 7);

      const userDoc = await usersRef.add({
        email,
        firebaseUid,
        password: hashedPassword,
        name,
        phone: phone || null,
        location: location || null,
        registrationIp: ip,
        plan: 'free',
        billingCycle: 'monthly',
        planStartedAt: now,
        planExpiresAt: null,
        credits: 1,
        freeTrialUsed: false,
        textSearchesToday: 0,
        imageSearchesToday: 0,
        textSearchesThisMonth: 0,
        imageSearchesThisMonth: 0,
        lastUsageDate: today,
        lastMonthKey: monthKey,
        createdAt: now,
        updatedAt: now,
      });

      // Marcar IP como usado — expira em 1 ano
      await this.redisService.set(ipKey, userDoc.id, 31536000);

      this.logger.log(`Novo usuário cadastrado: ${email} (IP: ${ip})`);

      const tokens = await this.generateTokens(userDoc.id, email);
      return {
        userId: userDoc.id,
        email,
        name,
        plan: 'free',
        credits: 1,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Erro ao cadastrar usuário:', error);
      throw new InternalServerErrorException('Erro ao cadastrar usuário');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const firestore = this.firebaseService.getFirestore();
      const usersRef = firestore.collection('users');

      const userSnapshot = await usersRef.where('email', '==', email).get();
      if (userSnapshot.empty) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      this.logger.log(`Login realizado: ${email}`);

      const tokens = await this.generateTokens(userDoc.id, email);
      return { 
        userId: userDoc.id,
        email: userData.email,
        name: userData.name,
        firebaseUid: userData.firebaseUid || null,
        plan: userData.plan || 'free',
        credits: userData.credits ?? 0,
        billingCycle: userData.billingCycle || null,
        planExpiresAt: userData.planExpiresAt || null,
        ...tokens 
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Erro ao fazer login:', error);
      throw new InternalServerErrorException('Erro ao fazer login');
    }
  }

  async firebaseLogin(idToken: string, ip: string = 'unknown') {
    try {
      const firebaseAuth = this.firebaseService.getAuth();
      if (!firebaseAuth) {
        throw new InternalServerErrorException('Firebase Auth não está configurado');
      }

      const decoded = await firebaseAuth.verifyIdToken(idToken);
      const firestore = this.firebaseService.getFirestore();
      const usersRef = firestore.collection('users');

      const decodedEmail = decoded.email || null;
      const phoneNumber = decoded.phone_number || null;
      const fallbackEmail = decodedEmail || (phoneNumber ? `phone:${phoneNumber}` : `firebase:${decoded.uid}`);

      let userDoc = null as any;
      let userData = null as any;

      const byFirebaseUid = await usersRef.where('firebaseUid', '==', decoded.uid).limit(1).get();
      if (!byFirebaseUid.empty) {
        userDoc = byFirebaseUid.docs[0];
        userData = userDoc.data();
      }

      if (!userDoc && decodedEmail) {
        const byEmail = await usersRef.where('email', '==', decodedEmail).limit(1).get();
        if (!byEmail.empty) {
          userDoc = byEmail.docs[0];
          userData = userDoc.data();
          await userDoc.ref.update({ firebaseUid: decoded.uid, updatedAt: new Date() });
        }
      }

      if (!userDoc && phoneNumber) {
        const byPhone = await usersRef.where('phone', '==', phoneNumber).limit(1).get();
        if (!byPhone.empty) {
          userDoc = byPhone.docs[0];
          userData = userDoc.data();
          await userDoc.ref.update({ firebaseUid: decoded.uid, updatedAt: new Date() });
        }
      }

      if (!userDoc) {
        // Verificar bloqueio por IP antes de criar nova conta via Firebase
        const ipKey = `register:ip:${ip}`;
        if (ip !== 'unknown') {
          const ipUsed = await this.redisService.get(ipKey);
          if (ipUsed) {
            this.logger.warn(`[AUTH] IP ${ip} tentou criar segunda conta via Firebase (Redis)`);
            throw new ForbiddenException(
              'Este dispositivo já possui uma conta cadastrada. Faça login com sua conta existente ou entre em contato com o suporte.',
            );
          }

          // Fallback: checar Firestore
          const ipInFirestore = await usersRef
            .where('registrationIp', '==', ip)
            .limit(1)
            .get();
          if (!ipInFirestore.empty) {
            this.logger.warn(`[AUTH] IP ${ip} tentou criar segunda conta via Firebase (Firestore fallback)`);
            await this.redisService.set(ipKey, ipInFirestore.docs[0].id, 31536000);
            throw new ForbiddenException(
              'Este dispositivo já possui uma conta cadastrada. Faça login com sua conta existente ou entre em contato com o suporte.',
            );
          }
        } else {
          this.logger.warn('[AUTH] IP desconhecido na criação de conta via Firebase. Bloqueio por IP ignorado.');
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const monthKey = now.toISOString().slice(0, 7);

        userDoc = await usersRef.add({
          email: fallbackEmail,
          firebaseUid: decoded.uid,
          password: null,
          name: decoded.name || 'Usuário',
          phone: phoneNumber,
          location: null,
          registrationIp: ip,
          plan: 'free',
          billingCycle: 'monthly',
          planStartedAt: now,
          planExpiresAt: null,
          credits: 1,
          freeTrialUsed: false,
          textSearchesToday: 0,
          imageSearchesToday: 0,
          textSearchesThisMonth: 0,
          imageSearchesThisMonth: 0,
          lastUsageDate: today,
          lastMonthKey: monthKey,
          createdAt: now,
          updatedAt: now,
        });

        // Marcar IP como usado no Redis — expira em 1 ano
        if (ip !== 'unknown') {
          await this.redisService.set(ipKey, userDoc.id, 31536000);
        }
        this.logger.log(`Novo usuário via Firebase: ${fallbackEmail} (IP: ${ip})`);

        userData = {
          email: fallbackEmail,
          firebaseUid: decoded.uid,
          name: decoded.name || 'Usuário',
          plan: 'free',
          credits: 1,
          billingCycle: 'monthly',
          planExpiresAt: null,
        };
      }

      const tokens = await this.generateTokens(userDoc.id, userData.email || fallbackEmail);
      return {
        userId: userDoc.id,
        email: userData.email || fallbackEmail,
        name: userData.name || decoded.name || 'Usuário',
        firebaseUid: decoded.uid,
        plan: userData.plan || 'free',
        credits: userData.credits ?? 0,
        billingCycle: userData.billingCycle || null,
        planExpiresAt: userData.planExpiresAt || null,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Erro no login Firebase: ${error.message}`);
      throw new UnauthorizedException('Token Firebase inválido ou expirado');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async validateUser(userId: string) {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }

    return { id: userDoc.id, ...userDoc.data() };
  }
}
