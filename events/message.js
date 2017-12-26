  exports.run = (client, Functions, Requires, message) => {
  try {
    // Do not accept DMs
    if (message.channel.type == 'dm' && message.author.id != client.user.id)
      return message.channel.send(`Sorry, but I was only made for servers, not private DMs or group DMs... Maybe, in the future, I will learn to make the difference between the two, maybe not..`);

    // Ignore Intellibot, unless he's giving the first piece to a user
    if (message.author.bot && !(message.content.includes("robotpiece"))) return;

    // Get the server's settings from the database
    var serverConf = client.settings.get(message.guild.id);
    if (!serverConf)
      return client.noinfo(message.channel, message.content);

    // Check if the message is not censored
    if (serverConf.censor.length > 0 && !client.isAdmin(message.member, serverConf)) {
      for (var i = 0; i < serverConf.censor.length; ++i) {
        if (serverConf.censor[i].split(' ').length == 1) {
          if (message.content.toString().split(' ').includes(serverConf.censor[i])) {
            if (serverConf.censorMsg)
              message.channel.send(`The message you sent contains a censored word, so I removed it`)
            return message.delete();
          }
        } else if (message.content.toLowerCase().indexOf(serverConf.censor[i]) >= 0) {
          if (serverConf.censorMsg)
            message.channel.send(`The message you sent contains censored strings, so I removed it.`);
          return message.delete();
        }
      }
    }

    // Ignore the message if it's not a command, unless we are listening for messages or the bot is mentioned (to get the prefix)
    if (message.content.indexOf(serverConf.prefix) !== 0 && !client.conf.messageListener && !message.isMentioned(client.user)) return;

    // If the bot is in debug mode, only allow the message to pass if it's from a Develpper
    var messageAllowed = message.author.id == client.user.id; // Just to init it. Normally, should be false, in the event it's Intellibot, it will be true no matter what
    if (client.conf.botDebug) {
      client.Developpers.Devs.some(function(dev, i) {
        if (dev.id == message.author.id) {
          messageAllowed = true;
          return true;
        }
      });
    } else {
      messageAllowed = true;
    }
    if (!messageAllowed) return;

    // Make sure the bot has permissions to send messages in the channel before we check if the bot is an admin
    if (!(message.channel.permissionsFor(client.user).has('SEND_MESSAGES')))
      return;

    // Check if Intellibot is an admin on the server. If not, ignore the message and send 1 warning.
    // try {
    //   if (!(message.channel.permissionsFor(client.user).has('ADMINISTRATOR')) && message.author.id != client.user.id && !serverConf.adminWarned) {
    //     serverConf.adminWarned = true;
    //     client.settings.set(message.guild.id, serverConf);
    //     return message.channel.send(`I've detected I am no longer have the administrator permission on this server. Because of that, some commands that require certain permissions could potentially crash me. To avoid this (and because the single coder wants to do something else with me other than checking for each permissions everytime), I'll be ignoring all your commands until you turn admin perms back on. This message will only appear once.`);
    //   } else if (serverConf.adminWarned && message.channel.permissionsFor(client.user).has('ADMINISTRATOR')) {
    //     serverConf.adminWarned = false;
    //     message.channel.send(`Thanks for re-enabling my administrator permissions! Commands for your server are no longer blocked!`);
    //     client.settings.set(message.guild.id, serverConf);
    //   }
    // } catch (err) {
    //   client.logger.warn(`Something went wrong when checking if I'm an admin in ${message.guild.name} (${message.guild.id}). Attempting to reload guilds.`);
    //   client.InitClient(client);
    // }

    // Reset prefix to default if we "@Intellibot %reset%"
    if (message.content == `${client.user} %reset%`) {
      if (!client.isAdmin(message.member, serverConf))
        return message.channel.send(`Only bot admins can use this reset command`);
      serverConf.prefix = '$';
      client.settings.set(message.guild.id, serverConf);
      return message.channel.send(`Prefix reseted to ${client.settings.get(message.guild.id).prefix}`);
    }

    // If Intellibot is mentioned in the message (other than reset which is already treated above), message the server's prefix
    if (message.isMentioned(client.user.id))
      return message.channel.send(`Command prefix: ${serverConf.prefix}\nUse ${serverConf.prefix}help for info on commands`);

    // The bot is listening to messages with the prefix. If it is not a command, it's a message, so we can stop here
    if (!message.content.startsWith(serverConf.prefix)) {
      if (message.author.id != client.user.id) {
        client.logger.bot(`\n\t\tMESSAGE`);
        client.logger.sys(`User: ` + `${message.author.username.toString()} (${message.author.id})\n` +
          `Server: ` + `${message.guild.name} (${message.guild.id})\n\t` +
          `${message.content}`);
      }
      return;
    }

    // Build the command with its arguments
    var args = message.content.slice(serverConf.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase();
    if (client.cmds.hasOwnProperty(command)) {
      client.logger.evt(`\n\t\tCOMMAND`);
      client.logger.sys(`User: ` + `${message.author.username.toString()} (${message.author.id})\n` +
        `Server: ` + `${message.guild.name} (${message.guild.id})\n` +
        `Command: ` + `${command}\n` +
        `Args: ` + `${args.length == 0 ? "NONE" : args}`);
    } else {
      client.logger.bot(`\n\t\tMESSAGE`);
      client.logger.sys(`User: ` + `${message.author.username.toString()} (${message.author.id})\n` +
        `Server: ` + `${message.guild.name} (${message.guild.id})\n\t` +
        `${message.content}`);
    }

    try {
      // Load command file
      let commandFile;
      try {
        commandFile = require(`../commands/${command}.js`);
      } catch (err) {
        return;
      }

      // Check Blacklist
      if (command in serverConf.blacklist && !client.isAdmin(message.member, serverConf)) {
        var r = JSON.parse(JSON.stringify(serverConf.blacklist[command]));
        if (typeof r == 'object') {
          if (r.hasOwnProperty('root'))
            return message.channel.send(`Sorry, this command has been blacklisted to non-botadmins!`);
          switch (command) {
            case "help":
            case "joke":
            case "meme":
              if (args.length >= 1) {
                const sub = args[0];
                if (r.hasOwnProperty(sub))
                  return message.channel.send(`Sorry, this subcommand has been blacklisted to non-botadmins!`);
              }
              break;
            case "music":
              if (args.length >= 1) {
                const sub = args[0];
                if (r.hasOwnProperty(sub)) {
                  if (sub == 'playlist') {
                    if (args.length == 3) {
                      const subsub = args[2];
                      if (r[sub].hasOwnProperty(subsub)) {
                        if (r)
                          return message.channel.send(`Sorry, this subcommand has been blacklisted to non-botadmins!`);
                      }
                    }
                  } else {
                    if (r)
                      return message.channel.send(`Sorry, this subcommand has been blacklisted to non-botadmins!`);
                  }
                }
              }
              break;
          }
        } else {
          if (r)
            return message.channel.send(`Sorry, this command has been blacklisted to non-botadmins!`);
        }
      }

      // Check for cooldown
      if(client.cooldown.has(message.author.id))
        return message.channel.send(`Wow there! You're sending commands too fast! I'm pretty sure none of my commands were meant to be spammed!`);
      else if(message.author.id != client.user.id && !client.isDev(message.author)) {
        client.cooldown.add(message.author.id);
        setTimeout(() => {
          client.cooldown.delete(message.author.id);
        }, 1500);
      }

      // Increment commands count
      serverConf.cmdCount++;
      client.settings.set(message.guild.id, serverConf);

      // Run the command
      commandFile.run(client, message, args, serverConf);

    } catch (err) {
      client.logger.error(`${err.stack == undefined ? err:err.stack}`);
    }
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
