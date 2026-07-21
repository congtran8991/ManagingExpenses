// src/modules/wallets/wallets.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto, @Req() req: any) {
    const userId = req.user.id; // Lấy an toàn từ JwtAuthGuard
    return this.walletsService.create(userId, createWalletDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.walletsService.findAllByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: any, @Req() req: any) {
    const userId = req.user.id;
    return this.walletsService.updateInfo(id, userId, updateWalletDto);
  }
}
