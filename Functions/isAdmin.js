module.exports = function(author, settings) {
  try {
      return settings.Admins.some(function(admin, i) {
        if (author.id == admin || author.roles.has(admin)) {
          return true;
        }
      });
  } catch (err) {
    this.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
