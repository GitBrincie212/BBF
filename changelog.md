# Version 1.1.0
A medium size update done in 7 hours. It includes a good chunk of features, patches, modifications as well as removals for features like virtual memory tape and the abilitiy to use the NOT gate operator on loops

Additions:
- Added custom labelling for specific logs
- Added the ability to use config files only for once in runtime and not save it, and can be saved via ``-s`` or ``--sync``
- Added a warning when there are empty portals without anything inside
- Added "ASCII Print" ``º`` Operator
- Added "Absolute" ``⊹`` Mathematical Operator
- Added "Natural Logarithm" ``㏒`` Mathematical Operator
Patches:
- Fixed a bug where if you type a comment character first instead of a operator, it will error out
- Fixed a bug where backslash skips more than 1 operator
- Fixed a bug where the operator for repeating ``|`` has a difference of 1 compared to the amount of repentance and the variable cell(Example it will repeat twice if the variable cell is 3)
- Fixed a bug where the return operator ``®`` causes a javascript error output, when there are no functions on the function tape instead of a BBF error
- Fixed a bug where you could use the NOT operator ``!`` for the closing loop operator ``[``
Modification:
- Modified methods like ``executeFile`` & ``useConfig`` to return a string instead of printing it to the console
- Modified the name in config from ``Infinite Memory Tape`` to ``Dynamic Memory Tape``
- Modified the name in config from ``Wrap Memory Tape Around`` to ``Circular Memory Tape``
- Modified the loops so they can accept specific condition like less than, bigger than.... by default its equals
- Modified all Config options to now have spaces instead of some having ``_``
- Modified backslashed operators that aren't followed by a operator requiring a character to be ignored
- Modified so now it requires for the operator repentance ``|`` to have above 1 as value
- Extended The Expansions Module By _ Custom Operators

Removals:
- Removed "Virtual Tapes" & are no longer WIP as they are way too complicated and felt kinda unnecessary in most situations 
- Removed the ability to put "NOT" Operator ``!`` on loops since the new conditions exist

Feel free to report any bugs by creating a new issue on github