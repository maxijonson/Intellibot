exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case args.length == 0:
      message.channel.send(`Wrong syntax. use ${serverConf.prefix}help prefix for info on this command`);
      break;

    case args.length >= 1:

      if (client.isAdmin(message.member, serverConf)) {
        var NewPrefix = "";
        args.forEach(function(arg) {
          NewPrefix += arg;
          if (arg != args[args.length - 1])
            NewPrefix += " ";
        });
        if(NewPrefix.length >= 200)
          return message.channel.send(`Too long (that's what she said)`);

        if(NewPrefix == '%reset%')
          serverConf.prefix = '$';
        else
          serverConf.prefix = NewPrefix;

        client.settings.set(message.guild.id, serverConf);

        message.channel.send(`Prefix changed to \`${client.settings.get(message.guild.id).prefix}\``);
      } else {
        message.channel.send(`Sorry, you do not have the bot's admin permissions to change the server prefix...`);
      }
      break;

    default:

  }
}
