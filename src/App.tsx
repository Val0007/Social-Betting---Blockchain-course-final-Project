import { useEffect, useState, type CSSProperties } from 'react'
import Navbar from './NavBar'
import { networkService } from './Network';
import PredictionCard from './PredictionCard';
import PredictionCard2 from './PredictionCard2';
import { ClipLoader } from 'react-spinners';

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

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "#D88A25",
}



function App() {
  const [option, setOption] = useState<Number>(0);
  const [title, setTitle] = useState<string>("");
  const [options, setOptions] = useState<string>("");
  const [mybets,setMyBets] = useState<Bet[]>([]);
  const [joinedBets,setJoinedBets] = useState<Bet[]>([]);
  const [betAddress, setBetAddress] = useState<string>(""); //for betting and showing odds
  let [loading, setLoading] = useState(false);
;

  useEffect(()=>{

    if(option == 1){
      refresh()

    }

  },[option])

  async function refresh(){
    console.log("refresh")
    setLoading(true)
    getMyBets().then(result => setMyBets(result ?? []))
    getJoinedBets().then(result => setJoinedBets(result ?? []))
    setLoading(false)
  }
    
  async function getMyBets(){
    if(networkService.getSignerAddress() == null){
      alert("connect wallet first!")
      setOption(0)
    }
    else{
      const add = networkService.getSignerAddress()
      const results:Bet[] = await networkService.getMyBets(add!)
      console.log(results)
      return results

    }
  }


function fetchJoinedBets() {
  const data = localStorage.getItem("joinedbets");
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Invalid JSON in joinedbets:", e);
    return [];
  }
}
function saveJoinedBets(betsArray:string[]) {
  localStorage.setItem("joinedbets", JSON.stringify(betsArray));
}

// Add a bet address (avoid duplicates)
function addJoinedBet(address:string) {
  const bets = fetchJoinedBets();
  if (!bets.includes(address)) {
    bets.push(address);
    saveJoinedBets(bets);
  }
}
  async function getJoinedBets(){
    const localbets = fetchJoinedBets()
    if(networkService.getSignerAddress() == null){
      setOption(0)
    }
    else{
      const results = await networkService.getJointedBets(localbets)
      console.log(results)
      return results
    }
  }




  return (
    <>
        <Navbar option={option} setOption={setOption} connectwallet={async ()=>{
          console.log("click")
          if(networkService.getSignerAddress() == null){
            setLoading(true)
            await networkService.connectWallet()
            console.log(networkService.getSignerAddress())
            setLoading(false)
            return networkService.getSignerAddress() 
          }
          return networkService.getSignerAddress()
        }} ></Navbar>
        <ClipLoader
        color="#D88A25"
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
        {option == 2 ? 
        <div>
          {/* create bet */}
          <div>
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
  <div className="w-96 space-y-3">
    <input 
      type="text" 
      placeholder="Title" 
      className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
    
    <input 
      type="text" 
      placeholder="Options (comma separated)" 
      className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
      value={options}
      onChange={(e) => setOptions(e.target.value)}

    />

  </div>
  <button className=' bg-amber-200 px-8 py-4 cursor-pointer' onClick={async ()=>{
    const optionArray = options.split(",")
    console.log(optionArray)
    setLoading(true)
    await networkService.deployPrediction(title,optionArray)
    setLoading(false)
    setOption(1)
  }}>Create Bet</button>

</div>
</div>


        </div>
        
        
        : option == 1 ? 
        // my bets
        <div>

          {/* created bets */}
          <div className=' font-bold text-2xl ml-8 mt-4 '>Your bets</div>
          <div className='flex w-full justify-center'>
<div className="grid grid-cols-2 gap-5 py-5 px-2 w-3/5">
  {mybets && mybets.map((prediction) => (
    <div key={prediction.address}>
      <PredictionCard prediction={prediction} refresh={refresh} />
    </div>
  ))}
</div>
</div>

           {/* joined bets */}
           <div className="font-bold text-2xl ml-8 mt-4">Joined bets</div>
<div className='flex w-full justify-center'>
<div className="grid grid-cols-2 gap-5 py-5 px-2 w-3/5">
  {joinedBets && joinedBets.map((prediction) => (
    <div key={prediction.address}>
      <PredictionCard2 prediction={prediction} refresh={refresh} />
    </div>
  ))}
</div>
</div>




        </div> 
        
        
        
        : 
        
        // JOIN A NEW BET
        <div className='min-h-screen flex items-center justify-center flex-col gap-4'>
              <input 
      type="text" 
      placeholder="ENTER BET ADDRESS" 
      className=" p-3 border border-gray-300 focus:outline-none focus:border-black"
      value={betAddress}
      onChange={(e) => setBetAddress(e.target.value)}
    />
      <button className=' bg-amber-200 px-8 py-4 cursor-pointer' onClick={async ()=>{
      addJoinedBet(betAddress)
    setOption(1)
    }}>JOIN BET</button>
          
          </div>}
    </>
  )
}

export default App
