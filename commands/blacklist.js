exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case (args.length == 0):
      if (Object.keys(client.settings.get(message.guild.id).blacklist).length == 0)
        return message.channel.send(`There are no blacklisted commands!`);
      var msg = `Blacklist:\n`;
      for (cmd in client.settings.get(message.guild.id).blacklist) {
        if (client.settings.get(message.guild.id).blacklist.hasOwnProperty(cmd)) {
          msg += `- ${cmd}\n`;
          if (typeof client.settings.get(message.guild.id).blacklist[cmd] == 'object') {
            for (sub in client.settings.get(message.guild.id).blacklist[cmd]) {
              if (client.settings.get(message.guild.id).blacklist[cmd].hasOwnProperty(sub)) {
                msg += `\t- ${sub}\n`;
                if (typeof client.settings.get(message.guild.id).blacklist[cmd][sub] == 'object') {
                  for (subsub in client.settings.get(message.guild.id).blacklist[cmd][sub]) {
                    if (client.settings.get(message.guild.id).blacklist[cmd][sub].hasOwnProperty(subsub)) {
                      msg += `\t\t- ${subsub}\n`;
                    }
                  }
                }
              }
            }
          }
        }
      }
      message.channel.send(msg);
      break;

    case (args.length > 0):
      if (!client.isAdmin(message.member, serverConf))
        return message.channel.send(`Sorry, only admins can use this blacklisting command!`);
      if (args[0] == 'tree') {
        var msg = `Command Tree:\n`;
        for (cmd in client.cmds) {
          if (client.cmds.hasOwnProperty(cmd)) {
            msg += `- ${cmd}\n`
            if (typeof client.cmds[cmd] == 'object') {
              for (sub in client.cmds[cmd]) {
                if (client.cmds[cmd].hasOwnProperty(sub)) {
                  if (sub != 'root')
                    msg += `\t- ${sub}\n`;
                  if (typeof client.cmds[cmd][sub] == 'object') {
                    for (subsub in client.cmds[cmd][sub]) {
                      if (client.cmds[cmd][sub].hasOwnProperty(subsub)) {
                        if (subsub != 'root')
                          msg += `\t\t- ${subsub}\n`;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return message.channel.send(msg);
      }

      const command = args.shift();
      if (!client.cmds.hasOwnProperty(command))
        return message.channel.send(`${command} is not one of my commands`);
      if (args.length == 0) { // We want to blacklist the command
        serverConf.blacklist[command] = JSON.parse(JSON.stringify(client.cmds[command]));
        client.settings.set(message.guild.id, serverConf);
        message.channel.send(`The entire ${command} command has been blacklisted`);
      } else if (args.length == 1) { // Subcommand 1
        var sub = args.shift();
        if (sub == 'root')
          return message.channel.send(`${sub} is not a subcommand of ${command}`);
        if (!client.cmds[command].hasOwnProperty(sub))
          return message.channel.send(`${sub} is not a subcommand of ${command}`);
        if (!client.settings.get(message.guild.id).blacklist.hasOwnProperty(command))
          serverConf.blacklist[command] = {};

        serverConf.blacklist[command][sub] = JSON.parse(JSON.stringify(client.cmds[command][sub]));
        if (client.settings.get(message.guild.id).blacklist[command].hasOwnProperty('root'))
          delete serverConf.blacklist[command].root;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send(`The ${sub} subcommand of ${command} has been blacklisted`);
      } else if (args.length == 2) { // Subcommand 2
        var sub1 = args.shift();
        var sub2 = args.shift();
        if (sub1 == 'root')
          return message.channel.send(`${sub1} is not a subcommand of ${command}`);
        if (sub2 == 'root')
          return message.channel.send(`${sub2} is not a subcommand of ${command}`);
        if (!client.cmds[command].hasOwnProperty(sub1))
          return message.channel.send(`${sub1} is not a subcommand of ${command}`);
        if (!client.cmds[command][sub1].hasOwnProperty(sub2))
          return message.channel.send(`${sub2} is not a subcommand of the ${sub1} subcommand`);
        if (!client.settings.get(message.guild.id).blacklist.hasOwnProperty(command))
          serverConf.blacklist[command] = {};
        if (!client.settings.get(message.guild.id).blacklist[command].hasOwnProperty(sub1))
          serverConf.blacklist[command][sub1] = {};
        if (!client.settings.get(message.guild.id).blacklist[command][sub1].hasOwnProperty(sub2))
          serverConf.blacklist[command][sub1][sub2] = true;
        if (client.settings.get(message.guild.id).blacklist[command].hasOwnProperty('root'))
          delete serverConf.blacklist[command].root;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send(`The ${sub2} subcommand of the ${sub1} subcommand has been blacklisted`);
      }

      break;
  }
}
