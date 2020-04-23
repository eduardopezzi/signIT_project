import React, { useEffect, useState } from "react";
import "./App.css";
import NotMetamask from "./components/NotMetamask";
import Web3 from "web3";

import IPFSHash from "ipfs-only-hash";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { DropzoneArea } from "material-ui-dropzone";
import { makeStyles } from "@material-ui/core/styles";

import Wallet from "./components/wallet";
import DocumentProfile from "./components/documentProfile";
import NavBar from "./components/navBar";
import StoreDoc from "./components/storeDoc";

import { NEWDOCUMENT_ADDRESS, NEWDOCUMENT_ABI } from "./data/newDocument";
const web3 = new Web3(Web3.givenProvider);
const newDocument = new web3.eth.Contract(NEWDOCUMENT_ABI, NEWDOCUMENT_ADDRESS);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: "hidden",
    padding: theme.spacing(0, 3),
    justifySelf: "baseline",
  },
  paper: {
    maxWidth: "600px",
    margin: `${theme.spacing(1)}px auto`,
  },
}));

function App() {
  const classes = useStyles();

  const [isMetamask, setIsMetamask] = useState(null);
  const [ethWallet, setEthWallet] = useState(null);
  const [network, setNetwork] = useState(null);
  const [networkChange, setNetworkChange] = useState(null);
  const [balance, setBalance] = useState(0);

  const [IPFSaddress, setIPFSaddress] = useState("");
  const [verifier, setVerifier] = useState("");
  const [buffer, setBuffer] = useState(null); // file uploaded
  const [verifySig, setVerifySig] = useState("");
  const [signature, setSignature] = useState("");
  const [signerVerified, setSignerVerified] = useState("");
  const [docExist, setDocExist] = useState("");

  async function getAccountMetamask() {
    const accounts = await window.ethereum.enable();
    const provider = window["ethereum"];
    const web3 = new Web3(Web3.givenProvider);
    const account = accounts[0];
    setEthWallet(account);
    setNetwork(provider.networkVersion);
    web3.eth.getBalance(account).then((result) => {
      const balance = web3.utils.fromWei(result, "ether");
      setBalance(balance);
    });
  }
  // Call Contract to verify if Hash already exists
  const verifyDocument = async (_verifier) => {
    let document = await newDocument.methods.Documents(_verifier).call();
    let docIsValid = document.isValid;
    setDocExist(docIsValid);
  };

  useEffect(() => {
    if (verifier) {
      verifyDocument(verifier);
    }
  }, [verifier]);

  useEffect(() => {
    if (networkChange) {
      // if (network != ContractNetwork) {
      //   alert("SignIT contract is stored at Rinkeby Network");
      // }
      getAccountMetamask();
    } else {
      if (typeof window.ethereum !== "undefined") {
        setIsMetamask(true);
        getAccountMetamask();
      } else {
        setIsMetamask(false);
      }
    }
  }, [networkChange]);

  if (!isMetamask) {
    return <NotMetamask />;
  }

  window.ethereum.on("networkChanged", (account) => {
    setNetworkChange(true);
  });
  window.ethereum.on("accountsChanged", (account) => {
    setNetworkChange(true);
  });

  function renderNetworkName(netWorkId) {
    switch (netWorkId) {
      case "1":
        return "Main";
      case "2":
        return "Morden";

      case "3":
        return "Ropsten";

      case "4":
        return "Rinkeby";

      case "42":
        return "Kovan";

      default:
        return "Unknown";
    }
  }
  ///// START DROPBOX COMPONENT //////
  const captureFile = (event) => {
    let e;
    if (!e) e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault()) e.preventDefault();
    const file = event[0];
    if (file) {
      let reader = new window.FileReader();
      reader.onloadend = () => convertToBuffer(reader);
      reader.readAsArrayBuffer(file);
    }
    setIPFSaddress("");
    return;
  };

  async function convertToBuffer(reader) {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer1 = await Buffer.from(reader.result);
    await setBuffer(buffer1);

    //generate IPFS Hash without store file
    let IPFShashGenerator = await IPFSHash.of(Buffer.from(reader.result));
    setIPFSaddress(IPFShashGenerator);
    const web3 = new Web3(Web3.givenProvider);
    let msg = web3.utils.keccak256(IPFShashGenerator);
    setVerifier(msg);
  }
  ///// END DROPBOX COMPONENT //////

  return (
    <div
      style={{
        display: "grid",
        justifyContent: "center",
        alignItems: "center",
        justify: "center",
        background: "lightgrey",
        paddingBottom: "80px",
      }}
    >
      <NavBar />

      <Wallet
        ethWallet={ethWallet}
        balance={balance}
        renderNetworkName={renderNetworkName}
        network={network}
      ></Wallet>
      <div>
        <DropzoneArea onChange={captureFile} />
        <Box m={1} />
      </div>
      <div className={classes.root}>
        <div className={classes.paper}>
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item xs>
              <Typography>
                {" "}
                <strong>Document Hash:</strong> {IPFSaddress}{" "}
              </Typography>
            </Grid>
          </Grid>
        </div>
        <div className={classes.paper}>
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item xs>
              {signature ? (
                <Typography>
                  {" "}
                  <strong>Document Signature: </strong>
                  {signature}{" "}
                </Typography>
              ) : null}{" "}
            </Grid>
          </Grid>
        </div>
      </div>

      {docExist ? (
        <DocumentProfile
          verifier={verifier}
          ethWallet={ethWallet}
          verifySig={verifySig}
          setVerifySig={setVerifySig}
          signature={signature}
          setSignature={setSignature}
          signerVerified={signerVerified}
          setSignerVerified={setSignerVerified}
          verifyDocument={verifyDocument}
        />
      ) : (
        <StoreDoc
          setVerifier={setVerifier}
          verifier={verifier}
          ethWallet={ethWallet}
          buffer={buffer}
          verifyDocument={verifyDocument}
        />
      )}
    </div>
  );
}

export default App;
