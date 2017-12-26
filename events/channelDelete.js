exports.run = (client, Functions, Requires, channel) => {
  try {
    var serverConf = client.settings.get(channel.guild.id);
    if(channel.id == serverConf.NotificationChannel) {
      serverConf.NotificationChannel = null;
      channel.guild.channels.some(function(newChannel, i) {
        if(newChannel.type != "text")
          return false;
        serverConf.NotificationChannel = newChannel.id;
        channel.guild.channels.get(serverConf.NotificationChannel).send(`Oh no! You deleted the notification channel! I've changed it to ${channel.guild.channels.get(serverConf.NotificationChannel)} for now. You can always change that using the notifications command!`);
        return true;
      });
      client.settings.set(channel.guild.id, serverConf);
    }
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
