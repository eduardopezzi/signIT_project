import React, { useState, useEffect } from "react";
import app from '../App'

const Hashes = (value) => {
  const [hasError, setErrors] = useState(false);
  const [hashes, setHashes] = useState({});

  async function fetchData() {
    const res = await fetch(`https://ipfs.infura.io:5001/api/v0/dag/get?arg=${value}`);
    res
      .json()
      .then(res => setHashes(res))
      .catch(err => setErrors(err));
  }

  useEffect(() => {
    fetchData();
  });

  return (
    <div>
      <span>{JSON.stringify(value)}</span>
      <hr />
      <span>Has error: {JSON.stringify(hasError)}</span>
    </div>
  );
};
export default Hashes;