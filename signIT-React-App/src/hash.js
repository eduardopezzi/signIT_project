var fs = require("fs");
var crypto = require("crypto");

function hashFile(fileToHash) {
  // the file you want to get the hash
  var fd = fs.createReadStream(fileToHash);
  var hash = crypto.createHash("sha1");
  hash.setEncoding("hex");

  fd.on("end", function() {
    hash.end();
    console.log(hash.read()); // the desired sha1sum
  });

  // read all file and pipe it (write it) to the hash object
  fd.pipe(hash);
  return hash;
}

export default hashFile;
