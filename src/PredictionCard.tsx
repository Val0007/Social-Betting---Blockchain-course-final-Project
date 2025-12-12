import { useState } from "react";
import { networkService } from "./Network";
import Web3 from 'web3';

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

interface PredictionCardProps {
    prediction: Bet;
    refresh:()=>void
  }
  
  const PredictionCard = ({ prediction,refresh }: PredictionCardProps) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [amount, setAmount] = useState<string>();
    const [settleInitated,setSettleInitated] = useState(false)
    const [winningIndex,setWinningIndex] = useState(0)




    return (
      <div key={prediction.address} className="border border-gray-300 p-4 rounded ">
        <h3 className="font-bold text-lg mb-2">{prediction.title}</h3>
        <h3 className="font-medium text-lg mb-2">{prediction.address}</h3>
        {/* <p className="text-sm text-gray-600 mb-2">Owner: {prediction.owner.slice(0, 6)}...{prediction.owner.slice(-4)}</p> */}
        <p className="text-sm mb-2">Total Pool: {Web3.utils.fromWei(prediction.totalPool, 'ether')} ETH</p>        <div className="flex gap-2 mb-2 flex-col">
          {prediction.options.map((option, i) => (
            prediction.myBet.amount > 0n && prediction.myBet.index == i ? (
              <div key={i} className="flex flex-row gap-2">
                <span className="px-2 py-1 bg-amber-700 text-lg rounded">{option}</span>
                <span className="px-2 py-1 bg-amber-700 text-lg rounded">{Web3.utils.fromWei(prediction.myBet.amount, 'ether')} ETH</span>
              </div>
            ) : (
              <div key={i}>
                <span className="px-2 py-1   bg-emerald-950 text-white text-lg rounded cursor-pointer" 
                  onClick={() => {
                    if(prediction.settled){
                        alert("Bet has been settled")
                        return
                    }
                    if(!(prediction.myBet.amount > 0n)){
                        setSelectedOption(i)
                    }
                    else{
                        alert("can only bet once in a bet")
                    }
                    }}
                >
                  {option}
                </span>
                {selectedOption == i ? 
                  <div className="flex gap-2 mt-2">
                    <input type="integer" placeholder="Enter amount" 
                    className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                    value={amount}
                    onChange={(e) => setAmount((e.target.value))}
                    />
                    <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={async ()=>{
                        const result = await networkService.getOdds(selectedOption,Number(amount),prediction.address)
                        console.log(result)
                        alert("You will get back " + (Number(amount) * Number(result))/100 + " ETH if you win")
                    }}>Get Odds</button>
                    <button className="px-3 py-1 bg-green-500 text-white rounded"
                    onClick={async ()=>{
                        const result = await networkService.placeBet(selectedOption,Number(amount),prediction.address)
                        console.log(result)
                        refresh()
                    }}
                    >Bet</button>
                  </div>
                  : <></>}

              </div>
            )
          ))}
        </div>
        

        {settleInitated ? 
        <div>
             <input type="number" placeholder="Enter Winning Index" 
                    className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                    value={winningIndex}
                    onChange={(e) => setWinningIndex(Number(e.target.value))}
                    />
        </div>  
        :<></>  
    }
            {prediction.settled ? 
            
            <div><button className='bg-amber-300 px-5 py-2 mt-2 cursor-not-allowed rounded text-lg'>Settled</button></div> :
            <div>
            <button className='bg-amber-300 px-5 py-2 mt-2 cursor-pointer rounded text-lg'
            onClick={async ()=>{
                if(settleInitated){
                    const result = await networkService.settleBet(winningIndex,prediction.address)
                    console.log(result)
                    setSettleInitated(false)
                    refresh()

                }
                else{
                    setSettleInitated(true)
                }
            }}
            >Settle</button>
            </div>
  
          }
      </div>
    );
  };

export default PredictionCard