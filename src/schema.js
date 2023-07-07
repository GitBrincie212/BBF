/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable indent */

export const confSchema = {
    type: "object",
    properties: {
        "Runtime": {
            type: "object",
            description: "Runtime Settings For The Interperter",
            properties: {
                "Circular Memory Tape": {
                    type: "boolean",
                    description: "go to the start if you are beyond the ending boundaries of the memory tape and vias versa",
                },
                "Dynamic Memory Expansion": {
                    type: "boolean",
                    description: "Start with 1 memory cell and when out of the boundaries add 1 more memory cell with the value of 0",
                },
                "Memory Cell Value": {
                    type: "number",
                    description: "Start with 1 memory cell and when out of the boundaries add 1 more memory cell with the value of 0",
                },
            },
        },
        "Operation Options": {
            type: "object",
            properties: {
                "Lazy Printing": {
                    type: "boolean",
                    description: "If You Wanna Store It As A String Then Print",
                },
                "Input Fillness": {
                    type: "boolean",
                    description: "If You Wanna To Capture More Characters In Input",
                },
                Modes: {
                    type: "object",
                    properties: {
                        "Line Repetition": {
                            type: "boolean",
                            description: "If You Wanna Repeat The Code Based On Line",
                        },
                    },
                    required: [
                        "Line Repetition",
                    ],
                },
            },
            required: [
                "Lazy Printing",
                "Input Fillness",
            ],
        },
        "Visual Options": {
            type: "object",
            description: "Visual Output Options",
            properties: {
                "Colored Output": {
                    type: "boolean",
                    description: "If Some Outputs Will Be Colored, Bolded... etc",
                },
                "Enable Warnings": {
                    type: "boolean",
                    description: "If Some Outputs Will Be Colored, Bolded... etc",
                },
                "Logging": {
                    type: "object",
                    description: "Logging Options(Example Labels) For Modification",
                    properties: {
                        "Error Label": {
                            type: "string",
                            description: "The Logging Label For Error Outputs",
                        },
                        "Warning Label": {
                            type: "string",
                            description: "The Logging Label For Warning Outputs",
                        },
                        "Debug Label": {
                            type: "string",
                            description: "The Logging Label For Warning Outputs",
                        },
                    },
                },
            },
        },
        "Imports": {
            type: "array",
            description: "The MBBF File Imports",
            items: {
                type: "string",
            },
        },
    },
    required: ["Runtime", "Operation Options", "Visual Options"],
};
