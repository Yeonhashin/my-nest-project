import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // private readonly users = [
  //   { id: 1, email: 'test@test.com', password: '1234' },
  // ];

  // constructor(private jwtService: JwtService) {}

  // async validateUser(email: string, password: string) {
  //   const user = this.users.find(u => u.email === email && u.password === password);
  //   if (user) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  // async login(user: any) {
  //   const payload = { email: user.email, sub: user.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ){}

  async login(email: string, password: string){
    // find by email 
    const user = await this.userService.findByEmail(email);
    if(!user){
      throw new UnauthorizedException('이메일이 올바르지 않습니다.');
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    // JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
    }

    // generate token
    const access_token = this.jwtService.sign(payload);
    console.log(access_token);
    return {
      access_token,
    };
  }
}
