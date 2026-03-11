import { Controller, Get, Post, Delete, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { IpLimitService, IpLimitStats } from './ip-limit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controller administrativo para gerenciamento de limites de IP
 * Protegido por autenticação JWT
 */
@Controller('admin/ip-limit')
@UseGuards(JwtAuthGuard)
export class IpLimitAdminController {
  private readonly logger = new Logger(IpLimitAdminController.name);

  constructor(private readonly ipLimitService: IpLimitService) {}

  /**
   * GET /admin/ip-limit/stats
   * Obtém estatísticas globais do sistema de limites
   */
  @Get('stats')
  async getGlobalStats() {
    this.logger.log(`[ADMIN] Getting global IP limit stats`);
    return await this.ipLimitService.getGlobalStats();
  }

  /**
   * GET /admin/ip-limit/ip/:ip
   * Obtém estatísticas de um IP específico
   */
  @Get('ip/:ip')
  async getIpStats(@Param('ip') ip: string) {
    this.logger.log(`[ADMIN] Getting stats for IP: ${ip}`);
    return await this.ipLimitService.getStats(ip);
  }

  /**
   * GET /admin/ip-limit/blocked
   * Lista todos os IPs bloqueados
   */
  @Get('blocked')
  async getBlockedIps() {
    this.logger.log(`[ADMIN] Getting blocked IPs`);
    return await this.ipLimitService.getBlockedIps();
  }

  /**
   * POST /admin/ip-limit/clear/:ip
   * Limpa o registro de um IP (reseta limites)
   */
  @Post('clear/:ip')
  async clearIp(@Param('ip') ip: string) {
    this.logger.log(`[ADMIN] Clearing IP: ${ip}`);
    await this.ipLimitService.clearIpLimit(ip);
    return { success: true, message: `IP ${ip} limpo com sucesso` };
  }

  /**
   * POST /admin/ip-limit/block/:ip
   * Bloqueia um IP permanentemente
   */
  @Post('block/:ip')
  async blockIp(
    @Param('ip') ip: string,
    @Query('reason') reason?: string,
  ) {
    this.logger.warn(`[ADMIN] Blocking IP: ${ip}, reason: ${reason}`);
    await this.ipLimitService.blockIp(ip, reason);
    return { success: true, message: `IP ${ip} bloqueado permanentemente` };
  }

  /**
   * POST /admin/ip-limit/unblock/:ip
   * Desbloqueia um IP
   */
  @Post('unblock/:ip')
  async unblockIp(@Param('ip') ip: string) {
    this.logger.log(`[ADMIN] Unblocking IP: ${ip}`);
    await this.ipLimitService.unblockIp(ip);
    return { success: true, message: `IP ${ip} desbloqueado com sucesso` };
  }

  /**
   * GET /admin/ip-limit/history/:ip
   * Obtém histórico de bloqueios de um IP
   */
  @Get('history/:ip')
  async getBlockedHistory(@Param('ip') ip: string) {
    this.logger.log(`[ADMIN] Getting blocked history for IP: ${ip}`);
    return await this.ipLimitService.getBlockedHistory(ip);
  }

  /**
   * POST /admin/ip-limit/reset-daily
   * Reseta contadores diários de todos os IPs
   */
  @Post('reset-daily')
  async resetDaily() {
    this.logger.log(`[ADMIN] Resetting daily counts`);
    const count = await this.ipLimitService.resetDailyCounts();
    return { success: true, message: `Contadores diários resetados`, count };
  }
}
