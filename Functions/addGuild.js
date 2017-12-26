module.exports = function(guild) {
  try {
  var firstChannel = {
    "id": null
  }; // First channel that is encountered is considered the notifications channel
  guild.channels.some(function(channel, i) {
    if(channel.type != "text")
      return false;
    firstChannel = channel;
    return true;
  });
  var DefaultSettings = JSON.parse(JSON.stringify(this.defaultSettings));

  DefaultSettings.Admins.push(guild.ownerID);
  DefaultSettings.NotificationChannel = firstChannel.id;
  DefaultSettings.joined = new Date().toString();

  this.settings.set(guild.id, DefaultSettings);
  this.logger.evt(`adding guild ${guild.name} (${guild.id})`);

  if(!this.fs.existsSync(`memes/${guild.id}`)) {
    this.fs.mkdirSync(`memes/${guild.id}`, (error) => {
      if(error) throw error;
    });
  } else {
    this.fs.readdir(`memes/${guild.id}`, (err, files) => {
      if(err) throw err;

      for(const file of files) {
        this.fs.unlink(`memes/${guild.id}/${file}`, (error) => {
          if(error) throw error;
        });
      }
    });
  }

  var serverConf = this.settings.get(guild.id);
  if(serverConf.NotificationChannel != null)
    if(this.channels.get(serverConf.NotificationChannel).permissionsFor(this.user).has('SEND_MESSAGES'))
      this.channels.get(serverConf.NotificationChannel).send(`WUBBA LUBBA DUB DUB! ${this.user.username} has joined ${guild.name}! I've sent some important information to your server owner to get me setup. Get ready everyone, this is going to be a hell of an adventure, so I hope you packed some szechuan sauce!`);

  guild.owner.send(`Hey there! Thanks for adding me to your server! First things first, the command prefix is '$' and can be changed. use $help to see all commands. Please note that you are the only 'bot admin' right now. I do not obey to server admins, so you'll have to add them (or their role) as 'bot admins' using the $addadmin command. I recommend you check out the following admin commands to set me up:\n- prefix\n- addadmin\n- defaultrole\n- notifications\n- rules\n- welcome\n- blacklist\n- censor\n\nThese are all commands that are useful to personalize my behavior with your server!\n\nAlso, if I seem to not respond to a command, there are many reasons why this could be:\n1. The main reason is that I probably don't have the appropriate permissions (either to talk or to do something like kicking members), so make sure I have the right permissions! This includes having my role above other roles in the server's settings (especially if you plan on using that defaultrole command!)\n2. I could be in maintenance mode, which would appear as my game status and I would be in 'idle' mode.\n3. The command is broken. However, this one is more for testers, as all commands are tested through different servers with different situations before seeing the light.\n\nHave fun with me!`);
  this.logger.sys(`Added guild ${guild.name} (${guild.id})`);

} catch(err) {
  this.logger.error(`${err.stack == undefined ? err:err.stack}`);
}
}
