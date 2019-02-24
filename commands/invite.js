exports.run = (client, message, args, serverConf) => {
  message.channel.send({
    embed: new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setDescription(`https://discordapp.com/oauth2/authorize?client_id=356619840649428993&scope=bot&permissions=271707143`)
      .setTitle(`Invite Link`)
  }).catch(client.logger.error);
}
