const NewDocument = artifacts.require("NewDocument");
var EthUtil = require("ethereumjs-util");
var Web3 = require("web3");
var web3 = new Web3("HTTP://127.0.0.1:7545");
const truffleAssert = require("truffle-assertions");

var BN = web3.utils.BN;

let verifier =
  "0x025a29fca2e5aba9edc0d1057478a7740e5857650605f53738363e879e0bc81f";

let numberOfSigners = 2;

contract("NewDocument", (accounts) => {
  let issuer = accounts[0];
  let privateKeyIssuer =
    "9ea8819710349b9da83a939fb025be28c235f06140e9cdbfce1173b4a1dffedf";
  let signer = accounts[1];
  // signer address 0x90415E66A753010B7E453F489bBbf23848497936
  // signer private key
  let privateKey =
    "025a29fca2e5aba9edc0d1057478a7740e5857650605f53738363e879e0bc81f";

  let signer2 = accounts[2];
  // signer address 0x7C0B091F069F575C76F476b97285b203A6D654B2
  // signer private key
  let privateKey2 =
    "191c11c6ea292cebbe10491e75876d977e0e02cb70e8c8b25f4d12ff07f98ed0";

  it("1. NewDocument should be deployed", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);
    let docAddress = Contract.address;
    let owner = await Contract.issuer();
    assert.ok(docAddress, "contract deployed");
  });

  it("2. get time of deployment", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);
    let time = await Contract.documentTimeStamp();
    let newTime = new BN(time).toNumber();
    let parseTime = new Date(newTime);
    assert.ok(parseTime, "readable timestamp");
  });

  it("3. Verify function should recover signer address", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);

    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));

    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));

    let recover3 = await Contract.verify(msg, sig.v, sig.r, sig.s);
    assert.equal(signer, recover3, "Signer address match");
  });

  it("4.1. Document can be signed and event is emitted", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);
    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));

    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

    let sigTX = await Contract.signContract(
      msg,
      sig.v,
      sig.r,
      sig.s,
      signedHash,
      { from: signer }
    );

    truffleAssert.eventEmitted(sigTX, "Signed", (ev) => {
      return ev._signer === signer;
    });

    let signed = await Contract.signers.call(signer);
    signed = signed.isValid;
    assert.equal(signed, true, "Contract Status is Signed");

    contractStatus = await Contract.status();
    assert.equal(contractStatus, "0", "Contract Status is Pending");
  });

  it("4.2. Document can NOT be signed twice by the same signer", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);

    let signed = await Contract.signers.call(signer);
    signed = signed.isValid;
    assert.equal(signed, true, "Signer already signed");

    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
    var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

    try {
      let sigTX = await Contract.signContract(
        msg,
        sig.v,
        sig.r,
        sig.s,
        signedHash,
        { from: signer }
      );
      truffleAssert.eventNotEmitted(sigTX, "Signed");
    } catch (err) {
      assert(err, "revert This Document is already signed");
    }

    contractStatus = await Contract.status();
    assert.equal(contractStatus, "0", "Contract Status is Pending");
  });

  it("4.3. Document can be signed by Signer2 and status changed", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);

    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig2 = EthUtil.ecsign(msg, new Buffer.from(privateKey2, "hex"));
    var signedHash2 = EthUtil.toRpcSig(sig2.v, sig2.r, sig2.s).toString("hex");

    await Contract.signContract(msg, sig2.v, sig2.r, sig2.s, signedHash2, {
      from: signer2,
    });

    contractStatus = await Contract.status();
    assert.equal(contractStatus, "1", "Contract Status is Signed");
  });
  it("5. Document can NOT be signed, Signer already signed", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);
    let signed = await Contract.signers.call(signer);
    signed = signed.isValid;
    assert.equal(signed, true, "signer have NOT signed");

    try {
      var msg = web3.utils.sha3(verifier);
      msg = EthUtil.toBuffer(msg);
      msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));

      var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
      var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

      let recover = await Contract.signContract(
        msg,
        sig.v,
        sig.r,
        sig.s,
        signedHash,
        { from: signer }
      );
    } catch (err) {
      assert(err, "revert This Document is already signed");
    }
  });

  it("6. Document can NOT be signed for more than #ofSigners variable ", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);
    let numberOfSignersVariable = await Contract.numberOfSigners();
    let signersLenght = await Contract.signersList();
    assert.ok(
      signersLenght.length == numberOfSignersVariable,
      "Document already have the max number of signatures to this document"
    );

    try {
      var msg = web3.utils.sha3(verifier);
      msg = EthUtil.toBuffer(msg);
      msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));

      var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));
      var signedHash = EthUtil.toRpcSig(sig.v, sig.r, sig.s).toString("hex");

      let recover = await Contract.signContract(
        msg,
        sig.v,
        sig.r,
        sig.s,
        signedHash,
        { from: signer }
      );
    } catch (err) {
      assert(err, "revert This Document is already signed");
    }
  });

  it("7.1. Signature can be REVOKED", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);

    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey, "hex"));

    let revokeSig = await Contract.revokeSignature(msg, sig.v, sig.r, sig.s, {
      from: signer,
    });
    truffleAssert.eventEmitted(revokeSig, "Revoked", (ev) => {
      return ev._signer === signer;
    });
    let signerRevoke = await Contract.signers(signer);
    let isValid = signerRevoke.isValid;
    let isRevoked = signerRevoke.revokedSig;
    assert.equal(isValid, false, "Signature is no longer valid");
    assert.ok(isRevoked, "Signature is revoked");
  });
  it("7.2.Document can be REVOKED", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);

    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig = EthUtil.ecsign(msg, new Buffer.from(privateKey2, "hex"));

    let revokeSig2 = await Contract.revokeSignature(msg, sig.v, sig.r, sig.s, {
      from: signer2,
    });
    truffleAssert.eventEmitted(revokeSig2, "Revoked", (ev) => {
      return ev._signer === signer2;
    });

    let docVerifier = await Contract.verifier();
    // docVerifier = docVerifier.toString("hex");

    truffleAssert.eventEmitted(revokeSig2, "DocRevoked", (ev) => {
      return ev._verifier == docVerifier;
    });

    let signerRevoke = await Contract.signers(signer);
    let isValid = signerRevoke.isValid;
    let isRevoked = signerRevoke.revokedSig;
    assert.equal(isValid, false, "Signature2 is no longer valid");
    assert.ok(isRevoked, "Signature2 is revoked");

    revokedCounter = await Contract.revokeCounter();

    let contractStatus = await Contract.status();
    assert.equal(contractStatus, "2", "Contract Status is Revoked");
  });
  it("7.3.Document REVOKED can NOT be signed", async () => {
    let Contract = await NewDocument.deployed(verifier, numberOfSigners);

    let contractStatus = await Contract.status();
    assert.equal(contractStatus, "2", "Contract Status is Revoked");

    var msg = web3.utils.sha3(verifier);
    msg = EthUtil.toBuffer(msg);
    msg = EthUtil.hashPersonalMessage(new Buffer.from(msg));
    var sig2 = EthUtil.ecsign(msg, new Buffer.from(privateKey2, "hex"));
    var signedHash2 = EthUtil.toRpcSig(sig2.v, sig2.r, sig2.s).toString("hex");
    try {
      await Contract.signContract(msg, sig2.v, sig2.r, sig2.s, signedHash2, {
        from: signer2,
      });
    } catch (err) {
      assert(err, "revert");
    }
  });
});
