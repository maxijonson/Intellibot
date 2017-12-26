exports.run = (client, message, args, serverConf) => {
  if(!client.isAdmin(message.member, serverConf))
    return message.channel.send(`Only bot admins can use this command.`);
  serverConf.censorMsg = !serverConf.censorMsg;
  client.settings.set(message.guild.id, serverConf);
  message.channel.send(`censorMsg has been set to ${serverConf.censorMsg}`);
}
