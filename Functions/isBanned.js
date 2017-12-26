module.exports = function(guild) {
  try {
    return this.bans.hasOwnProperty(guild.id);
  } catch(err) {
    this.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
