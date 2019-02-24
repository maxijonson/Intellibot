exports.run = (client, message, args, serverConf) => {
  switch (args.length) {
    case 0:
      return message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(':x: Must specify user or role to add as bot admin')
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 2500);
      });
      break;

    case 1:

      if (client.isAdmin(message.member, serverConf)) {
        // Get the mention
        var UserID = message.mentions.users.first() ? message.mentions.users.first().id : message.mentions.roles.first() ? message.mentions.roles.first().id : args[0]; // In case an actual ID is used

        if (message.guild.members.has(UserID) || message.guild.roles.has(UserID)) {
          if (!serverConf.Admins.includes(UserID)) {
            serverConf.Admins.push(UserID);
            client.settings.set(message.guild.id, serverConf);
            message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor([255, 255, 255])
                .setDescription(`:white_check_mark: ${client.users.get(UserID) ? client.users.get(UserID) : message.guild.roles.get(UserID)} has been added to this bot's admins!`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 2000);
            });
          } else {
            message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor([255, 0, 0])
                .setDescription(`:x: ${client.users.get(UserID) ? client.users.get(UserID) : message.guild.roles.get(UserID)} is already one of the bot's admin!`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 2500);
            });
          }
        } else {
          message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor('ORANGE')
              .setDescription(`:warning: User/Role ${args[0]} could not be found. The user/role you mentioned has to be in my scope (I should be in a same channel with them)`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 10000);
          });
        }
      } else {
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 0, 0])
            .setDescription(`:octagonal_sign: This command is restricted to bot admins only`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });
      }
      break;

    default:
      message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:x: Wrong syntax. Use \`${serverConf.prefix}help addadmin\` for information on how to use it.`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 5000);
      });
      break;
  }
}
