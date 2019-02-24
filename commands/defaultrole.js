exports.run = (client, message, args, serverConf) => {
  switch (args.length) {
    case 0:
      if (serverConf.defaultRole != null) {
        var embed = new client.Discord.RichEmbed()
          .setColor(client.guilds.get(message.guild.id).roles.get(serverConf.defaultRole).color)
          .setTitle(`Default Role`)
          .setDescription(`${client.guilds.get(message.guild.id).roles.get(serverConf.defaultRole).name}`);
        message.channel.send({ embed });
      } else {
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor('ORANGE')
            .setDescription(`:warning: No default role has been assigned to this server.`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 3000);
        });
      }
      break;

    case 1:
      if (client.isAdmin(message.member, serverConf)) {
        var RoleID = args[0];
        // Check if channel was mentionned
        if (
          client.guilds.get(message.guild.id).roles.some(function(role, i) {
            if (message.isMentioned(role.id)) {
              RoleID = role.id;
              return true;
            } else if (RoleID == role.id) {
              return true;
            }
          })
        ) {
          serverConf.defaultRole = RoleID;
          client.settings.set(message.guild.id, serverConf);
          var embed = new client.Discord.RichEmbed().setColor(client.guilds.get(message.guild.id).roles.get(serverConf.defaultRole).color).setTitle(`New Default Role`).setDescription(`${client.guilds.get(message.guild.id).roles.get(serverConf.defaultRole).name}`);
          message.channel.send({ embed });
        } else if (RoleID == "none") {
          serverConf.defaultRole = null;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 255, 255])
              .setDescription(`:white_check_mark: Default role removed!`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 3000);
          });
        } else {
          message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor('ORANGE')
              .setDescription(`:warning: The role ${args[0]} does not exist!`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 3000);
          });
        }
      } else {
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor('ORANGE')
            .setDescription(`:warning: Sorry, you do not have the admin permissions to change the default role...`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 3000);
        });
      }
      break;
    default:
      message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:x: Wrong syntax. Use \`${serverConf.prefix}help defaultrole\` for information on how to use it.`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 5000);
      });
  }
}