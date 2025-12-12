pragma solidity ^0.8.0;



struct Bet {
    uint256 index;  //index of the option
    uint256 amount; //hold wei values
}


contract Prediction {
    address public owner;
    string public betTitle;
    string[] options; //only 4 options max -> can limit using the frontend
    mapping(address => Bet) public betArray;
    mapping(uint256 => uint256) totalBetsPerOption;
    uint256 public totalPool;
    // uint256 maxFeePercentage = 5;
    address[] bettors;


    uint256 private bettingEndTime;
    bool   public settled;
    uint256 public winningIndex;



    //each bet will have a better 
    //better can only bet once 
    //better chooses an option and the amount

    
    constructor(address  betCreator,string memory title, string[] memory optionsToBet)  {
        bettingEndTime = block.timestamp + 1 days; //every bet valid for 1 day
        owner = betCreator;
        betTitle = title;
        options = optionsToBet;

    }
    
    function placeBet(uint256 index, uint256 amount) public payable {  

        //make sure bet is not over
        require(block.timestamp < bettingEndTime, "Betting is closed");
        require(!settled, "Already settled");

        //make sure he can only bet once , if key not there default value is zero when accessed
        require(betArray[msg.sender].amount == 0, "Already placed a bet");
        require(amount > 0, "Bet amount must be greater than zero");
        require(msg.value == amount, "Sent value must match amount");


        //deposit value to totalPool
        totalPool += msg.value;

        //add to betArrays
        betArray[msg.sender] = Bet(index, amount);
        totalBetsPerOption[index] += amount;
        bettors.push(msg.sender);

        
    }

    //see odds before betting
    function getOdds(uint256 index , uint256 amount) public view returns (uint256) {

        if (amount == 0) {
        return 0; 
        }

        //calculate total pool for that index
        uint256 totalOnOption = totalBetsPerOption[index];
        // Frontend should handle this specially using minimum gurantee

        //return odds percentage including potential bet  , no decimal , so convert to 100
        uint256 oddsPercentage = ((totalPool + amount) * 100) / (totalOnOption + amount);
        return oddsPercentage;
    }

    // can only be done by the creator of the bet
    function settleBet(uint256 winnerIndex) public payable   {
        
        //check if betting still active 
    require(msg.sender == owner, "Only creator can settle");
    // require(block.timestamp >= bettingEndTime, "Betting still active");
    require(!settled, "Already settled");

        settled = true;
        //calculate dynamic creator fee and payout multiplier , refund all if 1.05x cannot be done
        uint256 totalOnWinner = totalBetsPerOption[winnerIndex];
        require(totalOnWinner > 0, "No bets on winning outcome");
    
    // Calculate maximum possible payout at 0% fee
    uint256 maxPayoutMultiplier = (totalPool * 100) / totalOnWinner;
    
    // If can't achieve 1.05x even at 0% fee, refund everyone
    if (maxPayoutMultiplier < 105) {
        refundAllBets();
        return;
    }

    uint256 creatorFee  = calculateDynamicFee(winnerIndex);
    uint256 distributablePool = totalPool * (100 - creatorFee) / 100;
    uint256 creatorFeeAmount = totalPool - distributablePool;

    //get all people who bet on winner index 
    for (uint256 i = 0; i < bettors.length; i++) {
    address bettor = bettors[i];
    Bet memory bet = betArray[bettor];
    
    if (bet.index == winnerIndex) {
         //mutliply their amounts using payout mutliplier, precision loss , using this 
        uint256 payout = (bet.amount * distributablePool) / totalOnWinner;        

        payable(bettor).transfer(payout);
    }
    }

        //send money to winners and creator
        payable(owner).transfer(creatorFeeAmount);
        winningIndex = winnerIndex;

    }


function calculateDynamicFee(uint256 winnerIndex) internal view returns (uint256 f) {
    uint256 totalOnWinner = totalBetsPerOption[winnerIndex];
    
    // Try fees from highest to lowest , we go from 5% to 0% , we already know its possible to pay everybody at 0%
    for (uint256 fee = 5; fee > 0; fee--) {
        uint256 distributablePool = totalPool * (100 - fee) / 100; //(start from 0.95x of the pool)
        uint256 payoutMultiplier = (distributablePool * 100) / totalOnWinner; 
        
        // Use highest fee that still maintains 1.05x
        if (payoutMultiplier >= 105) { 
            return (fee);
        }
    }
    
    // If no fee works, use 0% , we know it already
    // uint256 multiplier = (totalPool * 100) / totalOnWinner;
    return (0);
}

function refundAllBets() internal {
    
    for (uint256 i = 0; i < bettors.length; i++) {
        address participant = bettors[i];
        uint256 refundAmount = betArray[participant].amount;
        
        if (refundAmount > 0) {
            betArray[participant].amount = 0; // Prevent double refund
            (bool success, ) = participant.call{value: refundAmount}("");
            require(success, "Refund failed");
        }
    }
}

function getOptions() public view returns (string[] memory) {
    return options;
}
    

}