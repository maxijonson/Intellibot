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

# V1.0.4 - Beautify Music and Fixes

V1.0.4 Is the start of the Beautify project. In the next few updates, it is planned to make all (or almost all)  bot replies in embeds and, if it seems relevant, clean up after himself after a certain amount of times, hence limiting the useless replies to build up in a channel. 

IDEA FOR THE FUTURE: add a server setting that would let admins choose wether or not the bot should also delete the message launched by the user (when it is a command). This would prevent a build up of commands, making the bot's presence seemless.

* ***Music*** Beautified replies
* ***Music*** Fixed playing saves not actually playing the save
* ***bot.js*** Added the stack trace on Unhandled Rejection errors. Although this trace isn't very accurate, it is still better than just the error message.
* ***bot.js*** Fixed a glitch where, when the bot would disconnect due to being alone in the channel, he would spam the remaining "Now Playing" messages.
* ***message.js*** Fixed ReferenceError

# V1.0.5 - Beautify

* ***Addadmin*** No longer outputs bot admins when no arg is given. Instead replies with an error, prompting the user to specify a user or role
* ***Music*** No longer logs info object. (forgot to take it out after tests)
* ***Music*** Now sends a message when no video is found and now sends a message when the API request limit is blown
* ***Music*** Volume now takes absolute values between 0 and 250 and that number gets remembered for the next play.
* ***Robotpiece*** and ***RPCard*** Fixed rankings not correct by adding a new function: sortRobotpieces(*array*)
* ***Addadmin*** Beautified
* ***Admins*** Beautified
* ***Censormsg*** Beautified
* ***Choose*** Beautified
* ***Decrypt*** Beautified
* ***Encrypt*** Beautified
* ***Funfact*** Beautified
* ***Help*** Beautified
* ***Invite*** Beautified
* ***Joke*** Beautified
* ***Kick*** Beautified
* ***DefaultRole*** Beautified
* ***Blacklist*** Beautified
* ***Censor*** Beautified
* ***Welcome*** Beautified

#### Final Commit

*this commit is being published years after the actual modifications, I had just forgotten about doing so over the years*

This commit is also the last one that will ever be made. With school getting rougher, I lost track of Intellibot, unfortunately. As this is being written, the last true changes were years ago and Intellibot still runs, though it may not in the future (either because some API endpoints may become deprecated or I will eventually shut down it's cloud server). Sometimes I get an error report from the bot, but it is usually connectivity issues. This project was made to give me experience with server-side JavaScript and it was definitely a success. The reason I will not be reworking it is because since these last changes, I grew a lot and my coding conventions have changed. Although JavaScript is still my favorite language, I now find Intellibot runs on "rookie" code and the project is too big to be revamped. I do not close the possibility of an Intellibot 2, which would probably run on Typescript  and be way more ready to adapt to changes. I decided to make this repo public as I initially wanted to do it when it comes out of Beta, but now I realize this won't happen. Thank you for everyone who has used Intellibot, I had great comments on it!