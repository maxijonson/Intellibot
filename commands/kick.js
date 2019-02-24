exports.run = (client, message, args, serverConf) => {
  if (!client.isAdmin(message.member, serverConf))
    return message.channel.send({
      embed: new client.Discord.RichEmbed()
        .setColor('ORANGE')
        .setDescription(`:warning: Sorry, this is a command for bot admins only`)
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 5000);
    });
  if (args.length < 2)
    return message.channel.send({
      embed: new client.Discord.RichEmbed()
        .setColor([255, 0, 0])
        .setDescription(`:x: Wrong syntax. ${serverConf.prefix}help kick for info on the command.`)
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 5000);
    });

  let member = message.mentions.members.first();
  if (!member)
    return message.reply({
      embed: new client.Discord.RichEmbed()
        .setColor([255, 0, 0])
        .setDescription(":x: You need to mention a valid member of this server")
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 5000);
    });
  if (!member.kickable)
    return message.reply({
      embed: new client.Discord.RichEmbed()
        .setColor('ORANGE')
        .setDescription(":warning: I cannot kick this user! Either their role is higher than mine in roles hierarchy or I do not have kick permissions.")
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 10000);
    });

  let reason = args.slice(1).join(' ');
  if (!reason)
    return message.reply({
      embed: new client.Discord.RichEmbed()
        .setColor('ORANGE')
        .setDescription(":warning: Please indicate a reason for the kick!")
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 5000);
    });

  member.kick(reason)
    .then(function() {
      return message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 255, 255])
          .setDescription(`:white_check_mark: ${member.user.username} has been kicked.`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 3000);
      });
    })
    .catch((error) => {
      return message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor('ORANGE')
          .setDescription(`:warning: I was unable to kick ${member.user.username}... Please make sure I have permissions for that and that my role is higher than his!`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 10000);
      });
    });
}