import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListingsService } from './listings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('listings')
export class ListingsController {
  private readonly logger = new Logger(ListingsController.name);

  constructor(private listingsService: ListingsService) {}

  // =====================================================
  // PUBLIC ENDPOINTS - More specific routes first
  // =====================================================
  
  @Get('public')
  async getPublicListings() {
    return this.listingsService.getAllActiveListings();
  }

  @Get('public/search')
  async searchListings(@Query('q') query: string) {
    if (!query) {
      return this.listingsService.getAllActiveListings();
    }
    return this.listingsService.searchListings(query);
  }

  @Get('public/category/:category')
  async getListingsByCategory(@Param('category') category: string) {
    return this.listingsService.getListingsByCategory(category);
  }

  // =====================================================
  // PROTECTED ENDPOINTS - Authentication required
  // =====================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  async createListing(@CurrentUser() user: any, @Body() listingData: any) {
    const userId = user?.userId || user?.id;
    this.logger.log(`Criando listing para usuario: ${userId}`);
    return this.listingsService.createListing(userId, listingData);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getUserListings(@CurrentUser() user: any) {
    const userId = user?.userId || user?.id;
    return this.listingsService.getUserListings(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateListing(
    @CurrentUser() user: any,
    @Param('id') listingId: string,
    @Body() updates: any,
  ) {
    const userId = user?.userId || user?.id;
    await this.listingsService.updateListing(userId, listingId, updates);
    return { success: true };
  }

  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@CurrentUser() user: any, @Param('id') listingId: string) {
    const userId = user?.userId || user?.id;
    await this.listingsService.toggleActive(userId, listingId);
    return { success: true };
  }

  @Post(':id/feature')
  @UseGuards(JwtAuthGuard)
  async featureListing(
    @CurrentUser() user: any,
    @Param('id') listingId: string,
    @Body() { days }: { days: number },
  ) {
    const userId = user?.userId || user?.id;
    await this.listingsService.featureListing(userId, listingId, days);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteListing(@CurrentUser() user: any, @Param('id') listingId: string) {
    const userId = user?.userId || user?.id;
    await this.listingsService.deleteListing(userId, listingId);
    return { success: true };
  }

  // =====================================================
  // PUBLIC ENDPOINTS - Less specific routes last
  // =====================================================

  @Get(':id')
  async getListingById(@Param('id') listingId: string) {
    return this.listingsService.getListingById(listingId);
  }

  @Post(':id/view')
  async incrementViews(@Param('id') listingId: string) {
    await this.listingsService.incrementViews(listingId);
    return { success: true };
  }

  @Post(':id/click')
  async incrementClicks(@Param('id') listingId: string) {
    await this.listingsService.incrementClicks(listingId);
    return { success: true };
  }
}

