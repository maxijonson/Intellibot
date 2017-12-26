exports.run = (client, message, args, serverConf) => {
  if (!client.isAdmin(message.member, serverConf))
    return message.channel.send(`Sorry, this is a 'bot admin' only command`);
  if (args.length == 0)
    return message.channel.send(`Missing arguments.`);
  if (args[0] == 'all') {
    serverConf.blacklist = {};
    client.settings.set(message.guild.id, serverConf);
    return message.channel.send(`All commands were removed from the blacklist`);
  }
  const command = args.shift();
  if (!serverConf.blacklist.hasOwnProperty(command))
    return message.channel.send(`${command} is not in the blacklist`);
  if (args.length == 0) { // We want to blacklist the command
    delete serverConf.blacklist[command];
    client.settings.set(message.guild.id, serverConf);
    message.channel.send(`The entire ${command} command has been unblacklisted`);
  } else if (args.length == 1) { // Subcommand 1
    var sub = args.shift();
    if (!serverConf.blacklist[command].hasOwnProperty(sub))
      return message.channel.send(`${sub} is not a blacklisted subcommand of ${command}`);
    delete serverConf.blacklist[command][sub];
    if (serverConf.blacklist[command].hasOwnProperty('root'))
      delete serverConf.blacklist[command].root;
    client.settings.set(message.guild.id, serverConf);
    message.channel.send(`The ${sub} subcommand of ${command} has been unblacklisted`);
  } else if (args.length == 2) { // Subcommand 2
    var sub1 = args.shift();
    var sub2 = args.shift();
    if (!serverConf.blacklist[command].hasOwnProperty(sub1))
      return message.channel.send(`${sub} is not a blacklisted subcommand of ${command}`);
    if (!serverConf.blacklist[command][sub1].hasOwnProperty(sub2))
      return message.channel.send(`${sub2} is not a blacklisted subcommand of the ${sub1} subcommand`);
    delete serverConf.blacklist[command][sub1][sub2];
    if (serverConf.blacklist[command].hasOwnProperty('root'))
      delete serverConf.blacklist[command].root;
    client.settings.set(message.guild.id, serverConf);
    message.channel.send(`The ${sub2} subcommand of the ${sub1} subcommand has been unblacklisted`);
  }
}
