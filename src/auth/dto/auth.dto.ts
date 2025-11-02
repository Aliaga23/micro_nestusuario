import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @IsString()
  contrasena: string;

  @IsNumber()
  rolId: number;
}

export class LoginDto {
  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @IsString()
  contrasena: string;
}