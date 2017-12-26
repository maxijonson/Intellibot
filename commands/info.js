exports.run = (client, message, args, serverConf) => {
  try {

    var embed = new client.Discord.RichEmbed()
      .setColor([255, 255, 255])
      .setTitle(`Your server and Intellibot`)
      .setDescription(`Here are some stats that I've collected during our journey together!`)
      .addField("Joined", `${serverConf.joined} \n(${client.timediff(new Date(serverConf.joined), new Date(), 'days')} days ago)`)
      .addField("Amount of commands launched", `${serverConf.cmdCount}`, true)
      .addField("Robotpieces made in this server", `${serverConf.rpGenerated}`, true)
      .addField("Dank memes created", `${serverConf.memesTotalCount}`, true)
      .addField("Strings encoded/decoded with Lucipher", `${serverConf.lucipherCount}\n\n`, true)
      .addField("Google searches", `${serverConf.googleCount}`, true)
      .addField("Sudokus solved", `${serverConf.sudokuCount}`, true)
      .addField("Music link plays", `${serverConf.playCount}`, true);

    message.channel.send({embed});
  } catch (err) {
    return;
  }
}
