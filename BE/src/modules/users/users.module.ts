import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService], // Dùng để đăng kí Depedence Injection của nest js
  exports: [UsersService], // cho phép mamg userService ra ngoài cho các module khác cùng sử dụng
})
export class UsersModule { }
