const newDocContract = artifacts.require("NewDocument");

let verifier =
  "0x01810280a6ef8fb190fbf64db30b71b59a533fa977204e29172b29aa6ead7292";
let numberOfSigners = 2;
module.exports = function (deployer) {
  deployer.deploy(newDocContract, verifier, numberOfSigners);
};
