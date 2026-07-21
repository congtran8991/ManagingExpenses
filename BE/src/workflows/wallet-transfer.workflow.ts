// src/workflows/wallet-transfer.workflow.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { WalletsService } from 'src/modules/wallets/wallets.service';

@Injectable()
export class WalletTransferWorkflow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  async executeTransfer(userId: number, dto: any) {
    const { sourceWalletId, targetWalletId, amount, description } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Trừ tiền ví nguồn (DEBIT)
        const source = await this.walletsService.changeBalanceWithTx(tx, sourceWalletId, amount, 'DEBIT');

        // 2. Cộng tiền ví đích (CREDIT)
        const target = await this.walletsService.changeBalanceWithTx(tx, targetWalletId, amount, 'CREDIT');

        // 3. Ghi chép lịch sử giao dịch loại TRANSFER tự động
        // const log = await this.prisma.budgetTransaction.create({
        //   data: {
        // userId,
        // amount,
        // type: 'TRANSFER',
        // description: description || `Chuyển tiền từ ${source.name} sang ${target.name}`,
        // metadata: { sourceWalletId, targetWalletId },
        //   },
        // });

        return {};
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Giao dịch chuyển tiền nội bộ thất bại.');
    }
  }
}
