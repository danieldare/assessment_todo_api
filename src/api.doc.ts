import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('Todo list API')
    .setDescription('A collection of API Endpoints for managing a todo list.')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Todo', 'Todo list endpoints')
    .addTag('Task', 'Todo task endpoint')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};
