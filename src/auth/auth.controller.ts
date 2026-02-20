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
    console.log("Incoming cookies:", req.headers.cookie);
    
    if (!user) {
      throw new UnauthorizedException();
    }
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

  const isHttps = false; // true only if you use HTTPS locally

  // res.cookie("access_token", accessToken, {
  //   httpOnly: true,
  //   secure: isHttps,
  //   sameSite: isHttps ? "none" : "lax",
  //   domain: ".anylicence.com", // 🔥 REQUIRED
  //   path: "/",
  //   maxAge: 1000 * 60 * 15,
  // });

  // res.cookie("refresh_token", refreshToken, {
  //   httpOnly: true,
  //   secure: isHttps,
  //   sameSite: isHttps ? "none" : "lax",
  //   domain: ".anylicence.com", // 🔥 REQUIRED
  //   path: "/auth/refresh",
  //   maxAge: 1000 * 60 * 60 * 24 * 7,
  // });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true,                 // 🔥 REQUIRED (HTTPS API)
    sameSite: "none",             // 🔥 REQUIRED (cross-site)
    domain: ".anylicence.com",    // 🔥 REQUIRED
    path: "/",
    maxAge: 1000 * 60 * 15,
  });
  
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".anylicence.com",
    path: "/auth/refresh",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  

  return { user };
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
    secure: true,                 // 🔥 REQUIRED
    sameSite: "none",             // 🔥 REQUIRED
    // domain: ".anylicence.com",    // 🔥 REQUIRED
    domain: ".*",    // 🔥 REQUIRED
    path: "/",
    maxAge: 1000 * 60 * 15,
  });

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // domain: ".anylicence.com",
    domain: ".*",    // 🔥 REQUIRED
    path: "/auth/refresh",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return { success: true };
}


  
@Post("logout")
async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
  const userId = req.user?.userId;
  await this.authService.logOut(userId);
  
  // res.clearCookie("access_token");
  // res.clearCookie("refresh_token");
  const isProd = process.env.NODE_ENV === "production";

res.clearCookie("access_token", {
  path: "/",
  domain: isProd ? ".anylicence.com" : undefined,
});

res.clearCookie("refresh_token", {
  path: "/auth/refresh",
  domain: isProd ? ".anylicence.com" : undefined,
});


  return { success: true };
}

}