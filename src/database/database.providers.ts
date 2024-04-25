import { DataSource } from 'typeorm';
import { VideoEntity } from '../entites/video/video.entity';

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
        entities: [VideoEntity],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];