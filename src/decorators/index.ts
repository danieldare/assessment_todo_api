import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return field ? request.user[field] : request.user;
  },
);

export const Todo = createParamDecorator(
  (_field: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.todo;
  },
);

export const Task = createParamDecorator(
  (_field: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.task;
  },
);
