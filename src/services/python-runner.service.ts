import { PythonShell } from 'python-shell';

import { Injectable } from '@nestjs/common';

@Injectable()
export class PythonRunnerService {
  call(inputFile, outputFile) {
    console.log(inputFile, outputFile);

    PythonShell.run('/Users/skyeng/projects/whisper/gen/main.py', {
      pythonPath: '/usr/local/bin/python3.12',
      pythonOptions: ['-u'],
      args: [inputFile, outputFile],
    }).then((messages) => {
      console.log('finished');
    });

    // shell.exec(
    //   `pm2 start /Users/skyeng/projects/whisper/gen/main.py name${inputFile} --${outputFile} --interpreter=/usr/local/bin/python3.12`,
    //   function (code, output) {
    //     console.log('Exit code:', code);
    //     console.log('Program output:', output);
    //   },
    // );
  }
}
