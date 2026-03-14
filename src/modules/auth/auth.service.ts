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

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const monthKey = now.toISOString().slice(0, 7);

      const userDoc = await usersRef.add({
        email,
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
