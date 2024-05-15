import { PythonShell } from 'python-shell';

import { Injectable } from '@nestjs/common';

@Injectable()
export class PythonRunnerService {
  call(inputFile, outputFile, speed, position, font) {

    PythonShell.run(`${process.cwd()}/src/generation/main.py`, {
      pythonPath: '/usr/bin/python3',
      pythonOptions: ['-u'],
      args: [inputFile, outputFile, speed, position, font],
    }).then((messages) => {
      console.log('finished', messages);
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
