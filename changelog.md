# Version 1.2.0
Another medium sized update done in a couple of days. It includes some important features like the wiki for BBF. Due to the arguments update, the interperter may be slightly under performant thann it was but it won't be noticable plus i increased a little bit the performance so it can "negate" the effect

# Additions
- Added a wiki that is currently work in progress 
- Added a tweak to change starting memory cell values to whatever number except decimal ones
- Added the opening argument operator ``(`` & the closing argument operator ``)``
- Added custom operator arguments support via using ``¶`` followed by a number index
- Added custom operator argument transfer via using ``¬`` followed by a number index
- Added ``§`` Set Memory Cell Operator in Expansions.mbbf

# Patches
- Fixed debug label not working
- Fixed config files being switched to default configs even tho the user uses custom configs

# Modifications
- Modified the interpreter to be slightly more performant
- Splitted the examples folder to 2 parts, MBBF file examples and BBF file examples

# Removals
- Removed the ``§`` Set Memory Cell Operator as a actual operator