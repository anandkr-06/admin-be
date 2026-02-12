import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "dotenv/config";

const cookieParser = require("cookie-parser"); // ✅ CORRECT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ✅ works perfectly

  const allowedOrigins = [
    "https://devadmin.anylicence.com",
    "https://admin.anylicence.com", // add other domains if needed
    "http://localhost:3200",
     "http://localhost:3000"
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,  // allow cookies or auth headers
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization, Accept",
  });
  
  
  //await app.listen(4000);
  const isProd = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProd ? "production" : "development"} mode...`);
  
  await app.listen(process.env.PORT || isProd ? 3000 : 4000);
}

bootstrap();
