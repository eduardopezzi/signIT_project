pragma solidity ^0.5.0;


contract NewDocument {
    address public factoryAddress;
    uint256 public documentTimeStamp;
    uint256 public signersNumber;
    address public issuer;
    uint256 public verifier;
    address[] public signersArray;

    enum Status {Pending, Signed, Revoked}
    Status public status;

    struct Signatures {
        uint256 signatureTimeStamp;
        bytes signatureTX;
        bool isValid;
    }

    mapping(address => Signatures) public signers;

    constructor(uint256 _Verifier, uint256 _signersNumber) public {
        issuer = msg.sender;
        documentTimeStamp = block.timestamp;
        verifier = _Verifier;
        signersNumber = _signersNumber;
        status = Status.Pending;
    }

    // Document Hash identifier as the key to retrive its information

    event Signed(address indexed _signer);
    event Revoked(address indexed _signer);

    function signContract(bytes memory _signature) public {
        require(
            signers[msg.sender].isValid == false && ,
            "This account already signed"
        );
        signers[msg.sender].signatureTimeStamp = now;
        signers[msg.sender].signatureTX = _signature;
        signersArray.push(msg.sender);
        status = Status.Signed;
    }

    function verify(bytes32 _message, uint8 _v, bytes32 _r, bytes32 _s)
        internal
        pure
        returns (address)
    {
        address signer = ecrecover(_message, _v, _r, _s);
        return signer;
    }

    function setNumeberOfSigners(uint8 _number) public {
        signersNumber = _number;
    }
}
