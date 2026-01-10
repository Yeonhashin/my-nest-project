import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(4)                     
    @MaxLength(8)  
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()-_=+]{4,8}$/, {
        message: '패스워드에는 영문자와 숫자가 하나 이상 포함되어야 합니다.',
    })                  
    password: string;

    @IsString()
    nickname: string;
}