exports.run = (client, message, args, serverConf) => {

  if (args.length > 0) {
    if (!client.isAdmin(message.member, serverConf))
      return message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:x: Sorry, only bot admins can use this command!`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 5000);
      });
    var s = args.join(' ');
    serverConf.censor.push(s.toLowerCase());
    client.settings.set(message.guild.id, serverConf);
    message.channel.send({
      embed: new client.Discord.RichEmbed()
        .setColor([255, 255, 255])
        .setDescription(`:white_check_mark: New censor added!`)
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 3000);
    });
  } else {
    if (serverConf.censor.length == 0)
      return message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor('ORANGE')
          .setDescription(`:warning: There are no censored strings`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 3000);
      });
    var msg = `Censored Strings:\n`;
    for (var i = 0; i < serverConf.censor.length; ++i) {
      msg += `${i + 1}. ${serverConf.censor[i]}\n`;
    }
    message.channel.send({
      embed: new client.Discord.RichEmbed()
        .setColor([255, 255, 255])
        .setDescription(msg)
        .setTitle('Censored Strings')
    });
  }
}