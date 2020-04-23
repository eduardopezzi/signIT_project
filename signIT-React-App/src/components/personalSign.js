import web3 from "../web3";

var ethUtil = require("ethereumjs-util");
var sigUtil = require("eth-sig-util");
var Eth = require("ethjs");
window.Eth = Eth;

var ethereum = window.ethereum;
var signature;

function connect() {
  if (typeof ethereum !== "undefined") {
    ethereum.enable().catch(console.error);
  }
}

export default function personal_sign(event, msg) {
  event.preventDefault();
  var text = msg;
  var msg = ethUtil.bufferToHex(new Buffer(text, "utf8"));
  var from = web3.eth.accounts[0];
  if (!from) return connect();

  console.log("CLICKED, SENDING PERSONAL SIGN REQ");
  var params = [from, msg];

  // Now with Eth.js
  var eth = new Eth(web3.currentProvider);

  eth
    .personal_sign(msg, from)
    .then((signed) => {
      signature = signed;
      console.log("Signed!  Result is: ", signed);
      console.log("Recovering...");

      return eth.personal_ecRecover(msg, signed);
    })
    .then((recovered) => {
      if (recovered === from) {
        console.log("Ethjs recovered the message signer!");
      } else {
        console.log("Ethjs failed to recover the message signer!");
        console.dir({ recovered });
      }
    });
  return signature;
}
