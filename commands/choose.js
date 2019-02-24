exports.run = (client, message, args, serverConf) => {
  if (args.length < 2)
    return message.channel.send({
      embed: new client.Discord.RichEmbed()
        .setColor([255, 0, 0])
        .setDescription(`:x: Must specify at least two choices`)
    }).then((m) => {
      setTimeout(function() {
        m.delete();
      }, 5000);
    });
  message.channel.send({
    embed: new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setDescription(`:point_right: I choose: ${args[Math.floor(Math.random()*args.length)]}`)
  });
}
