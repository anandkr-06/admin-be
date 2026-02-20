import { Controller, Get, UseGuards, Req, Post, Body, Res, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}


  @UseGuards(JwtAuthGuard)
@Get("me")
me(@Req() req: any) {
  const user = req.user;

  return {
    id: user.userId,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}





  @Post("login")
async login(@Body() dto: LoginDto) {
  const { accessToken, refreshToken, user } =
    await this.authService.login(dto.email, dto.password);

  return {
    accessToken,
    refreshToken, // optional
    user,
  };
}

  
@Post("refresh")
async refresh(@Req() req: any) {
  const auth = req.headers.authorization;
  if (!auth) throw new UnauthorizedException();

  const refreshToken = auth.replace("Bearer ", "");

  const tokens = await this.authService.refreshToken(refreshToken);
  return tokens;
}


  
@Post("logout")
logout() {
  return { success: true };
}

}