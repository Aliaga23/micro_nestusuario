import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el correo ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { correo: registerDto.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.contrasena, saltRounds);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        nombre: registerDto.nombre,
        correo: registerDto.correo,
        contrasena: hashedPassword,
        rolId: registerDto.rolId,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rolId: true,
        role: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Generar token
    const payload = { correo: user.correo, sub: user.id, rolId: user.rolId };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Usuario registrado exitosamente',
      user,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { correo: loginDto.correo },
      include: {
        role: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.contrasena, user.contrasena);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const payload = { correo: user.correo, sub: user.id, rolId: user.rolId };
    const token = this.jwtService.sign(payload);

    // Remover contraseña de la respuesta
    const { contrasena, ...result } = user;

    return {
      message: 'Login exitoso',
      user: result,
      access_token: token,
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rolId: true,
        role: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return user;
  }
}
