import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "dotenv/config";

const cookieParser = require("cookie-parser"); // ✅ CORRECT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ✅ works perfectly

  // app.enableCors({
  //   origin: "http://localhost:3200",
  //   credentials: true,
  // });
  app.enableCors({ origin: '*' });
  //await app.listen(4000);
  await app.listen(process.env.PORT || 4000);
}

bootstrap();
