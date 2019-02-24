exports.run = (client, message, args) => {
  message.channel.send({
    embed: new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setDescription(`:ping_pong: Pong! \`${Math.floor(client.ping)}ms\``)
  }).catch(client.logger.error);
}