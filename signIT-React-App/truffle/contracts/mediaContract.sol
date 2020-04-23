pragma solidity 0.5.8;

contract MediaTimeStamp {
    struct MediaHash {
        uint256 hashID;
        string description;
        string URL;
        address mediaOwner;
        string typeOfMedia;
        uint256 date;
        bool exist;
    }

    struct HashList {
        uint256[] itensID;
    }

    struct TransferRequest {
        address currentOwner;
        bool currentOwnerAproval;
        address destinataryOwnership;
        string reasons;
        bool hasRequest;
    }

    address public contractOwner;

    mapping(uint256 => MediaHash) public mediaOwned;
    mapping(address => HashList) mediaOwner;
    mapping(uint256 => TransferRequest) public transferRequest; // reasons for the transfer request

    event Approval(
        address indexed _from,
        address indexed _to,
        uint256 indexed _hash
    );
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _hash,
        address Approver
    );
    event Request(
        address indexed _requester,
        uint256 indexed _hash,
        string indexed _reasons
    );

    constructor() public {
        contractOwner = msg.sender;
    }

    modifier OnlyContractOwner() {
        require(msg.sender == contractOwner, "Only Owner Access");
        _;
    }

    modifier OnlyMediaOwner(uint256 _hash) {
        require(
            mediaOwned[_hash].mediaOwner == msg.sender,
            "only media owner can approve"
        );
        _;
    }

    function createOwnership(
        uint256 _hash,
        string memory _description,
        string memory _URL,
        string memory _mediaType
    ) public returns (bool success) {
        require(mediaOwned[_hash].exist == false, "this HASH already exists");

        mediaOwned[_hash].hashID = _hash;
        mediaOwned[_hash].description = _description;
        mediaOwned[_hash].URL = _URL;
        mediaOwned[_hash].mediaOwner = msg.sender;
        mediaOwned[_hash].typeOfMedia = _mediaType;
        mediaOwned[_hash].date = block.timestamp;
        mediaOwned[_hash].exist = true;
        mediaOwner[msg.sender].itensID.push(_hash);
        return true;
    }

    function myMedias() public view returns (uint256[] memory) {
        return mediaOwner[msg.sender].itensID;
    }

    function requestOwnership(uint256 _hash, string memory _reasons) public {
        require(mediaOwned[_hash].exist == true, "this HASH does NOT exist");
        require(
            mediaOwned[_hash].mediaOwner != msg.sender,
            "Media owner can NOT request"
        );
        require(
            transferRequest[_hash].hasRequest == false,
            "this HASH already has a request"
        );

        transferRequest[_hash].currentOwner = mediaOwned[_hash].mediaOwner;
        transferRequest[_hash].destinataryOwnership = msg.sender;
        transferRequest[_hash].reasons = _reasons;
        transferRequest[_hash].currentOwnerAproval = false;
        transferRequest[_hash].hasRequest = true;
        emit Request(msg.sender, _hash, _reasons);
    }

    function ownerApproval(uint256 _hash) public {
        require(
            mediaOwned[_hash].mediaOwner == msg.sender,
            "only media owner can approve"
        );

        transferRequest[_hash].currentOwnerAproval = true;
        emit Approval(
            msg.sender,
            transferRequest[_hash].destinataryOwnership,
            _hash
        );
    }

    function transferOwnership(uint256 _hash) public OnlyContractOwner {
        require(
            transferRequest[_hash].hasRequest == true,
            "this HASH has NO request"
        );
        require(
            transferRequest[_hash].currentOwnerAproval == true,
            "Current owner has NOT apporved transfer"
        );

        address _currentOwner = mediaOwned[_hash].mediaOwner;
        mediaOwned[_hash].mediaOwner = transferRequest[_hash]
            .destinataryOwnership;
        mediaOwner[transferRequest[_hash].destinataryOwnership].itensID.push(
            _hash
        );
        for (uint256 i = 0; i < mediaOwner[_currentOwner].itensID.length; i++) {
            if (mediaOwner[_currentOwner].itensID[i] == _hash) {
                delete mediaOwner[_currentOwner].itensID[i];
                i == mediaOwner[_currentOwner].itensID.length;
            }
            transferRequest[_hash].hasRequest = false;
            transferRequest[_hash].currentOwnerAproval = false;
        }
        emit Transfer(
            _currentOwner,
            mediaOwned[_hash].mediaOwner,
            _hash,
            msg.sender
        );

    }

}
