import { IsDate, IsNotEmpty, IsString, IsUUID, MinDate } from 'class-validator';
import dayjs from 'dayjs';
import { Type } from 'class-transformer';
import { PartialType, OmitType } from '@nestjs/swagger';
import constants from '../constants';
import { FetchTodoDto } from '../todo/todo.dto';

export class CreateTaskDto {
  // due date should not be less than a minute from now
  @Type(() => Date)
  @MinDate(() => dayjs().add(1, 'minute').toDate(), {
    message: constants.DATE_NOT_FUTURE,
  })
  @IsDate()
  dueDate: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  todoId: string;
}

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['todoId'] as const),
) {}

export class FindOneTaskParams {
  @IsUUID()
  taskId: string;
}

export class GetTodoTasksDto extends FetchTodoDto {}
