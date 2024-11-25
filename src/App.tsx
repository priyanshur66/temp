import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { useWallet , InputTransactionData } from "@aptos-labs/wallet-adapter-react";

import { AptosClient,Network } from "aptos";
import {Aptos , AptosConfig , AccountAddress} from "@aptos-labs/ts-sdk"

const moduleAddress = ""
const moduleName = "RockPaperScissor_01"

const client = new Aptos(new AptosConfig({
  network:Network.TESTNET
}))




const GameWrapper1 = ()=>{
  return (
    <div className="h-screen flex justify-center align-middle">
      <h1 className="my-auto text-3xl font-semibold">Please connect your wallet to continue</h1>
    </div>
  )
}

const GameWrapper2 = ()=>{
  return (
    <div className="h-screen flex justify-center align-middle">
      <div className="my-auto w-4/6">
        <div className="flex justify-center">
          <button className="bg-green-500 text-white px-6 py-2 hover:bg-green-400 rounded-xl shadow-md my-4">Start Game</button>
        </div>
        <div className="flex justify-center gap-2">
          <div className="w-1/2 px-4">
            <div className="bg-white px-6 py-2 rounded-xl shadow-md my-4">
              <div>
                <div className="bg-gray-300 px-6 py-4 text-xl rounded-xl my-4 text-center font-semibold">Select Your Move</div>
              </div>
              <div className="flex justify-between">
                <button className="bg-red-400 text-2xl px-8 py-4 hover:bg-red-300 rounded-xl shadow-md my-4">Clear</button>
                <button className="bg-orange-400 text-white text-2xl px-8 py-4 hover:bg-orange-300 rounded-xl shadow-md my-4">Rock</button>
                <button className="bg-orange-400 text-white text-2xl px-8 py-4 hover:bg-orange-300 rounded-xl shadow-md my-4">Paper</button>
                <button className="bg-orange-400 text-white text-2xl px-8 py-4 hover:bg-orange-300 rounded-xl shadow-md my-4">Scissors</button>
              </div>
            </div>
          </div>
          <div className="w-1/2 px-4">
          <div className="bg-white px-6 py-2 rounded-xl shadow-md my-4">
              <div>
                <div className="bg-gray-300 px-6 py-4 text-xl rounded-xl my-4 text-center font-semibold">Select Your Move</div>
              </div>
              <div className="flex justify-between">
                <button className="bg-orange-400 text-white text-2xl px-12 py-4 hover:bg-orange-300 rounded-xl shadow-md my-4">Rock</button>
                <button className="bg-orange-400 text-white text-2xl px-12 py-4 hover:bg-orange-300 rounded-xl shadow-md my-4">Paper</button>
                <button className="bg-orange-400 text-white text-2xl px-12 py-4 hover:bg-orange-300 rounded-xl shadow-md my-4">Scissors</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="bg-green-600 text-2xl font-semibold px-44 py-4 rounded-xl shadow-md my-4">Game Result</div>
        </div>
      </div>
    </div>
  )
}


function App() {
  const {account, connected ,signAndSubmitTransaction} = useWallet();

  const handleTransaction = async (
    payload:InputTransactionData
  )=>{
    if (!account) return

    try {

      const res = await signAndSubmitTransaction(payload)
      console.log(res)


      const resultData = await client.getAccountResource({
        accountAddress:account?.address,
        resourceType:`${moduleAddress}::${moduleName}::DuelResult`
      })

      const gameResult = resultData.duel_result.toString()

      if(gameResult==="Win"){
        console.log("hey you won this match")
      }else if (gameResult === "Lose"){
        console.log("Hey you lost this match")
      }



    } catch (error) {
      console.log("error while signing transaction",error)
    }finally{
      console.log("handle transaction called")
    }
  }

  const handleMoveSelection = async (move:string)=>{

    if(move==="Clear"){
      return
    }

    const payload:InputTransactionData={
      data:{
        function:`${moduleAddress}::${moduleName}::duel`,
        functionArguments:[move]
      }
    }
   const res = await handleTransaction(payload)
   console.log("handle move selection result",res)
  }

  const toggleGameState = async()=>{
    if(!account)return
    const payload : InputTransactionData = {
      data:{
        function: `${moduleAddress}::${moduleName}::createGame`,
        functionArguments:[],
      }
    }

    const res = await handleTransaction(payload);
    console.log("result for creating new game",res)
  }

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center align-middle bg-neutral-100">
        <div className="absolute right-4 top-4 items-end">
            <WalletSelector />
        </div>
        {connected ? GameWrapper2() : GameWrapper1()}
      </div>
    </>
  )
}

export default App
