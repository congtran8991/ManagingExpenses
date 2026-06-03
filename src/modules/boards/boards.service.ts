import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {
    //constructor
  }

  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        members: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Không tìm thấy bảng công việc');
    }

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((member) => member.id === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('Bạn không có quyền truy cập bảng công việc này');
    }

    return board;
  }

  async remove(userId: string, id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException('Không tìm thấy bảng công việc');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Chỉ chủ sở hữu mới có quyền xóa bảng công việc');
    }

    await this.prisma.board.delete({
      where: { id },
    });

    return { message: 'Đã xóa bảng công việc thành công' };
  }
}
