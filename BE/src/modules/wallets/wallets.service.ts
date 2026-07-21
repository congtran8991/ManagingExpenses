// src/modules/wallets/wallets.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateWalletDto) {
    return this.prisma.wallet.create({
      data: {
        ...dto,
        userId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInfo(id: string, userId: number, dto: any) {
    // Không cho phép sửa trực tiếp số dư (balance) qua API này
    const { balance, ...safeDto } = dto;

    return this.prisma.wallet.updateMany({
      where: { id, userId } as any,
      data: safeDto,
    });
  }

  /**
   * 🌟 ENGINE NỘI BỘ: Thay đổi số dư bằng Database Transaction
   * Được gọi từ các tầng Workflow (Chuyển ví, Ghi hóa đơn)
   */
  async changeBalanceWithTx(tx: any, walletId: string, amount: number, actionType: 'CREDIT' | 'DEBIT') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new NotFoundException('Không tìm thấy ví yêu cầu.');

    // Tính toán số dư mới (DEBIT = Trừ tiền, CREDIT = Cộng tiền)
    const change = actionType === 'DEBIT' ? -amount : amount;
    const newBalance = Number(wallet.balance) + change;

    // Chốt chặn Senior: Không cho phép ví tiền mặt hoặc ngân hàng bị âm tiền
    if (wallet.type !== 'CREDIT' && newBalance < 0) {
      throw new BadRequestException(`Ví "${wallet.name}" không đủ số dư để thực hiện.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return tx.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });
  }
}
