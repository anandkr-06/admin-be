import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Adminuser, AdminuserDocument } from "./schema/admin.schema";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Adminuser.name) private userModel: Model<AdminuserDocument>,
    private jwtService: JwtService
  ) {}
  
  // async login(email: string, password: string) {
    
  //     console.log("JWT SIGN SECRET =", this.jwtService["options"]?.secret);
    
    
    
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     throw new UnauthorizedException("Invalid credentials");
  //   }

  //   const valid = await bcrypt.compare(password, user.password);
  //   if (!valid) throw new UnauthorizedException("Invalid credentials");

  //   const payload = { sub: user._id, role: user.role,email:user.email };

  //   const token = this.jwtService.sign(payload);

  //   return {
  //     accessToken: token,
  //     role: user.role,
  //     user: {
  //       "id":user._id,
  //       "email":user.email,
  //       "role":user.role
  //     }
  //   };
  // }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException();
  
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException();
  
    const payload = { sub: user._id, role: user.role };
  
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
    });
  
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "7d",
    });
  
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();
  
    return {
      accessToken,
      refreshToken, // ✅ MUST be returned
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name:user.name,
      },
    };
  }
  
  async refreshToken(req: any) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException();
  
    const payload = this.jwtService.verify(refreshToken);
  
    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }
  
    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException();
  
    // 🔁 ROTATE TOKENS
    const newAccessToken = this.jwtService.sign(
      { sub: user._id, role: user.role },
      { expiresIn: "15m" }
    );
  
    const newRefreshToken = this.jwtService.sign(
      { sub: user._id, role: user.role },
      { expiresIn: "7d" }
    );
  
    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();
  
    return {
      newAccessToken,
      newRefreshToken, // ✅ FIX
    };
  }
  
  async logOut(userId){
    if (userId) {
     return await this.userModel.findByIdAndUpdate(userId, {
        refreshToken: null,
      });
    }
  
  }

  // Optional: create a user for testing
  async createUser(email: string, password: string, role: string) {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ email, password: hashed, role });
    return newUser.save();
  }
}
