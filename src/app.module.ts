import { join } from 'path';
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import { config as databaseConfig } from './database/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        return {
          ...databaseConfig,
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          migrations: [join(__dirname, 'database', 'migrations', '*.{ts,js}')],
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    TodoModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
