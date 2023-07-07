/* eslint-disable indent */

/** Have A Predefined Log Object
     * @param {Object} conf - The Config Object
     * @param {Object} pos - The Operator Position
     * @return {Object}
*/
export function logObject(conf, pos) {
    const visualOptions = conf['Visual Options'];
    const isOperators = (pos === undefined) ? false : true;
    return {
        'isOperators': isOperators,
        'operator': pos,
        'colored': visualOptions['Colored Output'],
        'log': visualOptions['Logging'],
    };
}

/** Popup a error notifying the user what went wrong */
export class Error {
    /** The Constructor For The Error
     * @param {string} str - The String To Print For The Error
     * @param {Object} information - The Information For Representing The Error
    */
    constructor(str, information) {
        this.information = information;
        this.colored = this.information['colored'];
        const BRed = (this.colored) ? '\x1b[1m\x1b[31m' : '';
        const color2 = (this.colored) ? '\x1b[0m\x1b[31m' : '';
        const color3 = (this.colored) ? '\x1b[0m' : '';
        this.label = this.information['log']['Error Label'];
        if (this.information['isOperators']) {
            const color = (this.colored) ? '\x1b[4m' : '';
            const operator = `${color}OPERATOR ${this.information['operator']}`;
            const ErrorINFO = `${str} : ${operator}`;
            // eslint-disable-next-line max-len
            this.str = `${BRed}[${this.label}]${color2} ${ErrorINFO}${color3}\n`;
            return;
        };
        this.str = `${BRed}[${this.label}]${color2} ${str}${color3}\n`;
    }
};

/** Popup a warning notifying the user what isn't the right thing to do */
export class Warning {
    /** The Constructor For The Error
     * @param {string} str - The String To Print For The Error
     * @param {Object} information - The Information For Representing The Error
    */
    constructor(str, information) {
        this.information = information;
        this.colored = this.information['colored'];
        this.label = this.information['log']['Warning Label'];
        const BYellow = (this.colored) ? '\x1b[1m\x1b[33m' : '';
        const color2 = (this.colored) ? '\x1b[0m\x1b[33m' : '';
        const color3 = (this.colored) ? '\x1b[0m' : '';
        if (this.information['isOperators']) {
            const color = (this.colored) ? '\x1b[4m' : '';
            const operator = `${color}OPERATOR ${this.information['operator']}`;
            const ErrorINFO = `${str} | ${operator}`;
            // eslint-disable-next-line max-len
            this.str = `${BYellow}[${this.label}]${color2} ${ErrorINFO}${color3}\n`;
            return;
        };
        this.str = `${BYellow}[${this.label}]${color2} ${str}${color3}\n`;
    }
};

/** Popup a debug for extra information when debugging */
export class Debug {
    /** The Constructor For The Error
     * @param {string} str - The String To Print For The Error
     * @param {string} Exitcode - The exit code of the specific thing
     * @param {Object} information - The Information For Representing The Error
    */
    constructor(str, Exitcode, information) {
        this.information = information;
        this.color = '\x1b[32m';
        if (Exitcode === 1) this.color = '\x1b[33m';
        else if (Exitcode === 2) this.color = '\x1b[31m';
        this.colored = this.information['colored'];
        this.label = this.information['log']['Debug Label'];
        const colorState = (this.colored) ? `\x1b[1m\x1b[${this.color}` : '';
        const color2 = (this.colored) ? `\x1b[0m\x1b[${this.color}` : '';
        const color3 = (this.colored) ? '\x1b[0m' : '';
        if (this.information['isOperators']) {
            const color = (this.colored) ? '\x1b[4m' : '';
            const operator = `${color}OPERATOR ${this.information['operator']}`;
            const DebugINFO = `${str} | ${operator}`;
            // eslint-disable-next-line max-len
            this.str = `${colorState}[${this.label}]${color2} ${DebugINFO}${color3}\n`;
            return;
        };
        this.str = `${colorState}[${this.label}]${color2} ${str}${color3}\n`;
    }
};
