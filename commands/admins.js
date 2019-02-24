exports.run = (client, message, args, serverConf) => {
  var Admins = "";
  for (admin in serverConf.Admins) {
    Admins += `${client.users.get(serverConf.Admins[admin]) ? client.users.get(serverConf.Admins[admin]).username : message.guild.roles.get(serverConf.Admins[admin]).name}\n`;
  }
  message.channel.send({
    embed: new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setTitle(':star2:  Bot Admins')
      .setDescription(Admins)
  });
}
