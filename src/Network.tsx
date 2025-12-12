import Web3 from 'web3';
import { ethers } from 'ethers';
import PredictionFactoryAbi from "./PredictionFactory.json"
import PredictionAbi from "./PredictionContract.json"

const FACTORY_ADDRESS = "0x833f565a4c88ed527444cbf23234dd6690bf96f8"
const predictionABI  =  PredictionAbi.output.abi
const predictionFactoryAbi = PredictionFactoryAbi.output.abi

interface myBet{
    index:Number
    amount:bigint
  }
  
  interface Bet{
    address: string;
    title: string;
    options: string[];
    owner: string;
    settled: boolean;
    totalPool: bigint;
    myBet:myBet
  }

  declare global {
    interface Window {
      ethereum?: any;
    }
  }

class NetworkService {
    private provider: ethers.BrowserProvider | null = null;
    private web3: Web3 | null = null;
    private signerAddress: string | null = null;
  
    async connectWallet() {
      if (!window.ethereum) throw new Error("No wallet found");
      
      await window.ethereum.send("eth_requestAccounts");
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.web3 = new Web3(window.ethereum);
      
      const signer = await this.provider.getSigner();
      this.signerAddress = await signer.getAddress();
      return this.provider;
    }
  
    private async ensureConnection() {
      if (!this.provider || !this.web3 || !this.signerAddress) {
        await this.connectWallet();
      }
      return { provider: this.provider!, web3: this.web3! };
    }
  
    getSignerAddress() {
      return this.signerAddress;
    }
  
    private getFactoryContract() {
      if (!this.web3) throw new Error("Not connected");
      return new this.web3.eth.Contract(predictionFactoryAbi, FACTORY_ADDRESS);
    }
  
    private getPredictionContract(addr:string) {
        if (!this.web3) throw new Error("Not connected");
        return new this.web3.eth.Contract(predictionABI, addr);
      }
    async getBets() {
      await this.ensureConnection();
      const contract = this.getFactoryContract();
      return await contract.methods.getDeployedPredictions().call();
    }

    async getMyBets(address:string):Promise<Bet[]> {
        await this.ensureConnection();
        const contract = this.getFactoryContract();
        const addresses = await contract.methods.getPredictionsByCreator(address).call();
        const predictions:Bet[] = await Promise.all(
            addresses!.map(async (addr) => {
              const predictionContract = this.getPredictionContract(addr);
              const title = await predictionContract.methods.betTitle().call();
              const options = await predictionContract.methods.getOptions().call();
              const owner = await predictionContract.methods.owner().call();
              const totalPool = await predictionContract.methods.totalPool().call();
            //   const bettors = await predictionContract.methods.bettors().call();
              const settled = await predictionContract.methods.settled().call();
              const myBet = await predictionContract.methods.betArray(this.signerAddress).call();
              const bet: Bet = {
                address: addr,
                title: String(title),
                options: options as string[],
                owner: String(owner),
                totalPool:  BigInt(String(totalPool ?? '0')),
                settled: Boolean(settled),
                myBet: {
                    amount: BigInt(String((myBet as any)?.amount ?? '0')),
                    index:Number((myBet as any)?.index ?? 0)
                }
            };
            return bet;
            })
          );
          return predictions
      }

      async getJointedBets(addresses:string[]):Promise<Bet[]>{
        const predictions = await Promise.all(
            addresses!.map(async (addr) => {
              const predictionContract = this.getPredictionContract(addr);
              const title = await predictionContract.methods.betTitle().call();
              const options = await predictionContract.methods.getOptions().call();
              const owner = await predictionContract.methods.owner().call();
              const totalPool = await predictionContract.methods.totalPool().call();
            //   const bettors = await predictionContract.methods.bettors().call();
              const settled = await predictionContract.methods.settled().call();
              const myBet = await predictionContract.methods.betArray(this.signerAddress).call();
              const bet: Bet = {
                address: addr,
                title: String(title),
                options: options as string[],
                owner: String(owner),
                totalPool:  BigInt(String(totalPool ?? '0')),
                settled: Boolean(settled),
                myBet: {
                    amount: BigInt(String((myBet as any)?.amount ?? '0')),
                    index:Number((myBet as any)?.index ?? 0)
                }
            };
            return bet;
            })
          );
          return predictions
      }
  
    async deployPrediction(title: string, options: string[]) {
      await this.ensureConnection();
      const contract = this.getFactoryContract();
      
      return await contract.methods
        .createPrediction(title, options)
        .send({ from: this.signerAddress! });
    }

    async getOdds(index:number,amount:number,addr:string){
        await this.ensureConnection();
        const contract = this.getPredictionContract(addr)
        const odds = await contract.methods.getOdds(index, this.web3!.utils.toWei(amount, 'ether')).call();
        return odds;
    }

    async placeBet(index:number,amount:number,address:string){
        await this.ensureConnection();
        const contract = this.getPredictionContract(address)

        return await contract.methods
          .placeBet(index, this.web3!.utils.toWei(amount, 'ether'))
          .send({ from: this.signerAddress! ,value:this.web3!.utils.toWei(amount, 'ether')});
    }
    async settleBet(index:number,address:string){
        await this.ensureConnection();
        const contract = this.getPredictionContract(address)
        return await contract.methods
          .settleBet(index)
          .send({ from: this.signerAddress!});
    }
  }

export const networkService = new NetworkService();