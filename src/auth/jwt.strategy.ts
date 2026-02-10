// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { ExtractJwt, Strategy } from "passport-jwt";
// import { Request } from "express";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         // ✅ 1. Authorization header
//         ExtractJwt.fromAuthHeaderAsBearerToken(),

//         // ✅ 2. Cookie support
//         (req: Request) => {
//           return req?.cookies?.access_token;
//         },
//       ]),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET!, // MUST exist
//     });
//   }

//   // async validate(payload: any) {
//   //   return {
//   //     userId: payload.sub,
//   //     role: payload.role,
//   //   };
//   // }

//   async validate(payload: any) {
//     return {
//       userId: payload.sub,
//       email: payload.email,
//       role: payload.role,
//       name: payload.name,
//     };
//   }
  
// }


// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';

// @Injectable()
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (req) => req?.cookies?.access_token,
//       ]),
//       secretOrKey: configService.get<string>("JWT_SECRET"),
//     });
//   }

//   async validate(payload: any) {
//   console.log('JWT PAYLOAD:', payload);
//   return {
//     userId: payload.sub,
//     email: payload.email,
//     role: payload.role,
//     name: payload.name,
//   };
// }

// }

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Adminuser, AdminuserDocument } from "./schema/admin.schema";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Adminuser.name)
    private userModel: Model<AdminuserDocument>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,
      ]),
      secretOrKey: process.env.JWT_SECRET || "supersecretkey123",
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub).lean();

    if (!user) return null;

    // 🔥 THIS OBJECT BECOMES req.user
    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user?.name,
    };
  }
}



