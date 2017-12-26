module.exports = function(author) {
  try {
    var isDev = false;
    this.Developpers.Devs.forEach(dev => {
      if (dev.id == author.id)
        isDev = true;
    });
    return isDev;
  } catch(err) {
    this.logger.error(`${err.stack == undefined ? err:err.stack}`);
  }
}
