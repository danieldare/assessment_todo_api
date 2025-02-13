import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;
}

export class FetchTodoDto {
  @IsOptional()
  search?: string;

  @IsNumberString()
  @IsOptional()
  pageSize?: string;

  @IsNumberString()
  @IsOptional()
  pageNumber?: string;
}

export class UpdateTodoDto extends CreateTodoDto {}

export class FindOneTodoParams {
  @IsUUID()
  todoId: string;
}
