import React, { useState } from "react";

import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";

import Web3 from "web3";
import ipfs from "../data/ipfs";

import { NEWDOCUMENT_ADDRESS, NEWDOCUMENT_ABI } from "../data/newDocument";
const web3 = new Web3(Web3.givenProvider);
const newDocument = new web3.eth.Contract(NEWDOCUMENT_ABI, NEWDOCUMENT_ADDRESS);

export default function StoreDocument(props) {
  const { verifier, ethWallet, buffer, verifyDocument } = props;
  const [numberOfSigners, setNumberOfSigners] = useState("");

  const createDocument = async () => {
    console.log(verifier);
    await newDocument.methods
      .newDocument(verifier, numberOfSigners)
      .send({ from: ethWallet })
      .then(console.log);
    ipfs.files.add(Buffer.from(buffer), (error, result) => {
      if (error) {
        console.err(error);
        return;
      }
      verifyDocument(verifier);
      console.log(result[0].hash); /// ex. result >>> Qme3e5ocD1SiUE8JDWJs3Esvo7Mf38wFXYabDbGkbsiexh
    });
  };

  return (
    <div
      style={{
        display: "grid",
        justifyContent: "center",
        alignItems: "center",
        justify: "center",
      }}
    >
      <Button
        onClick={createDocument}
        variant="contained"
        color="primary"
        size="small"
        disabled={!numberOfSigners}
      >
        Store Document
      </Button>
      <Box m={1} />
      {/* Paste Signature Here */}
      <TextField
        label="Number Of Signers"
        id="standard-size-small"
        size="small"
        onChange={(event) => setNumberOfSigners(event.target.value)}
      />
    </div>
  );
}
