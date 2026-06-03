import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(userId, createBoardDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.boardsService.findAll(userId);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.boardsService.findOne(userId, id);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.boardsService.remove(userId, id);
  }
}
