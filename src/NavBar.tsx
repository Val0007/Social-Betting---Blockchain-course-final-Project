import { useState } from "react";

interface NavBarComponent{
    option:Number
    setOption:(option:Number)=>void
    connectwallet: ()=>Promise<string|undefined|null>
}

export default function Navbar({option,setOption,connectwallet}:NavBarComponent) {

  const options = ['Join Bet', 'My Bets', 'Create Bet'];
  const [buttonString,setButtonString] = useState("Connect Wallet")

  return (
    <nav className="w-full bg-white border-b border-gray-200 grid grid-cols-2 gap-0">
      <div className="flex justify-center gap-8 py-4 justify-self-start px-2 h-full ">
        {options.map((label, idx) => (
          <button
            key={idx}
            onClick={() => setOption(idx)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              option === idx
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="justify-self-end flex justify-center bg-amber-300 h-full cursor-pointer">
        <button onClick={async ()=>{
            const result = await connectwallet()
            setButtonString(result || "ERROR")
        }}>{buttonString}</button>
      </div>
    </nav>
  );
}