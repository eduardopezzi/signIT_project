const SignitDoc = artifacts.require("SignitDoc");
const EthUtil = require("ethereumjs-util");
const Web3 = require("web3");
const web3 = new Web3("HTTP://127.0.0.1:7545");
const truffleAssert = require("truffle-assertions");
const hdkey = require("ethereumjs-wallet/hdkey");
const wallet = require("ethereumjs-wallet");
const bip39 = require("bip39");

// create accounts from your mnemonics at .secret file
function getPrivKey(account) {
  const fs = require("fs");
  const mnemonic = fs.readFileSync("./.secret").toString().trim();
  const seed = bip39.mnemonicToSeedSync(mnemonic); // mnemonic is the string containing the words
  const hdk = hdkey.fromMasterSeed(seed);
  const addr_node = hdk.derivePath(`m/44'/60'/0'/0/${account}`);
  const addr = addr_node.getWallet().getAddressString(); //check that this is the same with the address that ganache list for the first account to make sure the derivation is correct
  const private_key = addr_node.getWallet().getPrivateKey();
  return private_key.toString("hex");
}

const BN = web3.utils.BN;

// image hash test from IPFS
let IPFSaddress = "QmWwJW3CKoHsnUJYYD6CbSwjapkjhzJusexvTpBEtC5bo1";
let docHash = web3.utils.keccak256(IPFSaddress);

let numberOfSigners = 2;

contract("SignitDoc", (accounts) => {
  let issuer = accounts[0];
  let privateKeyIssuer = getPrivKey(0);
  let signer = accounts[1];
  let privateKey = getPrivKey(1);
  let signer2 = accounts[2];
  let privateKey2 = getPrivKey(2);

  it("1. SignitDoc should be deployed and store a Document", async () => {
    let Contract = await SignitDoc.deployed();
    let docAddress = Contract.address;
    let newDoc = await Contract.Documents(docHash);
    let valid = newDoc.isValid;
    assert.ok(docAddress, "contract NOT deployed");
    assert.ok(valid == true, "Document NOT stored");
  });

  it("2. get time of deployment", async () => {
    let Contract = await SignitDoc.deployed();
    let newDoc = await Contract.Documents(docHash);
    let valid = newDoc.isValid;
    let time = newDoc.documentTimeStamp;
    let newTime = new BN(time).toNumber();
    let parseTime = new Date(newTime);
    console.log(parseTime);
    assert.ok(parseTime, "NOT readable timestamp");
  });

  it("3. Verify function should recover signer address", async () => {
    let Contract = await SignitDoc.deployed();

    let msg = EthUtil.toBuffer(docHash);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

    let recover = await Contract.verify(signedHash, docHash);
    assert.equal(signer, recover, "Signer address DOESN'T match");
  });

  it("4.1. Document can be signed and event is emitted", async () => {
    let Contract = await SignitDoc.deployed();

    let msg = EthUtil.toBuffer(docHash);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");
    let sigTX = await Contract.signDocument(docHash, signedHash, {
      from: signer,
    });
    truffleAssert.eventEmitted(sigTX, "Signed", (ev) => {
      return ev._signer == signer;
    });

    let signed = await Contract.Signers(docHash, signer);
    signedValid = signed.isValid;
    assert.equal(signedValid, true, "Contract Status is Signed");

    signedTX = await signed.signature;

    assert.equal(signedTX, signedHash, "Contract Status is Signed");

    contractStatus = await Contract.Documents(docHash).status;
    contractStatus = new BN(contractStatus).toNumber();

    assert.equal(contractStatus, 0, "Contract Status is Pending");
  });

  it("4.2. Document can NOT be signed twice by the same signer", async () => {
    let Contract = await SignitDoc.deployed();

    let signed = await Contract.Signers(docHash, signer);
    signed = signed.isValid;
    assert.equal(signed, true, "Signer already signed");

    let msg = EthUtil.toBuffer(docHash);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

    try {
      let sigTX = await Contract.signDocument(msg, signedHash, {
        from: signer,
      });
      truffleAssert.eventNotEmitted(sigTX, "Signed");
    } catch (err) {
      assert(err, "revert This Document is already signed");
    }

    contractStatus = await Contract.Documents(docHash).status;
    contractStatus = new BN(contractStatus).toNumber();

    assert.equal(contractStatus, 0, "Contract Status is Pending");
  });
  it("4.3. Document can be signed by Signer2 and status changed", async () => {
    let Contract = await SignitDoc.deployed();

    let msg = EthUtil.toBuffer(docHash);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey2, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");
    let sigTX = await Contract.signDocument(docHash, signedHash, {
      from: signer2,
    });
    truffleAssert.eventEmitted(sigTX, "Signed", (ev) => {
      return ev._signer == signer2;
    });

    let signerList = await Contract.signersList(docHash, { from: signer });
    signerList = signerList.status;
    contractStatus = await Contract.Documents(docHash);
    contractStatus = contractStatus.status;
    contractStatus = new BN(contractStatus).toNumber();

    assert.equal(contractStatus, 1, "Contract Status is NOT Signed");
  });
  it("5. Document can NOT be signed, Signer already signed", async () => {
    let Contract = await SignitDoc.deployed();

    let signed = await Contract.Signers(docHash, signer);
    signed = signed.isValid;
    assert.equal(signed, true, "signer have NOT signed");

    try {
      var msg = web3.utils.keccak256(IPFSaddress);
      msg = EthUtil.toBuffer(msg);
      msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));

      var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
      var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

      let recover = await Contract.signDocument(msg, signedHash, {
        from: signer,
      });
    } catch (err) {
      assert(err, "revert This Document is already signed");
    }
  });

  it("6. Document can NOT be signed for more than #ofSigners variable ", async () => {
    let Contract = await SignitDoc.deployed();

    let numberOfSignersVariable = await Contract.Documents(docHash);

    numberOfSignersVariable = numberOfSignersVariable.numberOfSigners;
    let signersLenght = await Contract.signersList(docHash);
    assert.ok(
      signersLenght.length == numberOfSignersVariable,
      "Document already have the max number of signatures to this document"
    );

    try {
      var msg = web3.utils.keccak256(IPFSaddress);
      // msg = EthUtil.toBuffer(msg);
      msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));

      var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
      var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

      await Contract.signDocument(msg, signedHash, {
        from: signer,
      });
    } catch (err) {
      assert(err, "revert This Document is already signed");
    }
  });

  it("7.1. Signature can be REVOKED by signer", async () => {
    let Contract = await SignitDoc.deployed();

    var msg = web3.utils.keccak256(IPFSaddress);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

    let revokeSig = await Contract.revokeSignature(docHash, signedHash, {
      from: signer,
    });
    truffleAssert.eventEmitted(revokeSig, "Revoked", (ev) => {
      return ev._signer === signer;
    });
    let signerRevoke = await Contract.Signers(docHash, signer);
    let isValid = signerRevoke.isValid;
    let isRevoked = signerRevoke.revokedSig;
    assert.equal(isValid, false, "Signature is no longer valid");
    assert.ok(isRevoked, "Signature is revoked");
  });

  it("7.2.Document can be REVOKED", async () => {
    let Contract = await SignitDoc.deployed();

    let signedHash = await Contract.Signers(docHash, signer2);
    signedHash = signedHash.signature;

    let revokeSig2 = await Contract.revokeSignature(docHash, signedHash, {
      from: signer2,
    });
    truffleAssert.eventEmitted(revokeSig2, "Revoked", (ev) => {
      return ev._signer === signer2;
    });

    truffleAssert.eventEmitted(revokeSig2, "DocRevoked", (ev) => {
      return ev._hash == docHash;
    });

    let signerRevoke = await Contract.Signers(docHash, signer);
    let isValid = signerRevoke.isValid;
    let isRevoked = signerRevoke.revokedSig;
    assert.equal(isValid, false, "Signature2 is no longer valid");
    assert.ok(isRevoked, "Signature2 is revoked");

    let document = await Contract.Documents(docHash);

    let revokedCounter = document.revokeCounter;
    revokedCounter = new BN(revokedCounter).toNumber();
    contractStatus = document.status;
    contractStatus = new BN(contractStatus).toNumber();

    assert.equal(contractStatus, 2, "Contract Status is NOT Revoked");
    assert.equal(revokedCounter, 2, "Contract Status is NOT Revoked");
  });

  it("7.3.Document REVOKED can NOT be signed", async () => {
    let Contract = await SignitDoc.deployed();

    contractStatus = await Contract.Documents(docHash);
    contractStatus = contractStatus.status;
    contractStatus = new BN(contractStatus).toString();
    assert.equal(contractStatus, "2", "Contract Status is Revoked");

    var msg = web3.utils.keccak256(IPFSaddress);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig2 = EthUtil.ecsign(msg, new Buffer.from(privateKey2, "hex"));
    var signedHash2 = EthUtil.toRpcSig(sig2.v, sig2.r, sig2.s).toString("hex");
    try {
      await Contract.signDocument(msg, signedHash2, {
        from: signer2,
      });
    } catch (err) {
      assert(err, "revert");
    }
  });
});
