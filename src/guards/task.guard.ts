import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskService } from '../task/task.service';
import constants from '../constants';

@Injectable()
export class TaskOwnerGuard implements CanActivate {
  constructor(@Inject(TaskService) private readonly taskService: TaskService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { user, params } = req;
    const task = await this.taskService.findOneTask(params?.taskId, true);
    if (!task) throw new NotFoundException(constants.TASK_NOT_FOUND);
    if (user.id !== task?.todo?.user?.id)
      throw new ForbiddenException(constants.FORBIDDEN_MESSAGE);
    req.task = task;
    return true;
  }
}
