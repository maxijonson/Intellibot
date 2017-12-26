exports.run = (client, message, args, serverConf) => {

  if(args.length > 0) {
    if(!client.isAdmin(message.member, serverConf))
      return message.channel.send(`Sorry, only bot admins can use this command!`);
    var s = args.join(' ');
    serverConf.censor.push(s.toLowerCase());
    client.settings.set(message.guild.id, serverConf);
    message.channel.send(`New censor added!`);
  } else {
    if(serverConf.censor.length == 0)
      return message.channel.send(`There are no censored strings`)
    var msg = `Censored Strings:\n`;
    for(var i = 0; i < serverConf.censor.length; ++i) {
      msg += `${i + 1}. ${serverConf.censor[i]}\n`;
    }
    message.channel.send(msg, {split: true});
  }
}
