import { Controller, Get, UseGuards, Req, Post, Body, Res, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { Response } from "express";
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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto.email, dto.password);
  
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
  
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  
    return { user, accessToken }; // ✅ NEVER return tokens in body
  }
  
  @Post("refresh")
async refresh(
  @Req() req: any,
  @Res({ passthrough: true }) res: Response
) {
  const { newAccessToken, newRefreshToken } =
    await this.authService.refreshToken(req);

  res.cookie("access_token", newAccessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/auth/refresh",
  });

  return { success: true };
}

  
@Post("logout")
async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
  const userId = req.user?.userId;
  await this.authService.logOut(userId);
  
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  return { success: true };
}

}