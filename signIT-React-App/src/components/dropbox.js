import React, { useState, useEffect } from "react";
import { DropzoneArea } from "material-ui-dropzone";

export default function Dropbox(props) {
  const captureFile = (props.event) => {
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
    await props.setBuffer(buffer1);

    //generate IPFS Hash without store file
    let IPFShashGenerator = await IPFSHash.of(Buffer.from(reader.result));
    setIPFSaddress(IPFShashGenerator);
    let msg = web3.utils.keccak256(IPFShashGenerator);
    // msg = EthUtil.hashPersonalMessage(msg);
    setVerifier(msg);
  }
  return (
    <div>
      <form>
        <DropzoneArea onChange={captureFile} />
        <Box m={1} />
        <p> {props.IPFSaddress} </p>
        <Box m={2} />
      </form>
    </div>
  );
}
