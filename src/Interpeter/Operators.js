/* eslint-disable indent */
import readlineSync from 'readline-sync';
import {Error, Warning, logObject} from './Logpoints.js';
import {execSync} from 'child_process';

let canRepeat = false;

const PLUS = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    if (VariableMAP[`${currType}_tape`][CurrCursorPos] === undefined) {
        const posIndex = VariableMAP['char_pos'];
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP[`${currType}_tape`][CurrCursorPos]++;
    return [0, VariableMAP, logSTR];
};

const MINUS = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    if (VariableMAP[`${currType}_tape`][CurrCursorPos] === undefined) {
        const pos = VariableMAP['char_pos'] + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP[`${currType}_tape`][CurrCursorPos]--;
    return [0, VariableMAP, logSTR];
};

const LEFT_ARROW = (VariableMAP, conf, logSTR) => {
    VariableMAP['memory_position']--;
    const CurrCursorPos = VariableMAP['memory_position'];
    const CurrTape = VariableMAP['memory_position'];
    VariableMAP['preposition'] = ['memory_position', CurrCursorPos];
    const circularTape = conf['Runtime']['Circular Memory Tape'];
    const dynamicTape = conf['Runtime']['Dynamic Memory Expansion'];
    if (!dynamicTape && !circularTape) return [0, VariableMAP, logSTR];
    else if (dynamicTape) {
        if (CurrCursorPos >= CurrTape.length) {
            VariableMAP['memory_tape'].push(0);
            return [0, VariableMAP, logSTR];
        }
        if (CurrCursorPos < 0) {
            VariableMAP['memory_tape'].unshift(0);
            return [0, VariableMAP, logSTR];
        }
    }
    if (CurrCursorPos < 0) {
        VariableMAP['memory_position'] = CurrTape.length - 1;
        return [0, VariableMAP, logSTR];
    }
    if (CurrCursorPos > CurrTape.length) VariableMAP['memory_position'] = 0;
    return [0, VariableMAP, logSTR];
};

const RIGHT_ARROW = (VariableMAP, conf, logSTR) => {
    VariableMAP['memory_position']++;
    const CurrCursorPos = VariableMAP['memory_position'];
    const CurrTape = VariableMAP['memory_tape'];
    VariableMAP['preposition'] = ['memory_position', CurrCursorPos];
    const circularTape = conf['Runtime']['Circular Memory Tape'];
    const dynamicTape = conf['Runtime']['Dynamic Memory Expansion'];
    if (!dynamicTape && !circularTape) return [0, VariableMAP, logSTR];
    if (dynamicTape) {
        if (CurrCursorPos >= CurrTape.length) {
            VariableMAP['memory_tape'].push(0);
            return [0, VariableMAP, logSTR];
        } else if (CurrCursorPos < 0) {
            VariableMAP['memory_tape'].unshift(0);
            return [0, VariableMAP, logSTR];
        }
        return [0, VariableMAP, logSTR];
    }
    if (CurrCursorPos < 0) {
        VariableMAP['memory_position'] = CurrTape.length - 1;
        return [0, VariableMAP, logSTR];
    } else if (CurrCursorPos > CurrTape.length) {
        VariableMAP['memory_position'] = 0;
        return [0, VariableMAP, logSTR];
    };
    return [0, VariableMAP, logSTR];
};

const PRINT = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const CharTranslation = String.fromCharCode(currCell);
    const lazyPrinting = conf['Operation Options']['Lazy Printing'];
    VariableMAP['preposition'] = [`${currType}_position`, CurrCursorPos];
    if (lazyPrinting) {
        if (VariableMAP['print_attempts'] >= 500) {
            process.stdout.write(logSTR);
            VariableMAP['print_attempts'] = 0;
            logSTR = '';
            return [0, VariableMAP, logSTR];
        }
        logSTR += CharTranslation;
        VariableMAP['print_attempts']++;
        return [0, VariableMAP, logSTR];
    }
    process.stdout.write(CharTranslation);
    return [0, VariableMAP, logSTR];
};

const ASCII_PRINT = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const lazyPrinting = conf['Operation Options']['Lazy Printing'];
    VariableMAP['preposition'] = [`${currType}_position`, CurrCursorPos];
    if (lazyPrinting) {
        if (VariableMAP['print_attempts'] >= 500) {
            process.stdout.write(logSTR);
            VariableMAP['print_attempts'] = 0;
            logSTR = '';
            return [0, VariableMAP, logSTR];
        }
        logSTR += currCell;
        VariableMAP['print_attempts']++;
        return [0, VariableMAP, logSTR];
    }
    process.stdout.write(CharTranslation);
    return [0, VariableMAP, logSTR];
};

const INPUT = (VariableMAP, conf, logSTR) => {
    const canFill = conf['Operation Options']['Input Fillness'];
    const lazyPrinting = conf['Operation Options']['Lazy Printing'];
    let input = '';
    if (lazyPrinting) {
        process.stdout.write(logSTR);
        logSTR = '';
    }
    while (input.length === 0) {
        input = readlineSync.question('\n>> ');
    };
    const fillIn = (i) => {
        const AsciiTranslation = input[i].charCodeAt(0);
        const tempCurrCursorPos = VariableMAP['memory_position'] + i;
        VariableMAP['memory_tape'][tempCurrCursorPos] = AsciiTranslation;
    };
    if (canFill) {
        for (let i = 0; i < input.length; i++) fillIn(i);
        const lastRecord = VariableMAP['memory_position'] + (input.length - 1);
        VariableMAP['preposition'] = ['memory_position', lastRecord];
        return [0, VariableMAP, logSTR];
    };
    fillIn(0);
    const CurrCursorPos = VariableMAP['memory_position'];
    VariableMAP['preposition'] = ['memory_position', CurrCursorPos];
    return [0, VariableMAP, logSTR];
};

const ENTER_LOOP = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const currType = VariableMAP['curr_type'];
    const posIndex = VariableMAP['char_pos'];
    const prevChar = str[posIndex - 1];
    const EndLoop = str.lastIndexOf(']');
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const CurrTape = VariableMAP[`${currType}_tape`];
    const varTape = VariableMAP['variable_tape'];
    let varCell = varTape[VariableMAP['variable_pos']];
    const currCell = CurrTape[CurrCursorPos];
    let ExitCode = 0;
    if (varCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const warning = new Warning('No Variable Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, warning);
        VariableMAP['variable_tape'].push(0);
        varCell = 0;
        ExitCode = 1;
    }
    const condMap = {
        '≺': currCell < varCell,
        '≻': currCell > varCell,
        '⋞': currCell <= varCell,
        '⋟': currCell >= varCell,
        '≠': currCell != varCell,
        '=': currCell == varCell,
    };
    let cond = CurrTape[CurrCursorPos] === 0;
    if (Object.keys(condMap).includes(prevChar)) {
        VariableMAP['loops'].push(prevChar);
        cond = condMap[prevChar];
    } else {
        VariableMAP['loops'].push('=');
    }
    if (cond) {
        VariableMAP['char_pos'] = EndLoop;
    }
    return [ExitCode, VariableMAP, logSTR];
};

const EXIT_LOOP = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const currType = VariableMAP['curr_type'];
    const posIndex = VariableMAP['char_pos'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const CurrTape = VariableMAP[`${currType}_tape`];
    const varTape = VariableMAP['variable_tape'];
    let varCell = varTape[VariableMAP['variable_pos']];
    const currCell = CurrTape[CurrCursorPos];
    let ExitCode = 0;
    if (varCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const warning = new Warning('No Variable Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, warning);
        VariableMAP['variable_tape'].push(0);
        varCell = 0;
        ExitCode = 1;
    }
    const loops = VariableMAP['loops'];
    const condMap = {
        '≺': currCell < varCell,
        '≻': currCell > varCell,
        '⋞': currCell <= varCell,
        '⋟': currCell >= varCell,
        '≠': currCell != varCell,
        '=': currCell == varCell,
    };
    const cond = condMap[loops[loops.length - 1]];
    if (!cond) {
        const sliced = str.slice(0, posIndex);
        const startLoop = sliced.lastIndexOf('[');
        VariableMAP['char_pos'] = startLoop;
    }
    return [ExitCode, VariableMAP, logSTR];
};

const POSITION_TO_START = (VariableMAP, _, logSTR) => {
    const currType = VariableMAP['curr_type'];
    VariableMAP[`${currType}_position`] = 0;
    return [0, VariableMAP, logSTR];
};

const POSITION_TO_END = (VariableMAP, _, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const lastIndex = VariableMAP[`${currType}_tape`].length - 1;
    VariableMAP[`${currType}_position`] = lastIndex;
    return [0, VariableMAP, logSTR];
};

const CREATE_VARIABLE_CELL = (VariableMAP, _, logSTR) => {
    VariableMAP['variable_tape'].push(0);
    const varPosition = VariableMAP['variable_pos'];
    VariableMAP['preposition'] = ['variable_pos', varPosition];
    return [0, VariableMAP, logSTR];
};

const REMOVE_VARIABLE_CELL = (VariableMAP, _, logSTR) => {
    VariableMAP['variable_tape'].pop();
    return [0, VariableMAP, logSTR];
};

const INCREMENT_VARIABLE_CELL = (VariableMAP, conf, logSTR) => {
    const varPos = VariableMAP['variable_pos'];
    if (VariableMAP['variable_tape'][varPos] === undefined) {
        const pos = VariableMAP['char_pos'] + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Variable Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['variable_tape'][varPos]++;
    return [0, VariableMAP, logSTR];
};

const DECREMENT_VARIABLE_CELL = (VariableMAP, conf, logSTR) => {
    const varPos = VariableMAP['variable_pos'];
    const posIndex = VariableMAP['char_pos'];
    if (VariableMAP['variable_tape'][varPos] === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Variable Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['variable_tape'][varPos]--;
    return [0, VariableMAP, logSTR];
};

const LEFT_VAR_ARROW = (VariableMAP, _, logSTR) => {
    VariableMAP['variable_pos']--;
    return [0, VariableMAP, logSTR];
};

const RIGHT_VAR_ARROW = (VariableMAP, _, logSTR) => {
    VariableMAP['variable_pos']++;
    return [0, VariableMAP, logSTR];
};

const VAR_MOVE_ENDUP = (VariableMAP, _, logSTR) => {
    VariableMAP['variable_pos'] = VariableMAP['variable_tape'].length - 1;
    return [0, VariableMAP, logSTR];
};

const BREAK_LOOP = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const sliced = str.slice(0, posIndex);
    const secondSliced = str.slice(posIndex);
    const index = sliced.lastIndexOf('[');
    const EndLoop = secondSliced.lastIndexOf(']');
    if (EndLoop === -1 || index === -1) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Loop Is Entered', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    };
    VariableMAP['char_pos'] = EndLoop;
    return [0, VariableMAP, logSTR];
};

const CONTINUE_LOOP = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const sliced = str.slice(0, posIndex);
    const index = sliced.lastIndexOf('[');
    const secondSlice = str.slice(posIndex);
    const EndLoop = secondSlice.lastIndexOf(']');
    if (EndLoop === -1 || index === -1) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Loop Is Entered', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    };
    VariableMAP['char_pos'] = index;
    return [0, VariableMAP, logSTR];
};

const IF_OPEN = (VariableMAP, conf, logSTR, char) => {
    const startUps = ['¿', '⸮', '⁈', '⸘'];
    const currType = VariableMAP['curr_type'];
    const endUps = ['?', '⁇', '‽'];
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const CurrTape = VariableMAP[`${currType}_tape`];
    const varTape = VariableMAP['variable_tape'];
    const currCell = CurrTape[VariableMAP[`${currType}_position`]];
    const varCell = varTape[VariableMAP['variable_pos']];
    if (varCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const sliced = str.slice(posIndex + 1);
    const pattern = new RegExp(`[\\${endUps.join('\\')}]`, 'g');
    const index = str.slice(0, posIndex + 1).length + sliced.search(pattern);
    const codeBlock = str.slice(posIndex + 1, index);
    const endVal = endUps.indexOf(str[index]);
    const startVal = startUps.indexOf(char);
    const sumVals = startVal + endVal;
    const compareFunc = (comparison) => {
        const prevChar = str[posIndex - 1];
        if (prevChar === '!') comparison = !comparison;
        if (!comparison) {
            VariableMAP['char_pos'] += codeBlock.length + 1;
        };
        return [0, VariableMAP, logSTR];
    };
    switch (sumVals) {
        case 0: return compareFunc(currCell === varCell);
        case 1: return compareFunc(currCell < varCell);
        case 2: return compareFunc(currCell > varCell);
        case 3: return compareFunc(currCell !== varCell);
        case 4: return compareFunc(currCell <= varCell);
        case 5: return compareFunc(currCell >= varCell);
    };
};

const NOT_GATE = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const nextChar = str[posIndex + 1];
    if (!['¿', '⸮', '⁈', '⸘'].includes(nextChar)) {
        const enabledWarnings = conf['Visual Options']['Enable Warnings'];
        if (!enabledWarnings) return [0, VariableMAP, logSTR];
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const warning = new Warning('Unnecessary NOT Gate', data).str;
        logSTR = logSTR.replace(/^/, warning);
        return [1, VariableMAP, logSTR];
    }
    return [0, VariableMAP, logSTR];
};

const TELEPORT_TO_PORTAL = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const sliced = str.slice(0, posIndex);
    const portal = sliced.replace('\\O', '').lastIndexOf('O');
    VariableMAP['code'] = sliced + str.slice(posIndex + 1);
    if (portal !== -1) {
        VariableMAP['char_pos'] = portal;
        const pos = VariableMAP['char_pos'];
        if (VariableMAP['code'][posIndex] === VariableMAP['code'][pos + 1]) {
            const data = logObject(conf, pos);
            const warnout = 'Portal Includes Empty Content';
            const warning = new Warning(warnout, data).str;
            logSTR = logSTR.replace(/^/, warning);
            return [1, VariableMAP, logSTR];
        }
        return [0, VariableMAP, logSTR];
    }
    const pos = posIndex + 1;
    const enabledWarnings = conf['Visual Options']['Enable Warnings'];
    if (!enabledWarnings) return [0, VariableMAP, logSTR];
    const data = logObject(conf, pos);
    const warnout = 'No Portal Detected Before The Teleport';
    const warning = new Warning(warnout, data).str;
    logSTR = logSTR.replace(/^/, warning);
    return [1, VariableMAP, logSTR];
};

const SWAP_CELLS = (VariableMAP, conf, logSTR) => {
    const CurrCursorPos = VariableMAP['memory_position'];
    const VarPOS = VariableMAP['variable_pos'];
    const posIndex = VariableMAP['char_pos'];
    const currCell = VariableMAP['memory_tape'][CurrCursorPos];
    const VarCell = VariableMAP['variable_tape'][VarPOS];
    if (VarCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    // eslint-disable-next-line max-len
    [VariableMAP['variable_tape'][VarPOS], VariableMAP['memory_tape'][CurrCursorPos]] = [currCell, VarCell];
    return [0, VariableMAP, logSTR];
};

const VOID = (VariableMAP, _, logSTR) => {
    return [0, VariableMAP, logSTR];
};

const MODULO = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const VarPOS = VariableMAP['variable_pos'];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const VarCell = VariableMAP['variable_tape'][VarPOS];
    const posIndex = VariableMAP['char_pos'];
    if (VarCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (VarCell === 0) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Cannot Modulo Something By 0';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP[`${currType}_tape`][CurrCursorPos] = currCell % VarCell;
    return [0, VariableMAP, logSTR];
};

const SQRT = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const VarPOS = VariableMAP['variable_pos'];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    let VarCell = VariableMAP['variable_tape'][VarPOS];
    const posIndex = VariableMAP['char_pos'];
    if (VarCell === undefined || VarCell < 2) {
        VarCell = 2;
    }
    if (VariableMAP[`${currType}_tape`][CurrCursorPos] === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const result = Math.pow(currCell, 1/VarCell);
    VariableMAP[`${currType}_tape`][CurrCursorPos] = Math.round(result);
    return [0, VariableMAP, logSTR];
};

const POWER = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const VarPOS = VariableMAP['variable_pos'];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const VarCell = VariableMAP['variable_tape'][VarPOS];
    const posIndex = VariableMAP['char_pos'];
    if (VarCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const result = Math.pow(currCell, VarCell);
    VariableMAP[`${currType}_tape`][CurrCursorPos] = Math.round(result);
    return [0, VariableMAP, logSTR];
};

const DIVISION = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const VarPOS = VariableMAP['variable_pos'];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const VarCell = VariableMAP['variable_tape'][VarPOS];
    const posIndex = VariableMAP['char_pos'];
    if (VarCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (VarCell === 0) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('Memory Cell Cannot Be Divided By 0', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const result = currCell / VarCell;
    VariableMAP[`${currType}_tape`][CurrCursorPos] = Math.round(result);
    return [0, VariableMAP, logSTR];
};

const MULTIPLICATION = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const VarPOS = VariableMAP['variable_pos'];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const VarCell = VariableMAP['variable_tape'][VarPOS];
    const posIndex = VariableMAP['char_pos'];
    if (VarCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const result = currCell / VarCell;
    VariableMAP[`${currType}_tape`][CurrCursorPos] = Math.round(result);
    return [0, VariableMAP, logSTR];
};

const NATURAL_LOGARITHM = (VariableMAP, conf, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const posIndex = VariableMAP['char_pos'];
    if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    } else if (currCell <= 0) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Memory Cell Cannot Be Below Or Equal 0';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const result = Math.log(currCell);
    VariableMAP[`${currType}_tape`][CurrCursorPos] = Math.round(result);
    return [0, VariableMAP, logSTR];
};

const ABSOULETE = (VariableMAP, _, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const posIndex = VariableMAP['char_pos'];
    if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('No Memory Cell is Selected', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP[`${currType}_tape`][CurrCursorPos] = Math.abs(result);
    return [0, VariableMAP, logSTR];
};

const FUNCTION_OPEN = (VariableMAP, _, logSTR) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const sliced = str.slice(posIndex + 1);
    const pattern = new RegExp('(?:[^{}]+|\{(?:[^{}]+|\{[^{}]*\})*\})*\}');
    const codeBlock = pattern.exec(sliced)[0].slice(0, -1);
    VariableMAP['function_tape'].push(codeBlock);
    VariableMAP['char_pos'] += codeBlock.length + 1;
    return [0, VariableMAP, logSTR];
};

const FUNCTION_CALL = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const FuncPOS = VariableMAP['function_pos'];
    let FuncCell = VariableMAP['function_tape'][FuncPOS];
    if (FuncCell.indexOf('®') > -1) FuncCell += '∂';
    const posIndex = VariableMAP['char_pos'];
    if (FuncCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const error = new Error('Function Cell Doesn\'t Exist', data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const slicedFirst = str.slice(0, posIndex);
    const slicedSecond = str.slice(posIndex + 1);
    VariableMAP['preposition'] = ['char_pos', posIndex];
    VariableMAP['code'] = slicedFirst + FuncCell + slicedSecond;
    VariableMAP['char_pos']--;
    return [0, VariableMAP, logSTR];
};

const FUNCTION_REMOVAL = (VariableMAP, _, logSTR) => {
    const lastElement = VariableMAP['function_tape'].length - 1;
    VariableMAP['preposition'] = ['function_pos', lastElement];
    VariableMAP['function_tape'].pop();
    return [0, VariableMAP, logSTR];
};

const FUNCTION_RETURN = (VariableMAP, conf, logSTR, char) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const FuncTape = VariableMAP['function_tape'];
    const FuncPos = VariableMAP['function_pos'];
    const returnOperator = FuncTape[FuncPos] || [];
    if (returnOperator.indexOf(char) === -1) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Function Return Isn\'t Inside A Function';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    const sliced = str.slice(posIndex + 1);
    const endOfFunc = sliced.indexOf('∂');
    const calculationIndex = endOfFunc + sliced.indexOf(0, posIndex).length;
    VariableMAP['char_pos'] = calculationIndex + 1;
    return [0, VariableMAP, logSTR];
};

const RIGHT_FUNC_ARROW = (VariableMAP, _, logSTR) => {
    VariableMAP['preposition'] = ['function_pos', VariableMAP['function_pos']];
    VariableMAP['function_pos']++;
    return [0, VariableMAP, logSTR];
};

const LEFT_FUNC_ARROW = (VariableMAP, _, logSTR) => {
    VariableMAP['preposition'] = ['function_pos', VariableMAP['function_pos']];
    VariableMAP['function_pos']--;
    return [0, VariableMAP, logSTR];
};

const RANDOM_NUMBER = (VariableMAP, _, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const random = Math.floor(Math.random() * 100_000_000);
    VariableMAP[`${currType}_tape`][CurrCursorPos] = random;
    return [0, VariableMAP, logSTR];
};

const REPEATENCE = (VariableMAP, conf, logSTR, char) => {
    const posIndex = VariableMAP['char_pos'];
    const str = VariableMAP['code'];
    let VarCell = VariableMAP['variable_tape'][VariableMAP['variable_pos']];
    let ExitCode = 0;
    canRepeat = !canRepeat;
    if (!canRepeat) return [0, VariableMAP, logSTR];
    if (VarCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    if (VarCell <= 1) {
        const pos = posIndex + 1;
        const enabledWarnings = conf['Visual Options']['Enable Warnings'];
        VarCell = 2;
        if (enabledWarnings) {
            const data = logObject(conf, pos);
            const warnout = 'Variable Cell Is Below Or Equal To 1';
            const warning = new Warning(warnout, data).str;
            logSTR = logSTR.replace(/^/, warning);
            ExitCode = 1;
        }
    }
    let sliced = str.slice(posIndex + 1);
    const ending = sliced.indexOf(char);
    sliced = sliced.slice(0, ending);
    sliced = sliced.replace(/[^|]/g, '$&'.repeat(VarCell + 1));
    VariableMAP['code'] = str.slice(0, posIndex) + sliced;
    return [ExitCode, VariableMAP, logSTR];
};

const SHELL_RECORD = (VariableMAP, _, logSTR) => {
    const currType = VariableMAP['curr_type'];
    const CurrCursorPos = VariableMAP[`${currType}_position`];
    const currCell = VariableMAP[`${currType}_tape`][CurrCursorPos];
    const CharTranslation = String.fromCharCode(currCell);
    VariableMAP['preposition'] = [`${currType}_position`, CurrCursorPos];
    VariableMAP['shell'] += CharTranslation;
    return [0, VariableMAP, logSTR];
};

const SHELL_EXECUTE = (VariableMAP, conf, logSTR) => {
    const posIndex = VariableMAP['char_pos'];
    const lazyPrinting = conf['Operation Options']['Lazy Printing'];
    try {
        const results = execSync(VariableMAP['shell']);
        if (lazyPrinting) {
            logSTR += results.toString();
        }
        process.stdout.write(results.toString());
    } catch (err) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = `Shell Command Couldn\'t Be Executed`;
        const error = new Error(errorout, data).str;
        const coloredOutput = conf['Visual Options']['Colored Output'];
        const color = (coloredOutput) ? `\x1b[31m\x1b[4m`: '';
        const color2 = (coloredOutput) ? `\x1b[31m- ${err}\x1b[0m`: `- ${err}`;
        logSTR = logSTR.replace(/^/, error);
        logSTR += `\n${color}[PREVIEW] The Error That Was Caused\x1b[0m`;
        logSTR += `\n   ${color2}`;
        return [2, VariableMAP, logSTR];
    }
    return [0, VariableMAP, logSTR];
};

const PREPOSITION = (VariableMAP, _, logSTR) => {
    const prepos = VariableMAP['preposition'];
    VariableMAP[prepos[0]] = prepos[1];
    return [0, VariableMAP, logSTR];
};

const BACKSLASH = (VariableMAP, _, logSTR) => {
    VariableMAP['backslashed'] = true;
    return [0, VariableMAP, logSTR];
};

const MOVE_LEFT_BY_VARCELL = (VariableMAP, _, logSTR) => {
    const CurrCursorPos = VariableMAP['memory_position'];
    const CurrTape = VariableMAP['memory_tape'];
    const currCell = CurrTape[CurrCursorPos];
    const varPos = VariableMAP['variable_pos'];
    if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Memory Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['variable_tape'][varPos] += currCell;
    return [0, VariableMAP, logSTR];
};

const MOVE_RIGHT_BY_VARCELL = (VariableMAP, _, logSTR) => {
    const CurrCursorPos = VariableMAP['memory_position'];
    const CurrTape = VariableMAP['memory_tape'];
    const currCell = CurrTape[CurrCursorPos];
    const varPos = VariableMAP['variable_pos'];
    if (currCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Memory Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['variable_tape'][varPos] -= currCell;
    return [0, VariableMAP, logSTR];
};

const MOVE_LEFT_BY_MEMCELL = (VariableMAP, _, logSTR) => {
    const CurrCursorPos = VariableMAP['memory_position'];
    const varTape = VariableMAP['variable_tape'];
    const varPos = VariableMAP['variable_pos'];
    const varCell = varTape[varPos];
    if (varCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['memory_tape'][CurrCursorPos] += varCell;
    return [0, VariableMAP, logSTR];
};

const MOVE_RIGHT_BY_MEMCELL = (VariableMAP, _, logSTR) => {
    const CurrCursorPos = VariableMAP['memory_position'];
    const varTape = VariableMAP['variable_tape'];
    const varPos = VariableMAP['variable_pos'];
    const varCell = varTape[varPos];
    if (varCell === undefined) {
        const pos = posIndex + 1;
        const data = logObject(conf, pos);
        const errorout = 'Variable Cell Doesn\'t Exist';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['memory_tape'][CurrCursorPos] -= varCell;
    return [0, VariableMAP, logSTR];
};

const ARGUMENT_OPEN = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const posIndex = VariableMAP['char_pos'];
    const EndArgument = str.indexOf(')');
    const pos = posIndex + 1;
    const sliced = str.slice(pos, EndArgument);
    if (sliced.length === 0) {
        VariableMAP['args_tape'] = [];
        VariableMAP['char_pos']++;
        VariableMAP['curr_type'] = 'memory';
        VariableMAP['args_position'] = 0;
        return [0, VariableMAP, logSTR];
    }
    const AsciiNums = sliced.match(/\d{3}/gm);
    const actualContent = sliced.replace(/\s/g, '').split(/,/);
    if (JSON.stringify(AsciiNums) !== JSON.stringify(actualContent)) {
        const data = logObject(conf, pos);
        const errorout = 'Argument Format is incorrect';
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['args_tape'] = AsciiNums;
    VariableMAP['char_pos'] = EndArgument;
    return [0, VariableMAP, logSTR];
};

const ARGUMENT_SELECT = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const argsBuffer = VariableMAP['args_tape'];
    const posIndex = VariableMAP['char_pos'];
    const pos = posIndex + 1;
    const sliced = str.slice(pos);
    const digitsIndex = sliced.match(/\d+/)[0];
    if (digitsIndex >= argsBuffer.length || digitsIndex < 0) {
        const data = logObject(conf, pos);
        const errorout = `Argument Index Is Out Of Bounds(${digitsIndex})`;
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['curr_type'] = 'args';
    VariableMAP['args_position'] = digitsIndex;
    VariableMAP['char_pos'] += digitsIndex.length;
    return [0, VariableMAP, logSTR];
};

const ARGUMENT_TRANSFER = (VariableMAP, conf, logSTR) => {
    const str = VariableMAP['code'];
    const argsBuffer = VariableMAP['args_tape'];
    const posIndex = VariableMAP['char_pos'];
    const CurrCursorPos = VariableMAP['memory_position'];
    const pos = posIndex + 1;
    const sliced = str.slice(pos);
    const digitsIndex = sliced.match(/\d+/)[0];
    if (digitsIndex >= argsBuffer.length || digitsIndex < 0) {
        const data = logObject(conf, pos);
        const errorout = `Argument Index Is Out Of Bounds(${digitsIndex})`;
        const error = new Error(errorout, data).str;
        logSTR = logSTR.replace(/^/, error);
        return [2, VariableMAP, logSTR];
    }
    VariableMAP['memory_tape'][CurrCursorPos] = argsBuffer[digitsIndex];
    VariableMAP['char_pos'] += digitsIndex.length;
    return [0, VariableMAP, logSTR];
};

export const OperatorMap = {
    '+': PLUS,
    '-': MINUS,
    '<': LEFT_ARROW,
    '>': RIGHT_ARROW,
    '.': PRINT,
    ',': INPUT,
    '[': ENTER_LOOP,
    ']': EXIT_LOOP,
    '↥': POSITION_TO_END,
    '↧': POSITION_TO_START,
    'º': ASCII_PRINT,
    '#': CREATE_VARIABLE_CELL,
    '±': INCREMENT_VARIABLE_CELL,
    '∓': DECREMENT_VARIABLE_CELL,
    ':': REMOVE_VARIABLE_CELL,
    '»': RIGHT_VAR_ARROW,
    '«': LEFT_VAR_ARROW,
    '◊': VAR_MOVE_ENDUP,
    '⥲': MOVE_LEFT_BY_VARCELL,
    '⥳': MOVE_RIGHT_BY_VARCELL,
    '↝': MOVE_LEFT_BY_MEMCELL,
    '↜': MOVE_RIGHT_BY_MEMCELL,
    'Δ': BREAK_LOOP,
    '∇': CONTINUE_LOOP,
    '¿': IF_OPEN,
    '⸮': IF_OPEN,
    '⸘': IF_OPEN,
    '⁈': IF_OPEN,
    '!': NOT_GATE,
    'ø': TELEPORT_TO_PORTAL,
    '~': SWAP_CELLS,
    '%': MODULO,
    '√': SQRT,
    '*': MULTIPLICATION,
    '÷': DIVISION,
    '㏒': NATURAL_LOGARITHM,
    '^': POWER,
    '{': FUNCTION_OPEN,
    '•': FUNCTION_CALL,
    '¢': FUNCTION_REMOVAL,
    '®': FUNCTION_RETURN,
    '≥': RIGHT_FUNC_ARROW,
    '≤': LEFT_FUNC_ARROW,
    '¥': RANDOM_NUMBER,
    '|': REPEATENCE,
    '£': PREPOSITION,
    '⊹': ABSOULETE,
    '&': SHELL_RECORD,
    '$': SHELL_EXECUTE,
    '\\': BACKSLASH,
    '¶': ARGUMENT_SELECT,
    '¬': ARGUMENT_TRANSFER,
    '(': ARGUMENT_OPEN,
    ')': VOID,
    '}': VOID,
    'O': VOID,
    '⁇': VOID,
    '‽': VOID,
    '?': VOID,
    '∂': VOID,
};
