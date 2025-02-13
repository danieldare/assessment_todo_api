import { ILike, Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto, GetTodoTasksDto } from './task.dto';
import { TodoService } from '../todo/todo.service';
import constants from '../constants';
import { Todo } from '../todo/todo.entity';
import { PaginatedResponse, TaskStatus } from '../types';
import { User } from '../user/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
    private todoService: TodoService,
  ) {}

  async createTask(
    { todoId, ...rest }: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    const todo = await this.todoService.findOneTodo(todoId, true);
    if (!todo) throw new NotFoundException(constants);
    if (todo.user.id !== user.id)
      throw new BadRequestException(constants.FORBIDDEN_MESSAGE);
    const task = this.tasksRepository.create({ todo, ...rest });
    return this.tasksRepository.save(task);
  }

  async findAllTasks(
    todo: Todo,
    { pageNumber = '1', pageSize = '30', search = '' }: GetTodoTasksDto,
  ): Promise<PaginatedResponse<Task>> {
    const page = +pageNumber;
    const size = +pageSize;
    const searchQuery = search.trim();
    const skip = (page - 1) * size;

    const where: Record<string, unknown> = { todo: { id: todo.id } };

    if (searchQuery) where.name = ILike(`%${searchQuery}%`);

    const [tasks, total] = await this.tasksRepository.findAndCount({
      where,
      skip,
      take: size,
      order: { createdAt: 'DESC' },
    });
    return {
      data: tasks,
      pagination: {
        pageNumber: page,
        pageSize: size,
        total,
      },
    };
  }

  async findOneTask(id: string, withRelations = false): Promise<Task | null> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: withRelations ? ['todo', 'todo.user'] : [],
    });
    return task;
  }

  async updateTask(task: Task, dto: UpdateTaskDto): Promise<Task> {
    Object.assign(task, dto);
    return this.tasksRepository.save(task);
  }

  async markAsCompleted(task: Task): Promise<Task> {
    if (task.status === TaskStatus.COMPLETED)
      throw new BadRequestException(constants.ALREADY_COMPLETED);

    task.status = TaskStatus.COMPLETED;
    return this.tasksRepository.save(task);
  }

  async deleteTask(task: Task): Promise<void> {
    await this.tasksRepository.softDelete(task.id);
  }
}
