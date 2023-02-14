//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

contract BukasujiBank{
    
    mapping(address=>uint256) public balances;
    mapping(address => bool) public isDeposited;
    mapping(string=>uint256) public kycDetails;
    
    address public owner;

    event FundsDeposited (address indexed user, uint amount, uint timestamp);
    event ProfileUpdated (address indexed user);
    
    struct UserDetails {
        string name;
        uint age;
    }

    //array for all the user details
    UserDetails[] detailArr;
    
    //a modifier to specify owner of the contract
    modifier isOwner {
        require(owner == msg.sender);
        _;
    }

    // modifier to check that a user have made deposit before increasing fund or his deposit in the bank
    modifier increaseDeposit {
        require(balances[msg.sender] > 0, "you have 0 balance, deposit first before increasing your deposit");
        _;
    }

    constructor(){
        owner= (msg.sender);
    }

   
  // function to make deposit.
    function deposit() public payable  {
       balances[msg.sender] += msg.value;
       emit FundsDeposited(msg.sender, msg.value,block.timestamp );
    }

    //function to increase or add to initial deposit.
    //it has a modifier to check, that the user have alredy made a deposit before increasing fund
    function addfund() public payable  increaseDeposit {
        balances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }

    //function to check balance
    function checkBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    //function to withdraw deposit
    function withdraw(uint256 amount) public isOwner  {
        require(balances[msg.sender] >= amount,  "insufficient fund, please reduce amount");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
    }

   // function to set user details, takes two parameter age and name
   function setUserDetails(string calldata name, uint256 age) public {
        emit ProfileUpdated(msg.sender);
        detailArr.push(UserDetails(name, age));
        kycDetails[name] = age;
    }
    
   // function to fetch user details
    function getDetail(string memory name) public view  returns ( uint) {
        return  kycDetails[name];
        
    }

    //function to get the total balance or deposit in the bank contract
    function depositsBalance() public view returns (uint) {
        return address(this).balance;
    }

    //fallback function, incase fund was sent directly to the bank without the deposit() or addfund() function
    fallback () external payable {}
    receive() external payable {}   
    
}   

