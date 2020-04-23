import React, { useEffect } from "react";
import IPFSHash from "ipfs-only-hash";
import EthUtil from "ethereumjs-util";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { DropzoneArea } from "material-ui-dropzone";
import { BrowserRouter, Switch, Route, useHistory } from "react-router-dom";

import { NEWDOCUMENT_ADDRESS, NEWDOCUMENT_ABI } from "./data/newDocument";
import ipfs from "./data/ipfs";
import web3 from "./web3";
// import IPFShash from "./components/IPFShash";
import personalSign from "./components/personalSign";

const newDocument = new web3.eth.Contract(NEWDOCUMENT_ABI, NEWDOCUMENT_ADDRESS);

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="App-Content">
          <AppHeader />
          <AppBody />
        </div>
      </div>
    </BrowserRouter>
  );
}

function AppHeader() {
  return (
    <div className="AppHeader">
      <Grid container={true} justify="space-between" alignItems="center">
        <img src={require("./data/logo.png")} />{" "}
      </Grid>
    </div>
  );
}

function AppBody() {
  return (
    <Switch>
      <Route exact={true} path="/" render={() => <MediaTimeStamp />} />
    </Switch>
  );
}
function MediaTimeStamp() {
  const [currentSigner, setCurrentSigner] = React.useState("");
  const [verifier, setVerifier] = React.useState("");
  const [IPFSaddress, setIPFSaddress] = React.useState("");
  const [numberSigners, setNumberSigners] = React.useState("");
  const [buffer, setBuffer] = React.useState(null); // file uploaded
  const [signature, setSignature] = React.useState("");
  const [verifySig, setVerifySig] = React.useState("");
  const [signers, setSigners] = React.useState([]);
  const [signerVerified, setSignerVerified] = React.useState("");

  const captureFile = (event) => {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault()) e.preventDefault();
    const file = event[0];
    let reader = new window.FileReader();
    reader.onloadend = () => convertToBuffer(reader);
    reader.readAsArrayBuffer(file);
    console.log(1, reader);
  };

  async function convertToBuffer(reader) {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer1 = await Buffer.from(reader.result);
    await setBuffer(buffer1);

    //generate IPFS Hash without store file
    let IPFShashGenerator = await IPFSHash.of(Buffer.from(reader.result));
    setIPFSaddress(IPFShashGenerator);
    let msg = web3.utils.keccak256(IPFShashGenerator);
    // msg = EthUtil.hashPersonalMessage(msg);
    setVerifier(msg);
  }

  useEffect(() => {
    let getAccount = async () => {
      const accounts = await new web3.eth.getAccounts();
      setCurrentSigner(accounts[0]);
    };
    if (!currentSigner) {
      getAccount();
    } else {
      window.ethereum.on("accountsChanged", function (accounts) {
        setCurrentSigner(accounts[0]);
      });
    }
  });
  
  async function handleHash(e) {
    e.preventDefault();

    let hashtest = await IPFShash(Buffer.from(buffer));
    console.log(hashtest);

    ipfs.files.add(Buffer.from(buffer), (error, result) => {
      if (error) {
        console.err(error);
        return;
      }
      console.log(result[0].hash); /// ex. result >>> Qme3e5ocD1SiUE8JDWJs3Esvo7Mf38wFXYabDbGkbsiexh
    });
  }

  ///////////CONTRACT FUNCTIONS/////////////
  function connect () {
    if (typeof ethereum !== 'undefined') {
      ethereum.enable()
      .catch(console.error)
    }
  }

  const signDocument = async (event) => {
    event.preventDefault();
    const accounts = await new web3.eth.getAccounts();
    await web3.eth.signTypedData(typedData, address [, callback])

    await web3.eth.personal.sign(verifier, accounts[0]).then((res) => {
      setSignature(res);
      postSignature(res);
    });
  };

  const postSignature = async (sig) => {
    const accounts = await new web3.eth.getAccounts();
    await newDocument.methods
      .signDocument(verifier, sig)
      .send({ from: accounts[0], gas: "3000000000" })
      .then(console.log);
  };

  const getSigners = async () => {
    const accounts = await new web3.eth.getAccounts();
    await newDocument.methods
      .signersList()
      .call({ from: accounts[0] })
      .then(console.log);
  };

  async function verifySignature() {
    const accounts = await new web3.eth.getAccounts();
    if (verifySig) {
      await web3.eth.personal
        .ecRecover(verifier, verifySig)
        .then((res) => setSignerVerified(res));
      await newDocument.methods
        .verify(verifySig, verifier)
        .send({ from: accounts[0], gas: "3000000000" })
        .then(console.log);
    } else {
      alert("missing signature");
    }
  }

  ////////////////////////////////////

  return (
    <div>
      <p>Current Signer: {currentSigner}</p>
      <Box m={2} />
      <Typography variant="h5">Upload your Document</Typography>
      <Box m={1} />

      {/* <div>
        <Typography variant="h6">Contract owner: {owner} </Typography>
      </div>
      <Box m={1} /> */}

      <form>
        <DropzoneArea onChange={captureFile} />
        <Box m={1} />
        <p> {IPFSaddress} </p>
        <Box m={2} />
        <label>
          Number of Signers:
          <input
            type="text"
            name="description"
            onChange={(e) => setNumberSigners(e.target.value)}
          />
        </label>
        <Box m={2} />
        <Button
          onClick={handleHash}
          variant="contained"
          color="primary"
          size="medium"
          disabled={!buffer}
        >
          {" "}
          Store Document
        </Button>
      </form>
      <Box m={2} />
      <form>
        <Box m={2} />
        <Button
          onClick={signDocument}
          variant="contained"
          color="primary"
          size="medium"
          disabled={verifier === ""}
        >
          Sign Document
        </Button>
        <Box m={1} />
        <p>{signature}</p>
        <Box m={1} />
        <Button
          onClick={"d"}
          variant="contained"
          color="primary"
          size="medium"
          disabled={verifier === ""}
        >
          Revoke Signature
        </Button>
        <Box m={2} />

        <Box m={2} />
        <Button
          onClick={verifySignature}
          variant="contained"
          color="primary"
          size="medium"
          // disabled={hash === ""}
        >
          Verify Signature
        </Button>
        <label>
          <input
            type="text"
            name="description"
            onChange={(e) => setVerifySig(e.target.value)}
          />
        </label>
        <Box m={1} />
        <p>{signerVerified}</p>
        <Box m={2} />
        <Button
          onClick={getSigners}
          variant="contained"
          color="primary"
          size="medium"
        >
          Document Signers
        </Button>
        <div>
          {signers.map((res) => (
            <li> {res} </li>
          ))}
        </div>
      </form>
    </div>
  );
}
