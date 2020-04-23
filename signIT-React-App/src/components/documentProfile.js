import React, { useState } from "react";
import "../App.css";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";

import Web3 from "web3";

import { NEWDOCUMENT_ADDRESS, NEWDOCUMENT_ABI } from "../data/newDocument";
const web3 = new Web3(Web3.givenProvider);
const newDocument = new web3.eth.Contract(NEWDOCUMENT_ABI, NEWDOCUMENT_ADDRESS);

export default function DocumentProfile(props) {
  const [signers, setSigners] = useState([]);
  const {
    verifier,
    verifySig,
    setVerifySig,
    setSignature,
    signerVerified,
    setSignerVerified,
    ethWallet,
  } = props;

  const signDocument = async (event) => {
    event.preventDefault();
    await web3.eth.personal.sign(verifier, ethWallet).then((res) => {
      setSignature(res);
      postSignature(res);
    });
  };

  const postSignature = async (sig) => {
    await newDocument.methods
      .signDocument(verifier, sig)
      .send({ from: ethWallet })
      .then(console.log);
  };

  const verifySignature = async () => {
    if (verifySig) {
      await web3.eth.personal
        .ecRecover(verifier, verifySig)
        .then((res) => setSignerVerified(res));
    } else {
      alert("missing signature");
    }
  };

  const docSigners = async () => {
    let signersList = await newDocument.methods.signersList(verifier).call();
    setSigners(signersList);
  };

  return (
    <div
      // style={{ paddingLeft: 40 }}
      style={{
        display: "grid",
        justifyContent: "center",
        alignItems: "center",
        justify: "center",
      }}
      // style={{ direction: "row", display: "inline-flex", justify: "center" }}
    >
      <Button
        onClick={signDocument}
        variant="contained"
        color="primary"
        size="small"
        style={{ width: "200px" }}
        disabled={verifier === ""}
      >
        Sign Document
      </Button>
      <Box m={1} />
      {/* Paste Signature Here */}
      <TextField
        label="Paste Signature Here"
        id="standard-size-small"
        size="small"
        onChange={(event) => setVerifySig(event.target.value)}
      />
      <Box m={1} />
      <Button
        label="verifySignature"
        onClick={verifySignature}
        variant="contained"
        color="primary"
        size="small"
        style={{ width: "200px" }}
        disabled={verifySig === ""}
      >
        Verify Signature
      </Button>{" "}
      <Box m={1} />
      <Typography> {signerVerified} </Typography>
      <Box m={1} />
      <Button
        label="verifyDoc"
        onClick={docSigners}
        variant="contained"
        color="primary"
        size="small"
        style={{ width: "200px" }}
        disabled={verifier === false}
      >
        Document Signers
      </Button>{" "}
      <div>
        {signers.map((res) => (
          <li> {res} </li>
        ))}
      </div>
    </div>
  );
}
