exports.run = (client, Functions, Requires, channel) => {
  try {
    if(channel.type == "dm")
      return;
    var serverConf = client.settings.get(channel.guild.id);
    // if(!serverConf) {
    //   client.addGuild(channel.guild);
    //   serverConf = client.settings.get(channel.guild.id);
    // }

    if (serverConf) {
      if (serverConf.NotificationChannel == null && channel.type == "text") {
        serverConf.NotificationChannel = channel.id;
        channel.send(`Hey! Just wanted to let you know, I've set this channel as the notifications channel. You can change this with the notifications command!`);
        client.settings.set(channel.guild.id, serverConf);
      }
    }
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
