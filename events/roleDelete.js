exports.run = (client, Functions, Requires, role) => {
  try {
    var serverConf = client.settings.get(role.guild.id);
    // If this role was the default role, we delete it
    if(role.id == serverConf.defaultRole){
      serverConf.defaultRole = null;
      client.settings.set(role.guild.id, serverconf);
    }
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
