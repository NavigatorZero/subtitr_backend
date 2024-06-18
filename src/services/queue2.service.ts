import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as BeeQueue from 'bee-queue';
import { PythonShell } from 'python-shell';
import {VideoService} from "../entites/video/video.service";

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queue: BeeQueue;

  constructor( private videoService: VideoService) {
  }

  onModuleInit() {
    this.queue = new BeeQueue('my-queue', {
      redis: {
        host: '127.0.0.1',
        db: 0,
        port: 6379,
      },
      stallInterval: 5000,
    });

    this.queue.process(5, (job, done) => {
      console.log(`Job ${job.id} has been started`);
      PythonShell.run(`${process.cwd()}/src/generation/main.py`, {
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'],
        args: [
          job.data.inputFile,
          job.data.outputFile,
          job.data.speed,
          job.data.position,
          job.data.font,
        ],
      }).then((messages) => {

        this.videoService.insert(job.data.entity);

        console.log('finished', messages, job.id);
        done();
      });
    });

    this.queue.on('error', (err) => {
      console.log(`A queue error happened: ${err.message}`);
    });

    this.queue.on('failed', (job, err) => {
      console.log(`Job ${job.id} failed with error ${err.message}`);
    });

    this.queue.on('job succeeded', (jobId, result) => {
      console.log(`Job ${jobId} succeeded with result: ${result}`);
    });

    this.queue.on('job retrying', (jobId, err) => {
      console.log(
        `Job ${jobId} failed with error ${err.message} but is being retried!`,
      );
    });

    this.queue.on('stalled', (jobId) => {
      console.log(`Job ${jobId} stalled and will be reprocessed`);
    });

    this.queue.checkStalledJobs(5000, (err, numStalled) => {
      // prints the number of stalled jobs detected every 5000 ms
      console.log('Checked stalled jobs', numStalled);
    });

    this.queue.on('failed', (job, err) => {
      console.log(`Job ${job.id} failed with error ${err.message}`);
    });
  }

    async addJob(data: any) {
        const job = await this.queue.createJob(data).save();
        console.log(`Job ${job.id} added to the queue`);
    }

  onModuleDestroy() {
    this.queue.close();
  }
}
