const SignitDoc = artifacts.require("SignitDoc");
const keccak256 = require("keccak256");

let IPFSaddress = "QmWwJW3CKoHsnUJYYD6CbSwjapkjhzJusexvTpBEtC5bo1";
let docHash = keccak256(IPFSaddress).toString("hex");
docHash = "0x" + docHash;

let numberOfSigners = 2;
module.exports = function (deployer) {
  // deployer.deploy(newDocContract, verifier, IPFSaddress, numberOfSigners);
  deployer.deploy(SignitDoc).then((instance) => {
    instance.newDocument(docHash, "2");
  });
};
