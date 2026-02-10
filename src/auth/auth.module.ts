import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Adminuser, AdminuserSchema } from "./schema/admin.schema";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";

import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    PassportModule,
    ConfigModule, // 👈 required
    MongooseModule.forFeature([{ name: Adminuser.name, schema: AdminuserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
