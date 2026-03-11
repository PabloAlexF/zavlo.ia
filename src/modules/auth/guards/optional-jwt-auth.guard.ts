import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Sobrescreve para não lançar erro se não autenticado
  handleRequest(err: any, user: any) {
    // Se houver erro ou não houver usuário, retorna null (permite acesso)
    if (err || !user) {
      return null;
    }
    return user;
  }
}
