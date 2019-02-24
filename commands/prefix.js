exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case args.length == 0:
      message.channel.send({
        embed: new client.Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setDescription(`:x: Wrong syntax. use ${serverConf.prefix}help prefix for info on this command`)
      }).then((m) => {
        setTimeout(function() {
          m.delete();
        }, 7000);
      });
      break;

    case args.length >= 1:

      if (client.isAdmin(message.member, serverConf)) {
        var NewPrefix = "";
        args.forEach(function(arg) {
          NewPrefix += arg;
          if (arg != args[args.length - 1])
            NewPrefix += " ";
        });
        if (NewPrefix.length >= 100)
          return message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 0, 0])
              .setDescription(`:x: Too long (that's what she said)`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });

        if (NewPrefix == '%reset%')
          serverConf.prefix = '$';
        else
          serverConf.prefix = NewPrefix;

        client.settings.set(message.guild.id, serverConf);

        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setTitle('Prefix Changed')
            .setColor([255, 255, 255])
            .setDescription(client.settings.get(message.guild.id).prefix)
        });
      } else {
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 0, 0])
            .setDescription(`:x: You do not have the bot's admin permissions to change the server prefix...`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 7000);
        });
      }
      break;

    default:

  }
}