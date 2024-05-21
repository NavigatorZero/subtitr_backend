const Queue = require('bee-queue');
import { PythonShell } from 'python-shell';

const options = {
    removeOnSuccess: true,
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
}

const videQueue = new Queue('video', options);

const placeOrder = (order) => {
    return videQueue.createJob(order).save();
};

videQueue.process(3,(job, done) => {
    console.log(`Job ${job.id} has been started`);
    PythonShell.run(`${process.cwd()}/src/generation/main.py`, {
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'],
        args: [job.data.inputFile, job.data.outputFile, job.data.speed, job.data.position, job.data.font],
      }).then((messages) => {
        console.log('finished', messages, job.id);
      });
    
})


module.exports.placeOrder = placeOrder;