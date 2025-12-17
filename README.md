# Social Betting - Blockchain Course Final Project

A decentralized social betting platform designed for small groups of friends or communities. Create custom bets as smart contracts, lock funds on-chain, and rely on transparent smart contract execution for payouts.

## How It Works

### Betting Flow

1. Bet Creation  
   - Creator defines event and outcomes    
   - Deploys smart contract  

2. Participation Phase  
   - Participants connect wallets  
   - Choose outcomes  
   - Lock funds on-chain  

3. Resolution Phase  
   - Creator declares winner  
   - Contract processes result  

4. Payout Distribution  
   - Winners receive proportional payouts  
   - Funds transferred directly to wallets  

## Tech Stack
- Solidity (^0.8.0)
- Hardhat
- TypeScript
- React
- Vite
- Web3.js 
- MetaMask

## Getting Started

NO API KEY NEEDED TO RUN THE WEBAPP.
LIVE SITE CAN BE FOUND AT  : [https://socialbetting.netlify.app/](https://socialbetting.netlify.app/)

### Prerequisites

- Node.js v16+
- npm or yarn
- MetaMask
- Git

### Installation

1. Clone repository and cd into it
2. npm install
3. npm run dev
4. Open http://localhost:5173

### TESTING REPOSITORY 
link : [https://github.com/Val0007/Socialbetting-Testing](https://github.com/Val0007/Socialbetting-Testing)
**To RUN**
npx hardhat compile
npx hardhat test solidity --coverage





### Usage Guide
Bet Creators
1.Connect wallet
2.Create bet
3.Share bet ID
4.Declare winner
5.Automatic payouts


## DOCS

### contracts/Prediction.sol

**Constructor Function** `constructor(address betCreator, string memory title, string[] memory optionsToBet)`

**What it does:** Creates a new prediction market contract

**Parameters:**
- `betCreator` (address) - Address of bet creator
- `title` (string) - Description of the event
- `optionsToBet` (string[]) - Array of possible outcomes


**placeBet Function:** `placeBet(uint256 index, uint256 amount) public payable`

**What it does:** Allows users to place a bet on a specific option

**Parameters:**
- `index` (uint256) - Option index to bet on (0-3)
- `amount` (uint256) - Amount to bet in wei

**getOdds Function:** `getOdds(uint256 index, uint256 amount) public view returns (uint256)`

**What it does:** Calculates potential payout odds for a bet

**Parameters:**
- `index` (uint256) - Option index to check
- `amount` (uint256) - Hypothetical bet amount

 

**settleBet Function:** `settleBet(uint256 winnerIndex) public payable`

**What it does:** Settles the bet and distributes payouts to winners

**Parameters:**
- `winnerIndex` (uint256) - Index of the winning option

**Requirements:**
- Only creator can call
- Bet not already settled
- At least one bet on winning outcome

**RESULT:**
- Calculates if 1.05x payout possible
- If not possible: refunds all bets
- If possible: calculates dynamic fee, distributes payouts, pays creator


### src/Network.tsx

**getBets Function** 
`async getBets()`

**What it does:** Retrieves all deployed prediction contracts from factory

**Parameters:** None

**Returns:** `string[]` - Array of prediction contract addresses

**getMyBets Function**
`
async getMyBets(address: string): Promise
`

**What it does:** Fetches all bets created by a specific address with full details

**Parameters:**
- `address` (string) - Creator's wallet address

**Returns:** `Promise<Bet[]>` - Array of Bet objects with complete information


**getJointedBets Function**
`
async getJointedBets(addresses: string[]): Promise
`

**What it does:** Fetches detailed information for specific bet contracts where user participated

**Parameters:**
- `addresses` (string[]) - Array of prediction contract addresses

**Returns:** `Promise<Bet[]>` - Array of Bet objects with user's participation data

**deployPrediction Function**
`
async deployPrediction(title: string, options: string[])
`
**What it does:** Creates a new prediction market contract via factory

**Parameters:**
- `title` (string) - Description of the betting event
- `options` (string[]) - Array of possible outcomes (max 4)

**Returns:** Transaction receipt object

**Requirements:**
- Wallet connected
- Sufficient gas for deployment
- Valid title and options

**Result:**
- New prediction contract deployed
- Contract registered in factory
- Returns transaction details

**placeBet Function**
`
async placeBet(index: number, amount: number, address: string)
`

**What it does:** Places a bet on a specific option in a prediction market

**Parameters:**
- `index` (number) - Option index to bet on (0-3)
- `amount` (number) - Bet amount in ETH (not wei)
- `address` (string) - Prediction contract address

**Returns:** Transaction receipt object

**Requirements:**
- Wallet connected
- Sufficient ETH balance
- Betting still active (before deadline)
- User hasn't bet before
- Contract not settled

**Result:**
- ETH transferred to contract
- Bet recorded on-chain
- User added to participants list

  **settleBet Function**
  `
async settleBet(index: number, address: string)
`

**What it does:** Settles the bet and distributes payouts (creator only)

**Parameters:**
- `index` (number) - Winning option index
- `address` (string) - Prediction contract address

**Returns:** Transaction receipt object

**Requirements:**
- Caller must be bet creator
- Bet not already settled
- At least one bet on winning outcome

**Result:**
- Bet marked as settled
- Winners receive payouts automatically
- Creator receives dynamic fee
- Or all bets refunded if <1.05x payout

