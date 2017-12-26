exports.run = (client, message, args, serverConf) => {
  if(args.length != 0)
    return;

  const index = Math.floor(Math.random() * client.Other.funfacts.length);
  const embed = new client.Discord.RichEmbed({
    "title": `Fact #${index + 1}`,
    "description": client.Other.funfacts[index]
  }).setColor(16777215);
  message.channel.send(embed);
}
