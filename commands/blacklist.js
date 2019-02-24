exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case (args.length == 0):
      if (Object.keys(client.settings.get(message.guild.id).blacklist).length == 0)
        return message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor('ORANGE')
            .setDescription(`:warning: There are no blacklisted commands!`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });

      var embed = new client.Discord.RichEmbed()
        .setColor([255, 255, 255])
        .setTitle('Blacklisted Commands')
        .setDescription(`These commands (or subcommands) can only be executed by bot admins.`);
      var fieldCount = 0;
      var longFields = [];
      for (cmd in client.settings.get(message.guild.id).blacklist) {
        if (fieldCount == 25) {
          message.channel.send({ embed });
          fieldCount = 0;
          embed = new client.Discord.RichEmbed()
            .setColor([255, 255, 255]);
        }
        if (client.settings.get(message.guild.id).blacklist.hasOwnProperty(cmd)) {
          var value = `\u200C`;
          if (typeof client.settings.get(message.guild.id).blacklist[cmd] == 'object') {
            for (sub in client.settings.get(message.guild.id).blacklist[cmd]) {
              if (client.settings.get(message.guild.id).blacklist[cmd].hasOwnProperty(sub)) {
                value += `- ${sub}\n`;
                if (typeof client.settings.get(message.guild.id).blacklist[cmd][sub] == 'object') {
                  for (subsub in client.settings.get(message.guild.id).blacklist[cmd][sub]) {
                    if (client.settings.get(message.guild.id).blacklist[cmd][sub].hasOwnProperty(subsub)) {
                      value += `\t- ${subsub}\n`;
                    }
                  }
                }
              }
            }
            longFields.push({ cmd, value });
          } else {
            embed.addField(cmd, value, true);
            fieldCount++;
          }
        }
      }

      longFields.forEach((field) => {
        if (fieldCount == 25) {
          message.channel.send({ embed });
          fieldCount = 0;
          embed = new client.Discord.RichEmbed()
            .setColor([255, 255, 255]);
        }
        embed.addField(field.cmd, field.value, true);
        fieldCount++;
      });

      message.channel.send({ embed });
      break;

    case (args.length > 0):

      if (!client.isAdmin(message.member, serverConf))
        return message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 0, 0])
            .setDescription(`:x: Only bot admins can use this blacklisting command!`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });


      if (args[0] == 'tree') {
        var embed = new client.Discord.RichEmbed()
          .setColor([255, 255, 255])
          .setTitle('Command Tree')
          .setDescription(`All the commands and subcommands that are available for blacklisting.`);
        var fieldCount = 0;
        var longFields = [];
        for (cmd in client.cmds) {
          if (fieldCount == 25) {
            message.channel.send({ embed });
            fieldCount = 0;
            embed = new client.Discord.RichEmbed()
              .setColor([255, 255, 255]);
          }
          if (client.cmds.hasOwnProperty(cmd)) {
            var value = `\u200C`;
            if (typeof client.cmds[cmd] == 'object') {
              for (sub in client.cmds[cmd]) {
                if (client.cmds[cmd].hasOwnProperty(sub)) {
                  value += `- ${sub}\n`;
                  if (typeof client.cmds[cmd][sub] == 'object') {
                    for (subsub in client.cmds[cmd][sub]) {
                      if (client.cmds[cmd][sub].hasOwnProperty(subsub)) {
                        value += `\t- ${subsub}\n`;
                      }
                    }
                  }
                }
              }
              longFields.push({ cmd, value });
            } else {
              embed.addField(cmd, value, true);
              fieldCount++;
            }
          }
        }
        longFields.forEach((field) => {
          if (fieldCount == 25) {
            message.channel.send({ embed });
            fieldCount = 0;
            embed = new client.Discord.RichEmbed()
              .setColor([255, 255, 255]);
          }
          embed.addField(field.cmd, field.value, true);
          fieldCount++;
        });
        return message.channel.send({ embed });
      }


      const command = args.shift();
      if (!client.cmds.hasOwnProperty(command))
        return message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 0, 0])
            .setDescription(`:x: ${command} is not one of my commands`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });
      if (args.length == 0) { // We want to blacklist the command
        serverConf.blacklist[command] = JSON.parse(JSON.stringify(client.cmds[command]));
        client.settings.set(message.guild.id, serverConf);
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:white_check_mark: The entire ${command} command has been blacklisted`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });
      } else if (args.length == 1) { // Subcommand 1
        var sub = args.shift();
        if (sub == 'root')
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: ${sub} is not a subcommand of ${command}`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 3000);
          });
        if (!client.cmds[command].hasOwnProperty(sub))
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: ${sub} is not a subcommand of ${command}`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 3000);
          });
        if (!client.settings.get(message.guild.id).blacklist.hasOwnProperty(command))
          serverConf.blacklist[command] = {};

        serverConf.blacklist[command][sub] = JSON.parse(JSON.stringify(client.cmds[command][sub]));
        if (client.settings.get(message.guild.id).blacklist[command].hasOwnProperty('root'))
          delete serverConf.blacklist[command].root;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:white_check_mark: The ${sub} subcommand of ${command} has been blacklisted`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });
      } else if (args.length == 2) { // Subcommand 2
        var sub1 = args.shift();
        var sub2 = args.shift();
        if (sub1 == 'root')
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: ${sub1} is not a subcommand of ${command}`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });
        if (sub2 == 'root')
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: ${sub2} is not a subcommand of ${command}`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });
        if (!client.cmds[command].hasOwnProperty(sub1))
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: ${sub1} is not a subcommand of ${command}`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });
        if (!client.cmds[command][sub1].hasOwnProperty(sub2))
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: ${sub2} is not a subcommand of the ${sub1} subcommand`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });
        if (!client.settings.get(message.guild.id).blacklist.hasOwnProperty(command))
          serverConf.blacklist[command] = {};
        if (!client.settings.get(message.guild.id).blacklist[command].hasOwnProperty(sub1))
          serverConf.blacklist[command][sub1] = {};
        if (!client.settings.get(message.guild.id).blacklist[command][sub1].hasOwnProperty(sub2))
          serverConf.blacklist[command][sub1][sub2] = true;
        if (client.settings.get(message.guild.id).blacklist[command].hasOwnProperty('root'))
          delete serverConf.blacklist[command].root;
        client.settings.set(message.guild.id, serverConf);
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setDescription(`:white_check_mark: The ${sub2} subcommand of the ${sub1} subcommand has been blacklisted`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });
      }

      break;
  }
}