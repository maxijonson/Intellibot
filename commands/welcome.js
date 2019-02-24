exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case args.length == 0:
      if (serverConf.welcome == null)
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor('ORANGE')
            .setDescription(`:warning: There is no welcome message set for this server.`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 5000);
        });
      else
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 255, 255])
            .setTitle('Welcome Message')
            .setDescription(serverConf.welcome)
        });
      break;

    case args.length >= 1:
      if (client.isAdmin(message.member, serverConf)) {
        var Message = "";

        args.forEach(function(arg) {
          Message += arg;
          if (arg != args[args.length - 1])
            Message += " ";
        });
        if (Message != "%reset%") {
          if (Message.length >= 1900)
            return message.channel.send({
              embed: new client.Discord.RichEmbed()
                .setColor([255, 255, 255])
                .setDescription(`:x: Too long (that's what she said)`)
            }).then((m) => {
              setTimeout(function() {
                m.delete();
              }, 5000);
            });
          serverConf.welcome = Message;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 255, 255])
              .setDescription(Message)
              .setTitle('New Welcome Message')
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 30000);
          });
        } else {
          serverConf.welcome = null;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send({
            embed: new client.Discord.RichEmbed()
              .setColor([255, 255, 255])
              .setDescription(`:white_check_mark: Welcome message removed.`)
          }).then((m) => {
            setTimeout(function() {
              m.delete();
            }, 5000);
          });
        }
      } else {
        message.channel.send({
          embed: new client.Discord.RichEmbed()
            .setColor([255, 0, 0])
            .setDescription(`:x: Sorry, you can't do this command as you're not a bot admin.`)
        }).then((m) => {
          setTimeout(function() {
            m.delete();
          }, 10000);
        });
      }
      break;
  }
}