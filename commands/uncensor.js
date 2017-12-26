exports.run = (client, message, args, serverConf) => {
  if (!client.isAdmin(message.member, serverConf))
    return message.channel.send(`This is a bot admin only command!`);
  if (args.length != 1)
    return message.channel.send(`Wrong syntax, use ${prefix}help uncensor to see how to use it!`);

  if (args[0] == 'all') {
    serverConf.censor = [];
    client.settings.set(message.guild.id, serverConf);
    return message.channel.send(`All censored strings have been deleted!`);
  }

  if (isNaN(args[0]))
    return message.channel.send(`Argument must be a number (index)`);
  if (args[0] < 1 || args[0] > serverConf.censor.length)
    return message.channel.send(`Invalid index`);

  const index = args[0] - 1;
  serverConf.censor.splice(index, 1);
  message.channel.send(`Censored string deleted!`);
}
