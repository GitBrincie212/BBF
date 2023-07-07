#!/usr/bin/env node
/* eslint-disable indent */
import {executeFile, useConfig, consoleBBF, helpBBF} from './CLI.js';

switch (process.argv[2]) {
    case '-r':
    case '--run':
        const dataRun = executeFile(
                                    process.argv[3], false,
                                    process.argv[4],
                                    process.argv[5] === '--synch',
                                );
        console.log(dataRun);
        break;
    case '-d':
    case '--debug':
        const dataDebug = executeFile(
                                    process.argv[3], true,
                                    process.argv[4],
                                    process.argv[5] === '--synch',
                                );
        console.log(dataDebug);
        break;
    case '-u':
    case '--use':
        const dataUse = useConfig(process.argv[3]);
        console.log(dataUse);
        break;
    case '-c':
    case '--console':
        consoleBBF();
        break;
    case '-h':
    case '--help':
    default:
        console.log(helpBBF());
}
