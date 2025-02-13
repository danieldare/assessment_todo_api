import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Get,
  Put,
  Delete,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { Task as TaskEntity } from './task.entity';
import { Task, User } from '../decorators';
import { TaskOwnerGuard } from '../guards/Task.guard';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserEntity } from '../user/user.entity';

@UseGuards(AuthGuard)
@ApiTags('Task')
@Controller('api/v1/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/')
  @HttpCode(201)
  async create(@Body() data: CreateTaskDto, @User() user: UserEntity) {
    return this.taskService.createTask(data, user);
  }

  @UseGuards(TaskOwnerGuard)
  @Get('/:taskId')
  @HttpCode(200)
  async getOne(@Param('taskId') _id: string, @Task() task: TaskEntity) {
    return task;
  }

  @UseGuards(TaskOwnerGuard)
  @Put('/:taskId')
  @HttpCode(200)
  async updateOne(
    @Param('taskId') _id: string,
    @Body() dto: UpdateTaskDto,
    @Task() task: TaskEntity,
  ) {
    return this.taskService.updateTask(task, dto);
  }

  @UseGuards(TaskOwnerGuard)
  @Patch('/:taskId')
  @HttpCode(200)
  async markAsCompleted(@Task() task: TaskEntity) {
    return this.taskService.markAsCompleted(task);
  }

  @UseGuards(TaskOwnerGuard)
  @Delete('/:taskId')
  @HttpCode(204)
  async delete(@Param('taskId') _id: string, @Task() task: TaskEntity) {
    return this.taskService.deleteTask(task);
  }
}
