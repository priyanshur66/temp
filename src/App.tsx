import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import { AptosClient, Network } from "aptos";
import { Aptos, AptosConfig, AccountAddress } from "@aptos-labs/ts-sdk";
import { useState } from "react"; // to store the value of the input field

const moduleAddress = "0x610ea90387f24c61fa507060dfb272a901ef420411473ab344cc45d72904e3bb";
const moduleName = "RockPaperScissors_01";

const client = new Aptos(
  new AptosConfig({
    network: Network.TESTNET,
  })
);

const GameWrapper1 = () => {
  return (
    <div className="h-screen flex justify-center align-middle">
      <h1 className="my-auto text-3xl font-semibold">
        Please connect your wallet to continue
      </h1>
    </div>
  );
};

// nw stuff hr
const GameWrapper2 = ({
  gameState,
  onToggleGame,
  onMoveSelection,
  result,
  computerSelection,
  transactionInProgress,
}: {
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
        <div className="flex justify-center">
          {/* // button updated */}
          <button
            className="bg-green-500 mx-auto px-6 py-2 rounded-xl text-white my-2"
            onClick={onToggleGame}
          >
            {!gameState ? "Start Game" : "Stop Game"}
          </button>
        </div>
        <div className="flex justify-center gap-2">
          <div className="w-1/2 px-4">
            <div className="bg-white px-6 py-2 rounded-xl shadow-md my-4">
              <div>
                <div className="bg-gray-300 px-6 py-4 text-xl rounded-xl my-4 text-center font-semibold">
                  Select Your Move
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                  onClick={() => onMoveSelection("Clear")}
                >
                  Clear
                </button>
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
          <div className="w-1/2 px-4">
            <div className="bg-white px-6 py-2 rounded-xl shadow-md my-4">
              <div>
                <div className="bg-gray-300 px-6 py-4 text-xl rounded-xl my-4 text-center font-semibold">
                  Computer move
                </div>
              </div>
              <div className="flex justify-between">
                {["Rock", "Paper", "Scissors"].map((move) => (
                  <button
                    key={move}
                    className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                    onClick={() => onMoveSelection(move)}
                    disabled={transactionInProgress || !gameState}
                  >
                    {move === computerSelection ? move : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
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
  // new state to store the value of the input field
  const [gameState, setGameState] = useState(false);
  const [result, setResult] = useState("");
  const [computerSelection, setComputerSelection] = useState("");
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const handleTransaction = async (payload: InputTransactionData) => {
    if (!account) return;
    setTransactionInProgress(true);

    try {
      const res = await signAndSubmitTransaction(payload);
      console.log(res);

      const resultData = await client.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::${moduleName}::DuelResult`,
      });

      const gameResult = resultData.duel_result.toString();

      if (gameResult === "Win") {
        setResult("You won!");
      } else if (gameResult === "Lose") {
        setResult("You lost!");
      } else {
        setResult(gameResult);
      }
      setComputerSelection(resultData.computer_selection.toString());
    } catch (error) {
      console.log("error while signing transaction", error);
    } finally {
      setTransactionInProgress(false);

      console.log("handle transaction called");
    }
  };

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
    setResult("");
    setComputerSelection("");
    console.log("result for creating new game", res);
  };

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center align-middle bg-neutral-100">
        <div className="absolute right-4 top-4 items-end">
          <WalletSelector />
        </div>
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
