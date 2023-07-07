/* eslint-disable indent */

import {OperatorMap} from './Operators.js';
import {existsSync as fsExistSync, readFileSync as fsRead} from 'fs';
import {Error, Warning, Debug, logObject} from './Logpoints.js';
import {renderCLI} from './TUI.js';
import readlineSync from 'readline-sync';

/** Clears The Console */
function clearConsole() {
    process.stdout.write('\x1Bc');
};

/** Executes A Custom Operator
 * @param {str} str - The BBF Code
 * @param {Number} charPOS - The Character Position
 * @param {Object} CustomOperatorsMap - The Map Of Custom Operators
 * @param {Object} VariableMAP - The Map Of Common Variables
 * @return {Array}
*/
function customOperator(str, charPOS, CustomOperatorsMap, VariableMAP) {
    const Part1 = str.slice(0, charPOS + 1);
    const codeBlock = CustomOperatorsMap[str[charPOS]];
    const Part2 = str.slice(charPOS + codeBlock.length);
    VariableMAP['code'] = Part1 + codeBlock + Part2;
    return [0, VariableMAP, logSTR];
}

/** Create The Variable Map Object
 * @param {str} str - The BBF Code
 * @param {Object} conf - The Config Options
 * @return {Object}
*/
function createVarMAP(str, conf) {
    const runtime = conf['Runtime'];
    const memcell = Math.round(runtime['Memory Cell Value'] || 0);
    let arr = [memcell, memcell, memcell];
    if (runtime['Dynamic Memory Expansion'] === false) {
        arr = Array(30_000).fill(memcell);
    }
    return {
        'char_pos': 0,
        'memory_position': 0,
        'memory_tape': arr,
        'curr_type': 'memory',
        'code': str,
        'loops': [],
        'variable_tape': [],
        'variable_pos': 0,
        'function_tape': [],
        'function_pos': 0,
        'print_attempts': 0,
        'shell': '',
        'args_tape': [],
        'args_position': 0,
        'backslashed': false,
        'preposition': ['memory_position', 0],
    };
};

/** Finish the Interperting And Exit
 * @param {Number} originPerf - The Original Performance.now() Variable
 * @param {Number} FinalExitCode - The Finalised Exit Code
 * @param {String} logSTR - The Log String
 * @param {boolean} colorOutput - If Colored Output Is Allowed
 * @return {String}
*/
function finishUp(originPerf, FinalExitCode, logSTR, colorOutput) {
    const executionTime = (performance.now() - originPerf);
    const execFixed = (executionTime / 1_000).toFixed(5);
    const Info = `${FinalExitCode} And Execution Time ${execFixed} Seconds`;
    const FinishSTR = `Finished Running With Exit Code ${Info}`;
    const colorEnd = colorOutput ? '\x1b[0m' : '';
    let colorMain = '';
    if (colorOutput) {
        colorMain = `\x1b[1m\x1b[32m`;
        if (FinalExitCode === 1) colorMain = `\x1b[1m\x1b[33m`;
        else if (FinalExitCode === 2) colorMain = `\x1b[1m\x1b[31m`;
    }
    logSTR += `\n\n${colorMain}${FinishSTR}${colorEnd}`;
    return logSTR;
};

/** Begin the Execution Of All Operators In Code
 * @param {Object} ArgsObject - A Object That Contains All Of The Arguments
 * @param {Function} isDebugging - Are We Debugging or Not?
 * @return {String}
 */
function beginExecution(ArgsObject, isDebugging) {
    const exitCodes = ArgsObject['exitCodes'];
    const conf = ArgsObject['conf'];
    const performanceStart = ArgsObject['performanceStart'];
    const OperatorMap = ArgsObject['OperatorMap'];
    const CustomOperatorsMap = ArgsObject['CustomOperatorsMap'];
    let str = ArgsObject['str'];
    let logSTR = ArgsObject['logSTR'];
    const redudantNOTsCount = (str.match(/!!/g, '')||[]).length;
    const enabledWarnings = conf['Visual Options']['Enable Warnings'];
    str = str.replace(/!!/g, '');
    if (redudantNOTsCount !== 0 && enabledWarnings) {
        const warnout = `Found Redudant NOT Gates Clogging Up`;
        const data = logObject(conf);
        logSTR += new Warning(warnout, data).str;
        exitCodes.push(1);
    }
    let VariableMAP = createVarMAP(str, conf);
    let FinalExitCode = Math.max(...exitCodes);
    let results = [0, VariableMAP, ''];
    let operator;
    let ExitCode;
    let char;
    while (VariableMAP['char_pos'] < VariableMAP['code'].length) {
        char = str[VariableMAP['char_pos']];
        operator = OperatorMap[char];
        if (isDebugging) {
            renderCLI(VariableMAP, char);
            readlineSync.question('');
        };
        if (VariableMAP['backslashed']) {
            FinalExitCode = Math.max(0, FinalExitCode);
            VariableMAP['char_pos']++;
            VariableMAP['backslashed'] = false;
            continue;
        } else if (operator instanceof Function) {
            results = operator(VariableMAP, conf, logSTR, char);
        } else if (CustomOperatorsMap[char] !== undefined) {
            customOperator(
                            str, VariableMAP['char_pos'],
                            CustomOperatorsMap, VariableMAP,
                        );
        }
        ExitCode = results[0];
        FinalExitCode = Math.max(ExitCode, FinalExitCode);
        logSTR = results[2];
        if (ExitCode === 2) break;
        VariableMAP = results[1];
        VariableMAP['char_pos']++;
    }
    const colorOutput = conf['Visual Options']['Colored Output'];
    return [performanceStart, FinalExitCode, logSTR, colorOutput];
}


/** Simplify BBF Code And Optimise it
 * @param {string} str - This is the BBF code represented as a string
 * @param {Object} CustomOperatorsMap - The Custom Operators Made
 * @param {Object} conf - The BBF Config File
 * @return {string}
*/
function simplify(str, CustomOperatorsMap, conf) {
    const operators = Object.keys(OperatorMap).join('\\');
    if (conf['Operation Options']['Modes']['Lined Value']) {
        const splittedLines = str.split('\n');
        let count = 1;
        let addup = 1;
        splittedLines.forEach((element, index, arr) => {
            addup -= element.split('↓').length - 1;
            addup += element.split('↑').length - 1;
            count += addup;
            addup++;
            arr[index] = element.repeat(count);
            count = Math.max(0, count);
        });
        str = splittedLines.join('\n');
    }
    for (const [operator, code] of Object.entries(CustomOperatorsMap)) {
        if (operator === undefined || code === undefined) continue;
        str = str.replace(operator, code + '()');
    }
    const CustomOperators = Object.keys(CustomOperatorsMap).join('\\');
    str = str.replace(new RegExp('//.*', 'g'), '');
    const allOperators = `${operators}${CustomOperators}`;
    str = str.replace(/\\\\/g, '\\');
    // eslint-disable-next-line max-len
    const pattern = new RegExp(`§(?![^${allOperators}]|¶(?!\d+)|\\\\.|\\.(?<![§]))`, 'g');
    str = str.replace(pattern, '');
    str = str.trim();
    str = str.replace(/[≺≻⋞⋟=≠](?!\[)/, '');
    str = str.replace('^√', '');
    return str;
}

/** Import All Packages Specified In The Config
 * @param {string} str - This is the BBF code represented as a string
 * @param {Object} conf - The Config JSON
 * @param {Bool} isDebug - Are we debugging?
 * @return {Array}
*/
function imports(str, conf, isDebug) {
    const enabledWarnings = conf['Visual Options']['Enable Warnings'];
    const imports = conf['Imports'];
    let ExitCode = 0;
    let logSTR = '';
    if ((imports?.length || 0) === 0) return [str, [], logSTR, 0];
    const CustomOperatorsMap = {};
    const NormalOperators = Object.keys(OperatorMap);
    for (const ImportedPackage of imports) {
        const PackageScript = ImportedPackage.split('.').pop(0);
        if (!fsExistSync(ImportedPackage)) {
            // eslint-disable-next-line max-len
            const errorout = `Current BBF Module Script Path "${ImportedPackage}" Doesn't Exist`;
            const data = logObject(conf);
            logSTR += new Error(errorout, data).str;
            if (isDebug) logSTR = logSTR.replace('[E', '[CRASH E');
            return ['', [], logSTR, 2];
        } else if (PackageScript !== 'mbbf') {
            // eslint-disable-next-line max-len
            const errorout = `Current File Isn't A Moduled BBF Script One "${ImportedPackage}"`;
            const data = logObject(conf);
            logSTR += new Error(errorout, data).str;
            if (isDebug) logSTR = logSTR.replace('[E', '[CRASH E');
            return ['', [], logSTR, 2];
        }
        let PackageContent = fsRead(ImportedPackage, 'utf8');
        PackageContent += '\n';
        PackageContent = PackageContent.replace(new RegExp('//.*', 'g'), '');
        const pattern = /\@\S+\s*:?=\s*\"([^\"]*)\"(?:\s*\/\/\s*(.*))?/g;
        let Cuos = PackageContent.match(pattern);
        const operatorChars = [];
        if (Cuos !== null) {
            Cuos = [...new Set(Cuos)];
            const CUOSlen = Cuos.length;
            for (let i = 0; i < CUOSlen; i++) {
                const scuo = Cuos[i];
                const char = scuo[1];
                if (NormalOperators.includes(char)) {
                    if (enabledWarnings) {
                        ExitCode = Math.max(1, ExitCode);
                        // eslint-disable-next-line max-len
                        const errorout = `Custom Operator Collision With Ordinary BBF Operator In Package "${ImportedPackage}" And Operator "${scuo}"`;
                        const data = logObject(conf);
                        logSTR += new Warning(errorout, data).str;
                    }
                    PackageContent = PackageContent.replace(scuo, '');
                    continue;
                } else if (operatorChars.includes(char)) {
                    if (!enabledWarnings) continue;
                    ExitCode = Math.max(1, ExitCode);
                    // eslint-disable-next-line max-len
                    const warnout = `Custom Operator Collision With Custom Operator In Package "${ImportedPackage}" And Operator "${scuo}"`;
                    const data = logObject(conf);
                    logSTR += new Warning(warnout, data).str;
                }
                const StartString = scuo.indexOf('"') + 1;
                let code = scuo.slice(StartString, -1);
                code = code.replace(/\s/gm, '');
                PackageContent = PackageContent.replaceAll(scuo, '');
                const pattern = new RegExp(`${char}(?!.*\")`, 'g');
                PackageContent = PackageContent.replace(pattern, code);
                CustomOperatorsMap[`${char}`] = code;
                operatorChars.push(char);
            };
        }
        str = str.replace(/^/, PackageContent);
    };
    return [str, CustomOperatorsMap, logSTR, ExitCode];
}

/** Optimise The BBF Code. Find Errors & Warnings
 * @param {string} str - This is the BBF code represented as a string
 * @param {string} conf - The Config JSON
  * @param {bool} isDebug - Are we debugging?
 * @return {Array}
*/
function optimiseScript(str, conf, isDebug=false) {
    let logSTR = '';
    let exitCode = 0;
    const oacMap = [
        ['Conditional Loop', ['['], [']']],
        ['Condition', ['¿', '⸮', '⁈'], ['?', '⁇']],
        ['Function', ['{'], ['}']],
        ['Argument', ['('], [')']],
    ];
    for (const element of oacMap) {
        const openings = element[1].join('\\');
        const closings = element[2].join('\\');
        const patternOpen = new RegExp(`\\${openings}`, 'g');
        const patternClose = new RegExp(`\\${closings}`, 'g');
        const Openings = (str.match(patternOpen)||[]).length;
        const Closings = (str.match(patternClose)||[]).length;
        if (Closings === Openings) continue;
        else if (Closings > Openings) {
            const errorout = `Unbalanced Opening ${element[0]} Operators`;
            const data = logObject(conf);
            const error = new Error(errorout, data).str;
            logSTR = logSTR.replace(/^/, error);
            if (!isDebug) return [str, logSTR, 2];
            exitCode = 2;
        }
        const errorout = `Unbalanced Closing ${element[0]} Operators`;
        const data = logObject(conf);
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        if (!isDebug) return [str, logSTR, 2];
        exitCode = 2;
    }
    const napMap = [
        ['+', '-'],
        ['>', '<'],
        ['±', '∓'],
        ['#', ':'],
        ['«', '»'],
        ['⥳', '⥲'],
        ['↜', '↝'],
    ];
    const enabledWarnings = conf['Visual Options']['Enable Warnings'];
    for (const element of napMap) {
        // eslint-disable-next-line max-len
        const patternSTR = `(\\${element[0]}\\${element[1]}|\\${element[1]}\\${element[0]})`;
        const pattern = new RegExp(patternSTR, 'g');
        const count = (str.match(pattern)||[]).length;
        if (count === 0 || !enabledWarnings) continue;
        // eslint-disable-next-line max-len
        const warnout = `Found Over ${count} Redundant Instruction(s) Pattern(s) With "${element[0]}" & "${element[1]}"`;
        const data = logObject(conf);
        const warning = new Warning(warnout, data).str;
        logSTR = logSTR.replace(/^/, warning);
        exitCode = Math.max(exitCode, 1);
    }
    return [str, logSTR, exitCode];
}

/** Debug Given BBF Code
 * @param {string} str - This is the BBF code represented as a string
 * @param {string} conf - The Config JSON
 * @return {Number}
*/
export function debug(str, conf) {
    const performanceStart = performance.now();
    str = str.replace(/[∂¶]/, '');
    const importSection = () => {
        const ImportResults = imports(str, conf, true);
        str = ImportResults[0];
        const logSTR = ImportResults[2];
        const CustomOperatorsMap = ImportResults[1];
        return [ImportResults[3], logSTR, CustomOperatorsMap];
    };
    const simplifySection = () => {
        str = simplify(str, CustomOperatorsMap, conf, true);
        return [0, ''];
    };
    const optimisingSection = () => {
        const OptimiseResults = optimiseScript(str, conf, true);
        if (OptimiseResults[2] === 2) {
            return [2, OptimiseResults[1]];
        };
        return [OptimiseResults[2], OptimiseResults[1]];
    };
    const sections = {
        'Importing': importSection,
        'Simplification': simplifySection,
        'Optimising': optimisingSection,
    };
    let logSTR = '';
    let CustomOperatorsMap;
    const exitCodes = [];
    const Sectiontimes = [];
    const colorOutput = conf['Visual Options']['Colored Output'];
    for (const currSection of Object.keys(sections)) {
        clearConsole();
        const sectionPerformance = performance.now();
        const currFunc = sections[currSection];
        const results = currFunc();
        const Exitcode = results[0];
        if (currSection === 'Importing') {
            CustomOperatorsMap = results[2];
        }
        exitCodes.push(Exitcode);
        const diff = performance.now() - sectionPerformance;
        const time = ((diff) / 1_000);
        Sectiontimes.push(time);
        const isError = (results[0] === 2) ? '& Errored Out': '';
        const data = logObject(conf);
        // eslint-disable-next-line max-len
        logSTR += new Debug(`${currSection} Took ${time.toFixed(6)} Seconds ${isError}`, Exitcode, data).str;
        if (results[1].length !== 0) {
            const log = `• ${results[1]}`.split('\n').join('\n• ').slice(0, -2);
            logSTR += log;
        }
        process.stdout.write(logSTR);
        readlineSync.question('');
    }
    const time = Sectiontimes.reduce((acc, val) => acc + val, 0);
    const FinalExitCode = Math.max(...exitCodes);
    const data = logObject(conf);
    // eslint-disable-next-line max-len
    logSTR += '\n' + new Debug(`Entire Section Took ${time.toFixed(6)} Seconds With Exit Code ${FinalExitCode}`, FinalExitCode, data).str;
    clearConsole();
    console.log(logSTR);
    if (FinalExitCode === 2) {
        return (colorOutput) ? '\x1b[0m' : '';
    }
    readlineSync.question('');
    logSTR = '';
    clearConsole();
    const results = beginExecution({
        'exitCodes': exitCodes,
        'str': str,
        'conf': conf,
        'performanceStart': performanceStart,
        'logSTR': logSTR,
        'OperatorMap': OperatorMap,
        'CustomOperatorsMap': CustomOperatorsMap,
    }, true);
    clearConsole();
    return finishUp(...results);
};


/** Run BBF Code
 * @param {string} str - This is the BBF code represented as a string
 * @param {string} conf - The Config JSON
 * @return {Number}
*/
export function run(str, conf) {
    const performanceStart = performance.now();
    str = str.replace(/[∂¶]/, '');
    const ImportResults = imports(str, conf);
    if (ImportResults[3] === 2) {
        return ImportResults[2];
    };
    str = ImportResults[0];
    let logSTR = ImportResults[2];
    const CustomOperatorsMap = ImportResults[1];
    str = simplify(str, CustomOperatorsMap, conf);
    const OptimiseResults = optimiseScript(str, conf);
    if (OptimiseResults[2] === 2) {
        return OptimiseResults[1];
    };
    logSTR += OptimiseResults[1];
    const results = beginExecution({
        'exitCodes': [OptimiseResults[2], ImportResults[3]],
        'str': str,
        'conf': conf,
        'performanceStart': performanceStart,
        'logSTR': logSTR,
        'OperatorMap': OperatorMap,
        'CustomOperatorsMap': CustomOperatorsMap,
    }, false);
    return finishUp(...results);
};
