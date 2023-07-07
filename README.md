# Beyond Brainfuck / BBF
## Introduction
BBF™ or Beyond Brainfuck™ is a interperted esoteric programming language that pioniers ideas and features derivated from Brainfuck itself, and aims to improve on these foundations by adding a whole bunch of new operators, tweaking performance with algorithms, include self made custom operators and a lot more.

## Installation
To install the interpreter, clone the GitHub repository:
```git
git clone https://github.com/GitBrincie212/BBF
```

The interpreter will read the program from the file and execute it. Output will be printed to the console.

## File Types
BBF has 2 types, a config file and a script file. So when you are trying to run a script you have to specify the path to the script as well as the path to the config. Either relative or full as well as ``~``, ``.`` are supported

**Config Files**

>They are the configurations to tell the interperter specific instructions of how to optimise the code, how to run it and what to do when certain things meet up. Feel free to tweak the configs as much as you want. Just make sure they are valid

**Script Files**

>They are the scripts. Files that can be provided to run code. They usually end with ``.bbf`` or ``.mbbf`` for module bundled bbf files

* MBBF scripts aren't meant to be used for running code. But rather to import a template code in a BBF script file via config and use more variations

## Default Operators
The Default operators include Brainfuck ones and new ones, check documentations for how to use them. Here is a list

| Syntax      | Description |
| ----------- | ----------- |
| \+      |  **Increment Memory Cell By 1**       |
| \-   | **Decrement Memory Cell By 1**        |
| \>   |**Move MC By 1 Memory Cell Right**|
|<    |**Move MC By 1 Memory Cell Left**|
| \.    |**Print Memory Cell Character**|
|,     |**User Prompt & Record Into Memory Cell**|
| \[…\] | **Conditional Looping**|
| \|…\| | **Repeater**|
| ! | **NOT Gate**|
| [¿,⸮,⁈,⸘]…[?,⁇,‽] | **Condition (They Do Almost The Same Thing)**|
| {…} | **Create New Function**|
| ≤ | **Move FP By 1 Function Cell Forward**|
| ≥ | **Move FP By 1 Function Cell Backwards**|
| # | **Create New Variable Cell**
| ~ | **Swap Variable Value And Memory Cell Value**|
| ± | **Increment Variable Value By 1**|
| ∓ | **Decrement Variable Value By 1**|
| ꛷ | **Reset Memory Cell Value To 0**|
| O | **Open a Portal To Teleport In When In Need**|
| ø | **"Teleport" Or Go To The Last Portal**|




There are more operators. But these ones are worth showing due to the fact they will be really useful for programming



## Custom Operators
In MBBF files you can create your own operators. They are like functions but instead of having to know which the function is pointed by the function tape cursor. You can symbolise them by 1 character
* 2 Or More Character Will Result In A Warning And Only The First Character Will Be Read
* Any Colliding Operators With A Existing One Will Result In A Error

Recursions are possible with the operators as well so you can make something like this:

```m
@X = " …X"
```

It executes the code and then executes it again, going on for a infinite amount of time
You can even combine normal functions into them and even call them

```m
@Y = "{…}•"
```

As well as you can call custom operators inside custom operators

```m
@T = "…"
@W = "T…"
```

In the future custom operators will have more uses. But for now thats

## MBBF Scripts
Moduled Beyond Brainfuck Scripts are quite a unique type of file. They aren't used for running but rather for importing. MBBF Advantages include custom operators(not having to rely on where the function tape cursor is so you can call the function easier) as well as other syntax sugar. They end with the extension ``.mbbf``

For Custom Operators, I Talked about it in the previous chapter but in a nutshell they are functions that can be symbolised and do magical stuff as well as make the developer's life easier
```m
@W = "…"
```

## **The End**
This is the end, this was a passion project and i won't really stick to it for much longer than only 2-3 updates. You can report bugs if you want. View here for the update [changelog](./changelog.md)
