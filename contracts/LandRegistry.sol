pragma solidity ^0.5.0;

contract LandRegistry {
    // struct Task {
    //     uint256 id;
    //     string content;
    //     bool completed;
    // }
    struct user {
        address userid;
        string uname;
        uint256 ucontact;
        string uemail;
        uint256 upostalCode;
        string city;
        bool exist;
    }
    struct landDetails {
        address payable id;
        string ipfsHash;
        string laddress;
        uint256 lamount;
        uint256 key;
        string isGovtApproved;
        string isAvailable;
        address requester;
        reqStatus requestStatus;
    }

    address[] userarr;
    uint256[] assets;
    address owner;
    enum reqStatus {Default, Pending, Rejected, Approved}

    constructor() public {
        owner = msg.sender;
    }

    // struct profiles {
    //     uint256[] assetList;
    // }

    mapping(address => uint256[]) profile;      // address of user ==> list of land assets he owns
    mapping(address => user) public users;      // address of user ==> details of user.
    mapping(uint256 => landDetails) public land;// key of land     ==> details of land.

    function addUser(
        address user_address, 
        string memory user_name, 
        uint256 user_contact, 
        string memory user_email,
        uint256 user_postal_code,
        string memory user_city
    ) public returns (bool) {
        users[user_address] = user(
            user_address,
            user_name,
            user_contact,
            user_email,
            user_postal_code,
            user_city,
            true
        );
        userarr.push(user_address);
        return true;
    }

    function getUser(address user_address)
        public
        view
        returns (
            address,
            string memory,
            uint256,
            string memory,
            uint256,
            string memory,
            bool
        )
    {
        if (users[user_address].exist)
            return (
                users[user_address].userid,
                users[user_address].uname,
                users[user_address].ucontact,
                users[user_address].uemail,
                users[user_address].upostalCode,
                users[user_address].city,
                users[user_address].exist
            );
    }

    function Registration(
        address payable owner_id,
        string memory _ipfsHash,
        string memory _laddress,
        uint256 _lamount,
        uint256 _key,
        string memory status,
        string memory _isAvailable
    ) public returns (bool) {
        land[_key] = landDetails(
            owner_id,
            _ipfsHash,
            _laddress,
            _lamount,
            _key,
            status,
            _isAvailable,
            0x0000000000000000000000000000000000000000,
            reqStatus.Default
        );
        profile[owner_id].push(_key);
        assets.push(_key);
        return true;
    }

    function computeId(string memory _laddress, string memory _lamount)
        public
        view
        returns (uint256)
    {
        return
            uint256(keccak256(abi.encodePacked(_laddress, _lamount))) % 10000000000000;
    }

    function viewAssets() public view returns (uint256[] memory) {
        return (profile[msg.sender]);
    }

    function Assets() public view returns (uint256[] memory) {
        return assets;
    }

    function landInfoOwner(uint256 id)
        public
        view
        returns (
            address payable,
            string memory,
            uint256,
            string memory,
            string memory,
            address,
            reqStatus
        )
    {
        return (
            land[id].id,
            land[id].ipfsHash,
            land[id].lamount,
            land[id].isGovtApproved,
            land[id].isAvailable,
            land[id].requester,
            land[id].requestStatus
        );
    }

    function govtStatus(
        uint256 _id,
        string memory status,
        string memory _isAvailable
    ) public returns (bool) {
        land[_id].isGovtApproved = status;
        land[_id].isAvailable = _isAvailable;
        return true;
    }

    function makeAvailable(uint256 property) public {
        require(land[property].id == msg.sender);
        land[property].isAvailable = "Available";
    }

    function requstToLandOwner(uint256 id) public {
        land[id].requester = msg.sender;
        land[id].isAvailable = "Pending";
        land[id].requestStatus = reqStatus.Pending;
    }

    function processRequest(uint256 property, reqStatus status) public {
        require(land[property].id == msg.sender);
        land[property].requestStatus = status;
        land[property].isAvailable = "Approved";
        if (status == reqStatus.Rejected) {
            land[property].requester = address(0);
            land[property].requestStatus = reqStatus.Default;
            land[property].isAvailable = "Available";
        }
    }

    function buyProperty(uint256 property) public payable {
        require(msg.sender == land[property].requester);
        require(land[property].requestStatus == reqStatus.Approved);
        require(msg.value == (land[property].lamount * 1000000000000000000));

        land[property].id.transfer(land[property].lamount * 1000000000000000000);
        removeOwnership(land[property].id, property);
        
        land[property].id = msg.sender;
        land[property].isGovtApproved = "Not Approved";
        land[property].isAvailable = "Not yet approved by the govt.";
        land[property].requester = address(0);
        land[property].requestStatus = reqStatus.Default;
        profile[msg.sender].push(property);
    }

    function removeOwnership(address previousOwner, uint256 id) private {
        uint256 index = findId(id, previousOwner);
        uint256 len = profile[previousOwner].length;

        profile[previousOwner][index] = profile[previousOwner][len - 1];
        delete profile[previousOwner][len - 1];
        profile[previousOwner].length--;
    }

    function findId(uint256 id, address user) public view returns (uint256) {
        uint256 i;
        for (i = 0; i < profile[user].length; i++) {
            if (profile[user][i] == id) return i;
        }
        return i;
    }
}
