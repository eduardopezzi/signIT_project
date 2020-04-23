import React from "react";
import "../App.css";
import Typography from "@material-ui/core/Typography";

export default function AppContenido(props) {
  const { ethWallet, balance, renderNetworkName, network } = props;
  return (
    <div className="App">
      <div>
        {ethWallet === null && (
          <>
            <h3>Login to your Metamask Wallet</h3>
          </>
        )}
      </div>
      <div>
        {ethWallet !== null && (
          <>
            <Typography>
              <strong>Wallet: </strong>
              {ethWallet}
            </Typography>
            <Typography>
              <strong>{balance} ETH</strong>
            </Typography>
            <Typography>
              <strong>Network: {renderNetworkName(network)}</strong>
            </Typography>
          </>
        )}
      </div>
    </div>
  );
}
