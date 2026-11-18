import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Get,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UserRoles } from '../common/enums/user-roles.enum.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { FindUserDto } from './dto/find-user.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Create a STAFF or ADMIN account' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Roles(UserRoles.ADMIN)
  findAll(@Query() query: FindUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('email/:email')
  @Roles(UserRoles.ADMIN)
  findUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to update this user',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot change your own role or status',
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: { userId: number; role: UserRoles },
  ) {
    return await this.usersService.updateUser(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Deactivate and delete a user' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete yourself or a user with active assignments',
  })
  async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: { userId: number; role: UserRoles },
  ) {
    return await this.usersService.removeUser(id, actor);
  }
}
