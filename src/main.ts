import {
  WinstonModule,
  utilities as nestWinstonModuleUtil,
} from "nest-winston";
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from "@nestjs/swagger";
import * as helmet from "helmet";
import * as winston from "winston";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as WinstonDialyRotateFile from "winston-daily-rotate-file";

async function bootstrap() {
  const loggerTransport: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.json(),
        nestWinstonModuleUtil.format.nestLike(process.env.APP_NAME, {
          prettyPrint: true,
        })
      ),
    }),
  ];
  if (process.env.ENV === "production") {
    loggerTransport.push(
      new WinstonDialyRotateFile({
        dirname: `${process.cwd()}/logs`,
        zippedArchive: true,
        filename: "errors-%DATE%.log",
        maxFiles: "14d",
        maxSize: "5m",
      })
    );
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      level: process.env.ENV !== "production" ? "info" : "warn",
      format: winston.format.combine(
        winston.format.errors({ stack: true, context: true }),
        winston.format.ms(),
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: loggerTransport,
    }),
  });

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>("PORT");

  app.useStaticAssets(`${process.cwd()}/uploaded-document`, {
    prefix: "/public/",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.setGlobalPrefix("api");

  app.use(compression());
  app.use(helmet());

  app.use(bodyParser.json({ limit: "2mb" }));
  app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "*",
    credentials: false,
  });

  if (configService.get("ENV") !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Medicate Api Documentation")
      .setDescription("Medicate list api")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT",
          description:
            "For authentication, add `Authorization` header with value of `Bearer {the token}`",
        },
        "JwtAuth"
      )
      .build();

    const swaggerCustomOption: SwaggerCustomOptions = {
      customSiteTitle: `${configService.get("APP_NAME")} API Docs`,
      swaggerOptions: {
        tagsSorter: "alpha",
        operationsSorter: "alpha",
        authAction: {
          JwtAuth: {
            name: "JwtAuth",
            schema: {
              description: "Default",
              type: "http",
              in: "header",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
            value:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSGF5ZXMgR3JvdXAiLCJpZCI6NCwidXNlcm5hbWUiOiJ0aGlyZF9wYXJ0eSIsInJvbGUiOiJUSElSRF9QQVJUWSIsImlhdCI6MTY4MDAwMzIwMCwiZXhwIjoxNjgwNjA4MDAwfQ.Jf1OBB0769WFUb7kAkRG45vHiH2zaHuMRT1LC6eH0ZM",
          },
        },
      },
    };

    const swaggerDocumentOption: SwaggerDocumentOptions = {
      operationIdFactory: (_: string, methodKey: string) => methodKey,
    };

    const document = SwaggerModule.createDocument(
      app,
      config,
      swaggerDocumentOption
    );
    SwaggerModule.setup("api/docs", app, document, swaggerCustomOption);
  }

  await app.listen(appPort);
}
bootstrap();
