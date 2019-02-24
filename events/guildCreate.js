exports.run = (client, Functions, Requires, guild) => {
  try {
    client.logger.evt(`Joining a new guild: ${guild.name} (${guild.id})`);

    // Checking if guild is banned
    if (client.isBanned(guild)) {
      client.logger.warn(`Guild is banned!`);
      return guild.owner.user.send(`Sorry, but your server has been banned from using Intellibot...`).then((m) => {
        guild.leave();
      });
    }

    // Announce on events channel
    var embed = new client.Discord.RichEmbed()
      .setTitle("Joined Guild")
      .setColor([23, 209, 72])
      .setDescription(`${guild.name}`)
      .addField("Owner", `${guild.owner.user.username} (${guild.owner.user.id})`)
      .addField("Members", `${guild.memberCount - 1}`);
    client.channels.get(client.constants.events).send({ embed });

    // Just to be sure, lets check that it doesn't exist
    if (client.settings.has(guild.id)) return;

    client.addGuild(guild);

  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}