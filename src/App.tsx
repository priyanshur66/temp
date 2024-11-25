import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { AptosClient, Network } from "aptos";
import { Aptos, AptosConfig, AccountAddress } from "@aptos-labs/ts-sdk";
// Added useState hook to manage component state
import { useState } from "react";

// Contract details remain the same
const moduleAddress = "0x610ea90387f24c61fa507060dfb272a901ef420411473ab344cc45d72904e3bb";
const moduleName = "RockPaperScissors_01";

const client = new Aptos(
  new AptosConfig({
    network: Network.TESTNET,
  })
);

// GameWrapper1 remains mostly the same - shown when wallet is not connected
const GameWrapper1 = () => {
  return (
    <div className="h-screen flex justify-center align-middle">
      <h1 className="my-auto text-3xl font-semibold">
        Please connect your wallet to continue
      </h1>
    </div>
  );
};

// MAJOR CHANGE 1: GameWrapper2 now accepts props instead of being a standalone component
// This allows for better state management and interaction between parent and child
const GameWrapper2 = ({
  gameState,          // Tracks if game is active
  onToggleGame,       // Function to start/stop game
  onMoveSelection,    // Function to handle move selection
  result,             // Stores game result
  computerSelection,  // Stores computer's move
  transactionInProgress, // Tracks if blockchain transaction is ongoing
}: {
  // TypeScript props definition
  gameState: boolean;
  onToggleGame: () => void;
  onMoveSelection: (move: string) => void;
  result: string;
  computerSelection: string;
  transactionInProgress: boolean;
}) => {
  return (
    <div className="h-screen flex justify-center align-middle">
      <div className="my-auto w-4/6">
        {/* Updated button to show different text based on game state */}
        <div className="flex justify-center">
          <button
            className="bg-green-500 mx-auto px-6 py-2 rounded-xl text-white my-2"
            onClick={onToggleGame}
          >
            {!gameState ? "Start Game" : "Stop Game"}
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {/* Player's move selection section */}
          <div className="w-1/2 px-4">
            <div className="bg-white px-6 py-2 rounded-xl shadow-md my-4">
              <div>
                <div className="bg-gray-300 px-6 py-4 text-xl rounded-xl my-4 text-center font-semibold">
                  Select Your Move
                </div>
              </div>
              {/* CHANGE: Improved button layout and added disabled state */}
              <div className="flex justify-between">
                <button
                  className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                  onClick={() => onMoveSelection("Clear")}
                >
                  Clear
                </button>
                {/* IMPROVEMENT: Using map to render move buttons */}
                {["Rock", "Paper", "Scissors"].map((move) => (
                  <button
                    key={move}
                    className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                    onClick={() => onMoveSelection(move)}
                    disabled={transactionInProgress || !gameState}
                  >
                    {move}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Computer's move display section */}
          <div className="w-1/2 px-4">
            <div className="bg-white px-6 py-2 rounded-xl shadow-md my-4">
              <div>
                <div className="bg-gray-300 px-6 py-4 text-xl rounded-xl my-4 text-center font-semibold">
                  Computer move
                </div>
              </div>
              {/* IMPROVEMENT: Using map for consistency */}
              <div className="flex justify-between">
                {["Rock", "Paper", "Scissors"].map((move) => (
                  <button
                    key={move}
                    className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                    disabled={transactionInProgress || !gameState}
                  >
                    {move === computerSelection ? move : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result display */}
        <div className="flex justify-center">
          <div className="bg-green-500 w-3/5 mx-auto px-6 py-4 rounded-xl text-black font-semibold text-4xl text-center my-2">
            {result || "Game Result"}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  
  // MAJOR CHANGE 2: Added state management using useState
  const [gameState, setGameState] = useState(false);           // Tracks if game is active
  const [result, setResult] = useState("");                    // Stores game result
  const [computerSelection, setComputerSelection] = useState(""); // Stores computer's move
  const [transactionInProgress, setTransactionInProgress] = useState(false); // Tracks transaction status

  // IMPROVED: Added transaction progress tracking and better error handling
  const handleTransaction = async (payload: InputTransactionData) => {
    if (!account) return;
    setTransactionInProgress(true); // Show loading state

    try {
      const res = await signAndSubmitTransaction(payload);
      console.log(res);

      const resultData = await client.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::${moduleName}::DuelResult`,
      });

      // Process game result
      const gameResult = resultData.duel_result.toString();
      if (gameResult === "Win") {
        setResult("You won!");
      } else if (gameResult === "Lose") {
        setResult("You lost!");
      } else {
        setResult(gameResult);
      }
      
      // Store computer's move
      setComputerSelection(resultData.computer_selection.toString());
    } catch (error) {
      console.log("error while signing transaction", error);
    } finally {
      setTransactionInProgress(false); // Reset loading state
      console.log("handle transaction called");
    }
  };

  // IMPROVED: Added clear functionality and better error handling
  const handleMoveSelection = async (move: string) => {
    if (move === "Clear") {
      setComputerSelection("");
      setResult("");
      return;
    }

    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::duel`,
        functionArguments: [move],
      },
    };
    const res = await handleTransaction(payload);
    console.log("handle move selection result", res);
  };

  // IMPROVED: Added game state management and reset functionality
  const toggleGameState = async () => {
    if (!account) return;
    setGameState(!gameState);
    
    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::createGame`,
        functionArguments: [],
      },
    };

    const res = await handleTransaction(payload);
    setResult("");            // Reset result
    setComputerSelection(""); // Reset computer's move
    console.log("result for creating new game", res);
  };

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center align-middle bg-neutral-100">
        <div className="absolute right-4 top-4 items-end">
          <WalletSelector />
        </div>
        {/* IMPROVED: Proper props passing to GameWrapper2 */}
        {connected ? (
          <GameWrapper2
            gameState={gameState}
            onToggleGame={toggleGameState}
            onMoveSelection={handleMoveSelection}
            result={result}
            computerSelection={computerSelection}
            transactionInProgress={transactionInProgress}
          />
        ) : (
          GameWrapper1()
        )}
      </div>
    </>
  );
}

export default App;