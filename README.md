# Intellibot
Intellibot - The ultimate multipurpose Discord bot

# Access
At the time of creating this repository, it is private during initial build and Beta. There used to be another repository, but I forgot to ignore sensitive files, so I restarted with this one. This build is one of the first builds released.

# Incomplete
This repository is not the actual full repository. There are many ignored files such as API keys, Dev commands and more. The reason for it is to make it more complicated to clone as Intellibot is intended as reference, not cloning. This means that simply downloading the repo and launching `node bot.js` will not work intentionnally.

# Version
The below versions are relative to the repo, not the project itself. At the moment of creation, Intellibot is V2.1. V2 is mainly a major change in data structure, but it is also the first build that saw the eye of the public.

# Compatibility

The core of Intellibot relies on an EnMap based data structure. Because the EnMap package is OS specific, the project will only run on UNIX based systems. However, to make it work on Windows, simply uninstalling the npm "EnMap" package and reinstalling it on Windows should do the trick.

FFMPEG is required on your machine as well.

# V1.0 - Initial Commit
* Modified bot.js to hide constants
* Overall preparation for eventual but not certain public release of this repo

# V1.0.1 - Bug Fixes and Minor Changes

* ***RPCARD*** Fixed a problem where some RPCard backgrounds could not be used. However, some cases still happen for unknown reasons (a .jpg image is considered a webp image or something like that) which causes the process to crash. Added a message prompting to change the background for these cases.
* ***ADDADMIN*** Fixed the error message when user isn't the owner (was using the old data structure to fetch the prefix)
* ***UNCENSOR*** Fixed the error message of wrong syntax (was using the old data structure to fetch the prefix)
* Added *conf.json* to gitignore. You can get it in the first commit, but it is irrelevant to keep it in future commits, unless an option gets added/removed, since it's changed values are not so important.
* ***bot.js*** Now posts server count to the Discord Bots List API
* ***GUILDCREATE*** and ***GUILDDELETE*** Minor changes to the embed
* ***package.json*** dblposter package added (Discord Bots List)



# V1.0.2 - Music Playlist Fix and Help Welcome

* ***Music*** Fixed an issue when playing a playlist that contained links added with a url (instead of "current") would not work
* ***Help*** Fixed the welcome help file so it doesn't get considered as an "unknown command"

# V1.0.3 - Question Redesign and Google Fix

* ***Question*** After a question ends, Intellibot no longer replies to the message. Instead, it edits the question message with a beautiful embed 
* ***Google*** Fixed an issue where Intellibot would return 'No results found' by adding a User-Agent to the search query. 
* [to be monitored] Intellibot would sometimes log messages that isn't a command, added some conditions to prevent this (mostly triggering in the Discord Bots List server where many other bots have commands with the same prefix)