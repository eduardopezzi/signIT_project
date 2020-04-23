pragma solidity ^0.5.0;


// import {ECDSA} from "@OpenZeppelin/contracts/cryptography/ECDSA.sol";

contract NewDocument {
    /////////////////
    // Contract State
    ////////////////

    address public factoryAddress;
    uint256 public documentTimeStamp;
    uint256 public numberOfSigners;
    uint256 public revokeCounter;
    address public issuer;
    bytes32 public verifier;
    string public IPFSaddress;
    address[] public signersArray;

    enum Status {Pending, Signed, Revoked}
    Status public status;

    struct Signatures {
        uint256 signatureTimeStamp;
        bytes signature;
        bool isValid;
        uint256 revokedSig;
    }

    mapping(address => Signatures) public signers;

    ///////////////
    // CONSTRUCTOR
    //////////////

    constructor(
        bytes32 _Verifier,
        string memory _IPFSaddress,
        uint256 _numberOfSigners
    ) public {
        issuer = msg.sender;
        IPFSaddress = _IPFSaddress;
        documentTimeStamp = block.timestamp;
        verifier = _Verifier;
        numberOfSigners = _numberOfSigners;
        status = Status.Pending;
    }

    // Document Hash identifier as the key to retrive its information

    event Signed(address indexed _signer);
    event Revoked(address indexed _signer);
    event DocRevoked(bytes32 indexed _verifier);

    function signersList() public view returns (address[] memory) {
        return signersArray;
    }

    function signDocument(
        bytes32 _verifier,
        // uint8 _v,
        // bytes32 _r,
        // bytes32 _s,
        bytes memory _signature
    ) public returns (bool success) {
        address validSignature;
        validSignature = verify(_signature, _verifier); //verify(_verifier, _v, _r, _s);
        require(
            validSignature == msg.sender,
            "Signer do NOT own this Signature"
        );
        require(
            status == Status.Pending &&
                signers[validSignature].isValid == false,
            "This Document is already signed"
        );
        signers[validSignature].signatureTimeStamp = block.timestamp;
        signers[validSignature].signature = _signature;
        signers[validSignature].isValid = true;
        signersArray.push(validSignature);
        if (signersArray.length == numberOfSigners) {
            status = Status.Signed;
        }
        emit Signed(validSignature);
        return true;
    }

    // using ECDSA for bytes32;

    // function verify(bytes memory _signature, bytes32 _verifier)
    //     public
    //     pure
    //     returns (address)
    // {
    //     address signer = ECDSA.recover(_verifier, _signature);
    //     if (signer == address(0)) revert("signer address == 0");

    //     return signer;
    // }

    function verify(bytes memory sig, bytes32 _hash)
        public
        pure
        returns (address)
    {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        (v, r, s) = splitSignature(sig);

        return ecrecover(_hash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65);
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function setNumeberOfSigners(uint8 _number) public {
        require(msg.sender == issuer, "only issuer can change");
        numberOfSigners = _number;
    }

    function revokeSignature(bytes32 _verifier, bytes memory _signature)
        public
    {
        address validSignature;
        validSignature = verify(_signature, _verifier); //(_verifier, _v, _r, _s);
        require(
            signers[validSignature].isValid == true,
            "Signature is NOT valid"
        );
        address signer = msg.sender;
        _revoke(signer);
        emit Revoked(msg.sender);
        if (revokeCounter == numberOfSigners) {
            status = Status.Revoked;
            emit DocRevoked(verifier);
        }
    }

    function _revoke(address _signer) internal {
        signers[_signer].revokedSig = now;
        signers[_signer].isValid = false;
        revokeCounter++;
    }
}
