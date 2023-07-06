/* eslint-disable indent */
import * as CLI from './CLI.js';

switch (process.argv[2]) {
    case '-r':
    case '--run':
        const dataRun = CLI.executeFile(
                                    process.argv[3], false,
                                    process.argv[4],
                                    process.argv[5] === '--synch',
                                );
        console.log(dataRun);
        break;
    case '-d':
    case '--debug':
        const dataDebug = CLI.executeFile(
                                    process.argv[3], true,
                                    process.argv[4],
                                    process.argv[5] === '--synch',
                                );
        console.log(dataDebug);
        break;
    case '-u':
    case '--use':
        const dataUse = CLI.useConfig(process.argv[3]);
        console.log(dataUse);
        break;
    case '-c':
    case '--console':
        CLI.consoleBBF();
        break;
    case '-h':
    case '--help':
    default:
        console.log('eeeeeee');
        console.log(CLI.helpBBF());
}
