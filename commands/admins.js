exports.run = (client, message, args, serverConf) => {
      var Admins = "";
      for (admin in serverConf.Admins) {
        Admins += `${client.users.get(serverConf.Admins[admin]) ? client.users.get(serverConf.Admins[admin]).username : message.guild.roles.get(serverConf.Admins[admin]).name}\n`;
      }
      message.channel.send(`Current admins:\n${Admins}`);
}
