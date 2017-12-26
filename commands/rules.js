exports.run = (client, message, args, serverConf) => {
  switch (true) {
    case (args.length == 0):
      message.channel.send(`Rules:\n${serverConf.rules}`);
      break;

    case (args.length > 0):
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
          serverConf.rules = Message;
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`Rules have been set. We now live in a structured server!`);
        } else {
          serverConf.rules = "No rules are set! It's anarchy!";
          client.settings.set(message.guild.id, serverConf);
          message.channel.send(`Anarchy has been declared!`);
        }
      } else {
        message.channel.send(`Sorry, you do not have the admin permissions to change the rules (no badasses accepted here)...`);
      }
      break;
    default:
      message.channel.send(`Wrong syntax. Use \`${serverConf.prefix}help rules\` for information on how to use it.`);
  }
}
