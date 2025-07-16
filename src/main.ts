import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

/**
 * The function `bootstrap` sets up a NestJS application with OpenAPI documentation, CORS
 * configuration, global validation pipes, and starts the server.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* The code is creating a configuration object for the OpenAPI documentation. */
  const config = new DocumentBuilder()
    .setTitle('Open API example')
    .setDescription('The Open API description')
    .setVersion('1.0')
    .addTag('TEST')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);
  // app.use(bodyParser.json({ limit: '50mb' }));
  // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  const server = await app.listen(process.env.PORT || 3001);
  server.setTimeout(30 * 60 * 1000);
}
bootstrap();
