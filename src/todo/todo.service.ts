import { Injectable } from '@nestjs/common';
import { Todo } from './todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CreateTodoDto, FetchTodoDto, UpdateTodoDto } from './todo.dto';
import { PaginatedResponse } from '../types';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private todosRepository: Repository<Todo>,
  ) {}

  async createTodo(user: User, dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todosRepository.create({ ...dto, user });
    return this.todosRepository.save(todo);
  }

  async findAllTodos(
    user: User,
    { pageNumber = '1', pageSize = '30', search = '' }: FetchTodoDto,
  ): Promise<PaginatedResponse<Todo>> {
    const page = +pageNumber;
    const size = +pageSize;
    const searchQuery = search.trim();
    const skip = (page - 1) * size;

    const where: Record<string, unknown> = { user: { id: user.id } };
    if (searchQuery) where.name = ILike(`%${searchQuery}%`);
    const [todos, total] = await this.todosRepository.findAndCount({
      where,
      skip,
      take: size,
    });
    return {
      data: todos,
      pagination: {
        pageNumber: page,
        pageSize: size,
        total,
      },
    };
  }

  async findOneTodo(
    id: string,
    withUserRelation = false,
  ): Promise<Todo | null> {
    const todo = await this.todosRepository.findOne({
      where: { id },
      relations: withUserRelation ? ['user'] : [],
    });
    return todo;
  }

  async updateTodo(todo: Todo, { name }: UpdateTodoDto): Promise<Todo> {
    todo.name = name;
    return this.todosRepository.save(todo);
  }

  async deleteTodo(todo: Todo): Promise<void> {
    await this.todosRepository.remove(todo);
  }
}
