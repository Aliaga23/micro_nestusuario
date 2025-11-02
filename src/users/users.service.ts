import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async findOne(id: number): Promise<User | null> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return foundUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });
      return updatedUser;
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async remove(id: number): Promise<User> {
    const deletedUser = await this.prismaService.user.delete({
      where: { id },
    });

    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return deletedUser;
  }
}
