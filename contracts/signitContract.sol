pragma solidity ^0.5.16;

import {ECDSA} from "@OpenZeppelin/contracts/cryptography/ECDSA.sol";


contract SignitDoc {
    using ECDSA for bytes32;

    /////////////////
    // Contract State
    ////////////////

    mapping(bytes32 => Document) public Documents;
    mapping(bytes32 => mapping(address => Signature)) public Signers;
    enum Status {Pending, Signed, Revoked}

    struct Document {
        bool isValid;
        uint256 documentTimeStamp;
        uint16 numberOfSigners;
        uint256 revokeCounter;
        address issuer;
        address[] signersArray;
        Status status;
    }

    struct Signature {
        uint256 signatureTimeStamp;
        bytes signature;
        bool isValid;
        uint256 revokedSig;
    }

    // Document Hash identifier as the key to retrive its information
    event DocumentCreated(bytes32 indexed hash, address indexed owner);
    event Signed(address indexed _signer, bytes32 indexed _hash);
    event Revoked(address indexed _signer, bytes32 indexed _hash);
    event DocRevoked(bytes32 indexed _hash);

    function newDocument(bytes32 _hash, uint16 _numberOfSigners)
        public
        returns (bool success)
    {
        require(Documents[_hash].isValid == false, "Documente already exists");
        Documents[_hash].issuer = msg.sender;
        Documents[_hash].documentTimeStamp = block.timestamp;
        Documents[_hash].numberOfSigners = _numberOfSigners;
        Documents[_hash].status = Status.Pending;
        Documents[_hash].isValid = true;
        emit DocumentCreated(_hash, msg.sender);
        return true;
    }

    function signersList(bytes32 _hash) public view returns (address[] memory) {
        return Documents[_hash].signersArray;
    }

    function signDocument(bytes32 _hash, bytes memory _signature)
        public
        returns (bool success)
    {
        address validSignature;
        validSignature = verify(_signature, _hash);
        require(
            validSignature == msg.sender,
            "Signer do NOT own this Signature"
        );
        require(
            Documents[_hash].status == Status.Pending &&
                Signers[_hash][validSignature].isValid == false,
            "This Document is already signed"
        );
        Signers[_hash][validSignature].signatureTimeStamp = block.timestamp;
        Signers[_hash][validSignature].signature = _signature;
        Signers[_hash][validSignature].isValid = true;
        Documents[_hash].signersArray.push(validSignature);
        if (
            Documents[_hash].signersArray.length ==
            Documents[_hash].numberOfSigners
        ) {
            Documents[_hash].status = Status.Signed;
        }
        emit Signed(validSignature, _hash);
        return true;
    }

    function verify(bytes memory _signature, bytes32 _hash)
        public
        pure
        returns (address)
    {
        bytes32 newhash = ECDSA.toEthSignedMessageHash(_hash);
        address signer = ECDSA.recover(newhash, _signature);
        return signer;
    }

    function setNumeberOfSigners(uint8 _number, bytes32 _hash) public {
        require(
            msg.sender == Documents[_hash].issuer,
            "only issuer can change"
        );
        Documents[_hash].numberOfSigners = _number;
    }

    function revokeSignature(bytes32 _hash, bytes memory _signature) public {
        address validSignature;
        validSignature = verify(_signature, _hash);
        require(
            Signers[_hash][validSignature].isValid == true,
            "Signature is NOT valid"
        );
        address signer = msg.sender;
        _revoke(signer, _hash);
        emit Revoked(signer, _hash);
        if (
            Documents[_hash].revokeCounter == Documents[_hash].numberOfSigners
        ) {
            Documents[_hash].status = Status.Revoked;
            emit DocRevoked(_hash);
        }
    }

    function _revoke(address _signer, bytes32 _hash) internal {
        Signers[_hash][_signer].revokedSig = now;
        Signers[_hash][_signer].isValid = false;
        Documents[_hash].revokeCounter++;
    }
}
