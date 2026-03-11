import { Controller, Post, Delete, Get, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(@CurrentUser() user: any, @Body() productData: any) {
    const userId = user?.userId || user?.id;
    this.logger.log(`Adicionando favorito para usuário: ${userId}`);
    this.logger.debug(`Dados do produto recebidos: ${JSON.stringify(productData)}`);
    
    if (!userId) {
      this.logger.error('Usuário não encontrado ou inválido');
      throw new Error('Usuário não autenticado');
    }
    
    if (!productData || !productData.id) {
      this.logger.error('Dados do produto inválidos');
      throw new Error('Dados do produto inválidos');
    }
    
    return this.favoritesService.addFavorite(userId, productData);
  }

  @Delete(':id')
  async removeFavorite(@CurrentUser() user: any, @Param('id') favoriteId: string) {
    const userId = user?.userId || user?.id;
    await this.favoritesService.removeFavorite(userId, favoriteId);
    return { success: true };
  }

  @Get()
  async getUserFavorites(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id;
    this.logger.log(`Carregando favoritos para usuário: ${userId}`);
    
    if (!userId) {
      this.logger.error('Usuário não encontrado ou inválido');
      throw new Error('Usuário não autenticado');
    }
    
    return this.favoritesService.getUserFavorites(userId);
  }

  @Get('check/:productId')
  async checkFavorite(@CurrentUser() user: any, @Param('productId') productId: string) {
    const userId = user?.userId || user?.id;
    const isFavorite = await this.favoritesService.isFavorite(userId, productId);
    return { isFavorite };
  }
}
