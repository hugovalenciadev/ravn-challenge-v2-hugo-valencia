import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { bcrypt } from 'bcrypt';
import { UsersService, UserWithUserRole } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<UserWithUserRole | null> {
    const user = await this.usersService.findFirst({
      email: email,
    });

    if (user) {
      const result = await bcrypt.compare(password, user.password);
      return result ? user : null;
    }

    return null;
  }

  async signin(user: UserWithUserRole) {
    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload = { username: user.email, sub: user.id, roles: roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
