import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TodoService } from '../todo/todo.service';
import constants from '../constants';

@Injectable()
export class TodoOwnerGuard implements CanActivate {
  constructor(@Inject(TodoService) private readonly todoService: TodoService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { user, params } = req;
    const todo = await this.todoService.findOneTodo(params?.todoId, true);
    if (!todo) throw new NotFoundException(constants.TODO_NOT_FOUND);
    if (user.id !== todo?.user.id)
      throw new ForbiddenException(constants.FORBIDDEN_MESSAGE);
    req.todo = todo;
    return true;
  }
}
