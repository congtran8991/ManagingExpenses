import { Controller, Get } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@GetUser() user: any) {
    if (!user) return null;

    // Omit sensitive data like password
    const { password, ...result } = user;
    return result;
  }

  @Get('abc')
  getAllUser() {
    return 'abc';
  }
}
