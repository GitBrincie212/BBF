/* eslint-disable indent */

const renderTape = (Tape, Pos, border, spaces) => {
    const consoleWidth = process.stdout.columns;
    const elementWidth = 3;
    const borderLen = border.length + spaces;
    const calc = Math.floor(consoleWidth / elementWidth) - (borderLen * 2);
    const maxElements = Math.min(Tape.length, calc);
    let startIndex = Math.max(Pos - Math.floor(maxElements / 2), 0);
    let endIndex = Math.min(startIndex + (maxElements / 2), Tape.length);
    const firstCompare = Pos > startIndex + Math.floor(maxElements / 2) - 1;
    const secondCompare = endIndex < Tape.length;
    if (firstCompare && secondCompare) {
        startIndex++;
        endIndex++;
    }
    const slicedTape = Tape.slice(startIndex, endIndex);
    const renderedTape = slicedTape.map(
        (elem, _) => `[${elem.toString().padStart(1, '0')}]`,
    );
    const renderedCell = renderedTape[Pos - startIndex];
    if (renderedTape.length === 0) {
        const emptynessLen = consoleWidth - (borderLen * 2);
        const empty = ' '.repeat(emptynessLen);
        const borderStart = `${border}${' '.repeat(spaces)}`;
        const borderEnd = `${' '.repeat(spaces)}${border}`;
        return `${borderStart}${empty}${borderEnd}`;
    };
    const color = '\x1b[0m\x1b[1m\x1b[32m';
    renderedTape[Pos - startIndex] = renderedCell.replace(/^/, color);
    renderedTape[Pos - startIndex] += '\x1b[0m';
    const TapeSTR = renderedTape.join(' ');
    const TapeLen = TapeSTR.length;
    const padding = Math.floor((consoleWidth - TapeLen) / 2);
    const startPad = padding + TapeLen + (borderLen * 2);
    const endPad = consoleWidth + ((borderLen + 4.5) * 2);
    const centered = TapeSTR.padStart(startPad, ' ').padEnd(endPad, ' ');
    const renderedSTR = `${border}${centered}${border}`;
    return renderedSTR;
};

const centerText = (text, border, spaces) => {
    const modifiedText = text.replace(/\x1B\[\d*m/gui, '');
    const consoleWidth = process.stdout.columns;
    const textLen = modifiedText.length;
    const padding = Math.floor((consoleWidth + textLen) / 2);
    const centeredText = modifiedText.padStart(padding, ' ');
    const borderStart = `${border}${' '.repeat(spaces)}`;
    let renderedText = `${borderStart}${centeredText}`;
    const calc = consoleWidth - renderedText.length - 1;
    const endPad = ' '.repeat(Math.floor(calc));
    renderedText = `${renderedText}${endPad}${border}`;
    return renderedText;
};

const createBoxLayout = (open, close, line) => {
    const consoleWidth = process.stdout.columns;
    let ceilingStr = open + line.repeat(consoleWidth - 2) + close;
    ceilingStr += '\x1b[0m';
    ceilingStr = ceilingStr.replace(/^/, '\x1b[1m');
    return ceilingStr;
};

const borderAroundEmpty = (border, spaces) => {
    const consoleWidth = process.stdout.columns;
    const borderLen = border.length + 2;
    const emptynessLen = consoleWidth - (borderLen * 2);
    const borderStart = `${border}${' '.repeat(spaces)}`;
    const borderEnd = `${' '.repeat(spaces)}${border}`;
    const empty = ' '.repeat(emptynessLen);
    const renderedSTR = `${borderStart}${empty}${borderEnd}\n`;
    return renderedSTR;
};

const borderLine = (open, line, close) => {
    const consoleWidth = process.stdout.columns;
    const borderLen = open.length + close.length;
    const lineLen = consoleWidth - borderLen;
    const lineBreak = line.repeat(lineLen);
    const renderedSTR = `${open}${lineBreak}${close}\n`;
    return renderedSTR;
};

export const renderCLI = (VariableMAP, char) => {
    const MemoryTape = VariableMAP['memory_tape'];
    const VarTape = VariableMAP['variable_tape'];
    const MemoryPos = VariableMAP['memory_position'];
    const VarPos = VariableMAP['variable_pos'];
    const renderedMemoryTape = renderTape(MemoryTape, MemoryPos, '│', 2);
    const renderedVarTape = renderTape(VarTape, VarPos, '│', 2);
    const MTLabel = centerText('\x1b[1mMemory Tape\x1b[0m', '│', 2);
    const VARLabel = centerText('\x1b[1mVariable Tape \x1b[0m', '│', 2);
    // eslint-disable-next-line max-len
    const MemorySTR = `Memory Position: \x1b[1m${MemoryPos}   \x1b[0mMemory Tape Length: \x1b[1m${MemoryTape.length}\x1b[0m`;
    const Information = centerText(MemorySTR, '│', 0);
    const upClose = createBoxLayout('╭', '╮', '─');
    const downClose = createBoxLayout('╰', '╯', '─');
    const empty = borderAroundEmpty('│', 2);
    const lineBorder = borderLine('├', '─', '┤');
    // eslint-disable-next-line max-len
    const sectionFirst = `${empty}${MTLabel}\n${empty}${renderedMemoryTape}${empty}`;
    const sectionSecond = `${lineBorder}${Information}\n${lineBorder}${empty}`;
    const sectionThird = `${VARLabel}\n${empty}${renderedVarTape}${empty}`;
    // eslint-disable-next-line max-len
    const renderSTR = `\x1b[0m${upClose}${sectionFirst}${sectionSecond}${sectionThird}${downClose}`;
    console.log('\x1Bc');
    console.log(renderSTR);
};
