export const NEWDOCUMENT_ADDRESS = "0xF0476A85b871E06268F2E3Fe0a613E2f0c210E2f"; // ganache
// "0x10E30E9e7e6264a4890ad9d8CDC11BF19c9A4f5a"; //Rinkeby

export const ContractNetwork = "4";

export const NEWDOCUMENT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "DocRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "DocumentCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_signer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "Revoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_signer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "Signed",
    type: "event",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "Documents",
    outputs: [
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "documentTimeStamp",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "numberOfSigners",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "revokeCounter",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        internalType: "enum SignitDoc.Status",
        name: "status",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "Signers",
    outputs: [
      {
        internalType: "uint256",
        name: "signatureTimeStamp",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "revokedSig",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
      {
        internalType: "uint16",
        name: "_numberOfSigners",
        type: "uint16",
      },
    ],
    name: "newDocument",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "signersList",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "signDocument",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "verify",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint8",
        name: "_number",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "setNumeberOfSigners",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "revokeSignature",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];
