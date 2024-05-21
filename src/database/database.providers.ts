import { DataSource } from 'typeorm';
import { VideoEntity } from '../entites/video/video.entity';
import { UserEntity } from 'src/entites/user/user.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'user',
        password: '1',
        database: 'subtitr',
        entities: [VideoEntity, UserEntity],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];