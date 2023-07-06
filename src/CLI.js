#!/usr/bin/env node

/* eslint-disable indent */

import {run, debug} from './Interpeter/Runner.js';
import {
    existsSync as fsExistSync, readFileSync as fsRead,
    writeFileSync as fsWriteFileSync,
} from 'fs';
import {homedir as OS_HOMEDIR} from 'os';
import {confSchema} from './schema.js';
import Ajv from 'ajv';
import readlineSync from 'readline-sync';
import {Error, logObject} from './Interpeter/Logpoints.js';
import figlet from 'figlet';

/** Returns Default Configurations For BBF
 * @return {Object}
 */
function getConfig() {
    return {
        'Runtime': {
            'Circular Memory Tape': false,
            'Dynamic Memory Expansion': false,
        },
        'Operation Options': {
            'Custom Operators': {},
            'Lazy Printing': true,
            'Input Fillness': false,
            'Modes': {
                'Line_Repetition': false,
            },
        },
        'Visual Options': {
            'Colored Output': true,
            'Enable Warnings': true,
            'Logging': {
                'Error Label': 'ERROR',
                'Warning Label': 'WARNING',
                'Debug Label': 'DEBUG',
            },
        },
        'Imports': [],
    };
}

/** Use A BBF Config
  * @param {string} confPath - The Path To The BBF Config File
  * @return {string}
*/
export function useConfig(confPath) {
    if (confPath === undefined) {
        fsWriteFileSync('./src/.conf', JSON.stringify(getConfig()));
        return 'Currently Using Default Configs';
    }
    if (confPath.length === 0) {
        const errorout = `Config Path Isn't Defined In The Arguments`;
        const data = logObject(getConfig());
        const error = new Error(errorout, data).str;
        return error;
    }
    confPath = confPath.replace('~', OS_HOMEDIR);
    let ConfigFileName = confPath.split('/');
    ConfigFileName = ConfigFileName[ConfigFileName.length - 1];
    if (!fsExistSync(confPath)) {
        const errorout = `Config Doesn\'t Exist Within Specified Path`;
        const data = logObject(getConfig());
        const error = new Error(errorout, data).str;
        return error;
    }
    if (ConfigFileName !== 'bbfconf.json') {
        const errorout = `The Following File Isn\'t A BBF Config`;
        const data = logObject(getConfig());
        const error = new Error(errorout, data).str;
        return error;
    }
    let conf = {};
    try {
        conf = JSON.parse(fsRead(confPath, 'utf8'));
    } catch {
        const errorout = 'Config\'s JSON couldn\'t be read';
        const data = logObject(getConfig());
        const error = new Error(errorout, data).str;
        return error;
    }
    const ajv = new Ajv();
    const validate = ajv.compile(confSchema);
    const isValid = validate(conf);
    let logSTR = '';
    if (!isValid) {
        const errorout = `Current BBF Config File Is Invalid`;
        const data = logObject(getConfig());
        logSTR += new Error(errorout, data).str;
        const color = '\x1b[4m\x1b[31m\x1b[1m';
        logSTR += `\n${color}[PREVIEW] Of Logged Ajv Error(s)\n`;
        const ajvErrors = validate.errors;
        const errorInstancePath = ajvErrors[0].instancePath;
        let path = `config${errorInstancePath}`;
        if (errorInstancePath.length === 0) path = 'config/';
        logSTR += '\x1b[0m\x1b[31m- "' + path + '" ';
        logSTR += ajvErrors[0].message + '\x1b[0m\n';
        return logSTR;
    }
    const runtime = conf['Runtime'];
    const dynamicTape = runtime['Dynamic Memory Expansion'];
    const circularTape = runtime['Circular Memory Tape'];
    if (dynamicTape === circularTape && circularTape === true) {
        // eslint-disable-next-line max-len
        const errorout = '"Dynamic Memory Tape" And "Circular Memory Tape" Cannot Be Both True On Operation Options';
        const data = logObject(conf);
        const error = new Error(errorout, data).str;
        return error;
    }
    fsWriteFileSync('./src/.conf', JSON.stringify(conf));
    const color = '\x1b[32m\x1b[1m';
    const colorOutput = conf['Visual Options']['Colored Output'];
    if (colorOutput) {
        return `${color}Currently Using Custom Configs`;
    }
    return `Currently Using Custom Configs`;
}

/** Executes A BBF Script
  * @param {string} ScriptPath - The Path To The BBF Script File
  * @param {Boolean} isDebugging - Are We Debugging?
  * @param {string} confPath - The Path To The Config Path(optional)
  * @param {boolean} savedState - Shall it be saved
  * @return {string}
*/
export function executeFile(ScriptPath, isDebugging, confPath, savedState) {
    if (ScriptPath === undefined || ScriptPath.length === 0) {
        const errorout = `Script Path Isn't Defined In The Arguments`;
        const data = logObject(JSON.parse(fsRead('./src/.conf')));
        const error = new Error(errorout, data).str;
        return error;
    }
    let conf = getConfig();
    if (confPath !== undefined) {
        const results = useConfig(confPath);
        if (results.includes('[ERROR]')) {
            return results;
        }
        conf = JSON.parse(fsRead('./src/.conf')) || conf;
    }
    const debugging = isDebugging;
    ScriptPath = ScriptPath.replace('~', OS_HOMEDIR);
    let ScriptFileName = ScriptPath.split('/');
    ScriptFileName = ScriptFileName[ScriptFileName.length - 1];
    const ScriptExtension = ScriptFileName.split('.').pop(0);
    if (!fsExistSync(ScriptPath)) {
        const errorout = `BBF Script Doesn\'t Exist Within Specified Path`;
        const data = logObject(conf);
        const error = new Error(errorout, data).str;
        return error;
    }
    if (ScriptExtension === 'mbbf') {
        const errorout = `The Current Script Is A MBBF. It Cannot Be Run`;
        const data = logObject(conf);
        const error = new Error(errorout, data).str;
        return error;
    }
    if (ScriptExtension !== 'bbf') {
        const errorout = `The Following File Isn\'t A BBF Script`;
        const data = logObject(conf);
        const error = new Error(errorout, data).str;
        return error;
    }
    const Script = fsRead(ScriptPath, 'utf8');
    if (Script.length === 0) return '';
    if (debugging) {
        const results = debug(Script, conf);
        return results;
    }
    const results = run(Script, conf);
    return results;
}

/** The BBF Console
*/
export function consoleBBF() {
    console.log('\x1Bc');
    const conf = getConfig();
    let input = '';
    console.log(
        figlet.textSync('Console', {
            font: 'Big Money-ne',
            horizontalLayout: 'fitted',
            verticalLayout: 'fitted',
            width: 150,
            whitespaceBreak: true,
        }),
    );
    while (input !== 'exit' || input !== 'quit') {
        input = readlineSync.question('>> ');
        if (input === 'exit' || input === 'quit') break;
        if (input.length === 0) continue;
        console.log(run(input, conf));
    }
}

/** Display a help log for BBF
 * @return {string}
*/
export function helpBBF() {
    const result = 'e';
    return result;
}
