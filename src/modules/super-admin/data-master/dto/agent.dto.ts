import { Agent } from "@entities/agent.entity";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateAgentDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber?: string;

  @IsNotEmpty()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @IsString()
  code?: string;

  intoAgent(): Agent {
    const agent = new Agent();
    agent.name = this.name;
    agent.email = this.email;
    agent.phoneNumber = this.phoneNumber;
    agent.address = this.address;
    agent.code = this.code
    return agent;
  }
}

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  code?: string;

  intoAgent(): Agent {
    const agent = new Agent();
    agent.name = this.name;
    agent.email = this.email;
    agent.phoneNumber = this.phoneNumber;
    agent.address = this.address;
    agent.code = this.code
    return agent;
  }
}
