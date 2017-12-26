module.exports = function(url, fs, filename, callback) {
  var request = this.request;
  this.request.head(url, function(err, res, body){
  request(url).pipe(fs.createWriteStream(filename)).on('close', callback);
});
}
