exports.run = (client, Functions, Requires, guild) => {
  try {
    client.logger.evt(`Leaving guild: ${guild.name} (${guild.id})`);
    // Just to be sure, lets check that it doesn't exist
    if (client.settings.has(guild.id)) {
      //client.settings.delete(guild.id);
    }

    // if (client.fs.existsSync(`memes/${guild.id}`)) {
    //   client.fs.readdir(`memes/${guild.id}`, (err, files) => {
    //     if (err) throw err;
    //
    //     for (const file of files) {
    //       client.fs.unlinkSync(`memes/${guild.id}/${file}`, (error) => {
    //         if (error) throw error;
    //       });
    //     }
    //     client.fs.rmdirSync(`memes/${guild.id}`);
    //   });
    // }

    client.logger.sys(`Left guild ${guild.name} (${guild.id})`);

    // Announce on events channel
    var embed = new client.Discord.RichEmbed()
      .setTitle("Left Guild")
      .setColor([209, 23, 23])
      .setDescription(`${guild.name}`)
      .addField("Owner", `${guild.owner.user.username} (${guild.owner.user.id})`)
      .addField("Members", `${guild.memberCount - 1}`);
    client.channels.get(client.constants.events).send({ embed });

  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}