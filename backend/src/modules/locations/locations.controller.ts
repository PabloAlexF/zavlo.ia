import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get('cep/:cep')
  async getCepData(@Param('cep') cep: string): Promise<any> {
    return this.locationsService.getCepData(cep);
  }

  @Get('states')
  getAllStates() {
    return this.locationsService.getAllStates();
  }
}
