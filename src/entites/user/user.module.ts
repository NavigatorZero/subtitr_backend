import { Module } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { DatabaseModule } from '../../database/database.module';
import { DataSource } from 'typeorm';
import { UserService } from './user.service';
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(UserEntity),
      inject: ['DATA_SOURCE'],
    },
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
