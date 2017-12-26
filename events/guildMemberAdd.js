exports.run = (client, Functions, Requires, member) => {
  try {
    var serverConf = client.settings.get(member.guild.id);
    // Welcome message
    if (serverConf.welcome != null) {
      var Message = serverConf.welcome;
      Message = Message.replace(/%u/gi, member.user.username).replace(/%s/gi, member.guild.name).replace(/%m/gi, member.user);
      if (serverConf.NotificationChannel != null)
        if (client.channels.get(serverConf.NotificationChannel).permissionsFor(client.user).has('SEND_MESSAGES'))
          client.channels.get(serverConf.NotificationChannel).send(Message);
    }


    // Default Role
    if (serverConf.defaultRole != null) {
      member.addRole(serverConf.defaultRole).catch(function(err) {
        if (serverConf.NotificationChannel != null)
          if (client.channels.get(serverConf.NotificationChannel).permissionsFor(client.user).has('SEND_MESSAGES'))
            client.channels.get(serverConf.NotificationChannel).send(`Sorry, I could not add ${member.user.username} to the ${member.guild.roles.get(serverConf.defaultRole)} role. Are you sure I have the appropriate permissions to do so? Make sure my role is at the very top in the server's roles settings.`);
        client.logger.error(`(on.guildMemberAdd - Add to default role) ${err}`);
      });
    }
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
