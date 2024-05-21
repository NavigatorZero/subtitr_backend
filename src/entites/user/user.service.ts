import { Inject, Injectable } from "@nestjs/common";
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async insert(entity: UserEntity): Promise<UserEntity> {
    entity = this.userRepository.create(entity);
    await this.userRepository.save(entity);
    return entity;
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        email: email
      }
    })
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}