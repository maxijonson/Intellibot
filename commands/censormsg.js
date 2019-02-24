exports.run = (client, message, args, serverConf) => {
  if (!client.isAdmin(message.member, serverConf))
    return message.channel.send({
      embed: new client.Discord.RichEmbed()
        .setColor([255, 0, 0])
        .setDescription(`:octagonal_sign: Only bot admins can use this command.`)
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 5000);
    });
  serverConf.censorMsg = !serverConf.censorMsg;
  client.settings.set(message.guild.id, serverConf);
  message.channel.send({
    embed: new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setDescription(`:white_check_mark: censorMsg has been set to \`${serverConf.censorMsg}\``)
  }).then((m) => {
    setTimeout(function() {
      m.delete();
    }, 2500);
  });
}
