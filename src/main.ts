import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "dotenv/config";

const cookieParser = require("cookie-parser"); // ✅ CORRECT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ✅ works perfectly

  const allowedOrigins = ["http://localhost:3200", "http://localhost:3000","https://devadminapi.anylicence.com"];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });
  
  //await app.listen(4000);
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
