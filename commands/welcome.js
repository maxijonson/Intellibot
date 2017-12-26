exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case args.length == 0:
      message.channel.send(serverConf.welcome == null ? `There is no welcome message set for this server.` : `Welcome message:\n${serverConf.welcome} `);
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
          if(Message.length >= 1900)
            return message.channel.send(`Too long (that's what she said)`);
          serverConf.welcome = Message;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`New welcome message:\n${Message} `);
        } else {
          serverConf.welcome = null;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`Welcome message removed. Human to human contact is always better anyways :p`);
        }
      } else {
        message.channel.send(`Sorry, you can't do this command as you're not a bot admin.`);
      }
      break;
  }
}
