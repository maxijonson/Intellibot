module.exports = function(client) {
  try {
    client.logger.info("Connected");
    client.logger.info(`${client.user.username} (${client.user.id})`);

    // Adding guilds to conf.json
    client.logger.evt("Creating guilds");
    client.guilds.forEach(guild => {
      // Checking if it already exists
      var Exists = false;
      if (client.settings.has(guild.id)) {
        Exists = true;
      }

      // If it doesn't, then we push it
      if (!Exists) {
        client.addGuild(guild);
      } else {
        client.logger.warn(`${guild.name} (${guild.id}) already exists!`);
      }
    });
    client.user.setGame(client.conf.botGame).then(client.logger.bot(`Game set to ${client.conf.botGame}`)).catch(client.logger.error);
    client.user.setStatus(client.conf.botStatus).then(client.logger.bot(`Status set to ${client.conf.botStatus}`)).catch(client.logger.error);
    client.user.setAFK(client.conf.botAfk).then(client.logger.bot(`AFK set to ${client.conf.botAfk}`)).catch(client.logger.error);

    // Conf crash
    if (client.conf.botCrashed) {
      client.channels.get(client.constants.crash).send(`***CONF.JSON CRASH***\nRewrote conf.json with default values:\n${JSON.stringify(client, null, '\t')}`)
      client.conf.botCrashed = false;
      client.fs.writeFile('conf.json', JSON.stringify(client.conf, null, '\t'), (error) => {
        if (error) throw error;
      });
    }

    //////////////////////////// INIT CMDS.JSON /////////////////////////////////
      var cmds = {};
      // Init all commands
      const commands = client.fs.readdirSync("./commands/");
      commands.forEach(command => {
        if(command.endsWith('.js')) {
          var cmd = command.slice(0, -3);
          cmds[cmd] = true;
        }
      });
      // Help
      cmds.help = {};
      const files = client.fs.readdirSync("./Help/");
      files.forEach(file => {
        if(file.endsWith('.txt')) {
          var cmd = file.slice(0, -4);
          cmds.help[cmd] = true;
        }
      });
      cmds.help.root = true;
      // Joke
      cmds.joke = {};
      const other = require("../other.json");
      for (category in other.jokes) {
        if (other.jokes.hasOwnProperty(category)) {
          cmds.joke[category] = true;
        }
      }
      cmds.joke.categories = true;
      cmds.joke.nofilter = true;
      cmds.joke.root = true;
      // Meme
      cmds.meme = {};
      cmds.meme.new = true;
      cmds.meme.list = true;
      cmds.meme.forget = true;
      // Music
      cmds.music = {}
      cmds.music.play = true;
      cmds.music.queue = true;
      cmds.music.clear = true;
      cmds.music.skip = true;
      cmds.music.pause = true;
      cmds.music.resume = true;
      cmds.music.stop = true;
      cmds.music.save = true;
      cmds.music.saves = true;
      cmds.music.unsave = true;
      cmds.music.volume = true;
      cmds.music.playlist = {};
      cmds.music.playlist.create = true;
      cmds.music.playlist.delete = true;
      cmds.music.playlist.add = true;
      cmds.music.playlist.remove = true;
      cmds.music.playlist.play = true;
      cmds.music.playlist.show = true;
      cmds.music.playlist.shuffle = true;
      cmds.music.playlists = true;
      cmds.music.search = true;
      cmds.music.replay = true;
      cmds.music.root = true;

      // Finally, save.
      client.fs.writeFile('cmds.json', JSON.stringify(cmds, null, '\t'), (error) => {
        if (error) throw error;
      });
    //////////////////////////// /INIT CMDS.JSON /////////////////////////////////

    //////////////////////////// CRON ///////////////////////////
    // Logs (Daily)
    client.cron.schedule('0 0 * * *', function(){
      var previousDay = new Date();
      previousDay.setDate(previousDay.getDate() - 1);
      var year = previousDay.getFullYear();
      var month = ("0" + (previousDay.getMonth() + 1)).slice(-2);
      var day = ("0" + previousDay.getDate()).slice(-2);
      if(client.fs.existsSync(`Logs/${year}/${month}/${day}.log`)){
        var log = new client.Discord.Attachment(`Logs/${year}/${month}/${day}.log`, `${year}-${month}-${day}.log`);
        client.channels.get(client.constants.eod).send(`End of Day - ***${client.makedate(previousDay)}***`,log);
      } else {
        client.channels.get(client.constants.eod).send(`No logs were recorded for previous day ***${client.makedate(previousDay)}*** *(NoFile: Logs/${year}/${month}/${day}.log)*`);
      }
    });

    // Errors (Hourly)
    client.cron.schedule('0 * * * *', function(){
      var previousHour = new Date();
      previousHour.setHours(previousHour.getHours() - 1);
      var year = previousHour.getFullYear();
      var month = ("0" + (previousHour.getMonth() + 1)).slice(-2);
      var day = ("0" + previousHour.getDate()).slice(-2);
      var hour = ("0" + previousHour.getHours()).slice(-2);
      if(client.fs.existsSync(`Errors/${year}/${month}/${day}/${hour}.log`)){
        var log = new client.Discord.Attachment(`Errors/${year}/${month}/${day}/${hour}.log`, `${year}-${month}-${day}-${hour}.log`);
        client.channels.get(client.constants.errors).send(`Error Report - ***${client.makedate(previousHour)}***`,log);
      }
    });

    // Robotpiece Season (Every 3 months from January)
    client.cron.schedule('0 0 01 */3 *', function() {
      client.triggerSeason();
    });
    //////////////////////////// /CRON //////////////////////////


    client.channels.get(client.constants.basement).send(`Intellibot up and ready!`);
  } catch (err) {
    client.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
