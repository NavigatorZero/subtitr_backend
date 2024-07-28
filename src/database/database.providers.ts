import { DataSource } from 'typeorm';
import { VideoEntity } from '../entites/video/video.entity';
import { UserEntity } from 'src/entites/user/user.entity';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [VideoEntity, UserEntity],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];