import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Query,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto, FetchTodoDto, UpdateTodoDto } from './todo.dto';
import { User as UserEntity } from '../user/user.entity';
import { Todo as TodoEntity } from './todo.entity';
import { User, Todo } from '../decorators';
import { TodoOwnerGuard } from '../guards/todo.guard';
import { AuthGuard } from '../guards/auth.guard';
import { TaskService } from '../task/task.service';
import { GetTodoTasksDto } from '../task/task.dto';

@UseGuards(AuthGuard)
@ApiTags('Todo')
@Controller('api/v1/todo')
/**
 * Controller class for handling Todo-related operations.
 */
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly taskService: TaskService,
  ) {}

  @Post('/')
  @HttpCode(201)
  /**
   * Create a new todo.
   *
   * @param data - The data for creating the todo.
   * @param user - The user entity.
   */
  async create(@Body() data: CreateTodoDto, @User() user: UserEntity) {
    return this.todoService.createTodo(user, data);
  }

  @Get('/')
  @HttpCode(200)
  /**
   * Fetches todos based on the provided data and user.
   *
   * @param data - The data used to filter the todos.
   * @param user - The user entity object.
   */
  async fetch(@Query() data: FetchTodoDto, @User() user: UserEntity) {
    return this.todoService.findAllTodos(user, data);
  }

  @UseGuards(TodoOwnerGuard)
  @Get('/:todoId')
  @HttpCode(200)
  /**
   * Retrieves a single todo item by its ID.
   * @param _id - The ID of the todo item.
   * @param todo - The todo item entity.
   */
  async getOne(@Param('todoId') _id: string, @Todo() todo: TodoEntity) {
    return todo;
  }

  @UseGuards(TodoOwnerGuard)
  @Patch('/:todoId')
  @HttpCode(200)
  /**
   * Updates a todo item.
   * @param data - The data to update the todo item with.
   * @param todo - The todo item to be updated.
   */
  async update(@Body() data: UpdateTodoDto, @Todo() todo: TodoEntity) {
    return this.todoService.updateTodo(todo, data);
  }

  @UseGuards(TodoOwnerGuard)
  @Delete('/:todoId')
  @HttpCode(204)
  /**
   * Deletes a todo item.
   * @param {string} _id - The ID of the todo item to be deleted.
   * @param {TodoEntity} todo - The todo item to be deleted.
   * @returns An empty object indicating the deletion was successful.
   */
  async delete(@Param('todoId') _id: string, @Todo() todo: TodoEntity) {
    await this.todoService.deleteTodo(todo);
    return {};
  }

  @UseGuards(TodoOwnerGuard)
  @Get('/:todoId/tasks')
  @HttpCode(200)
  /**
   * Retrieves all tasks for a specific todo.
   *
   * @param {string} _id - The ID of the todo.
   * @param {GetTodoTasksDto} query - The query parameters for filtering tasks.
   * @param {TodoEntity} todo - The todo entity.
   * @returns  A promise that resolves to the list of tasks.
   */
  async getTasks(
    @Param('todoId') _id: string,
    @Query() query: GetTodoTasksDto,
    @Todo() todo: TodoEntity,
  ) {
    return this.taskService.findAllTasks(todo, query);
  }
}
