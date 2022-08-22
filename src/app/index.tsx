import "jsoneditor/dist/jsoneditor.min.css";
import { useEffect, useState } from "react";
import Editor from "./Editor";

const mainnetUrl = "https://lcd-juno.itastakers.com";
const testnetUrl = "https://lcd.uni.juno.deuslabs.fi";

type Network = "testnet" | "mainnet";
type EncodedQuery = {
  network: Network;
  msg: string;
  contract: string;
};

let encodedQuery: EncodedQuery;
let queryString: string = "";
const paths = window.location.pathname.split("/");
const queryPath = paths[paths.length - 1];
try {
  encodedQuery = JSON.parse(window.atob(queryPath));
  queryString = window.atob(encodedQuery.msg);
} catch (err) {
  encodedQuery = { network: "testnet", msg: "", contract: "" };
}

export default function App() {
  const [contract, setContract] = useState(encodedQuery.contract);
  const [network, setNetwork] = useState<Network>(encodedQuery.network);
  const [result, setResult] = useState<object>({});
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //view shared query
  useEffect(() => {
    (async () => {
      try {
        await query("", network, encodedQuery.msg);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  async function query(text: string, _network: Network, presetMsg?: string) {
    setIsLoading(true);
    try {
      const msg = presetMsg || window.btoa(JSON.stringify(JSON.parse(text)));
      setResult({});
      setNetwork(_network); //set network state for query copying
      setMsg(msg); //set query text for copying
      const data = await fetch(
        `${
          _network === "testnet" ? testnetUrl : mainnetUrl
        }/cosmwasm/wasm/v1/contract/${contract}/smart/${msg}`
      ).then((x) => x.json());
      setResult(data);
    } catch (err) {
      setResult({});
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function copyQuery() {
    const encodedQuery: EncodedQuery = {
      contract,
      msg,
      network,
    };
    await navigator.clipboard.writeText(
      `${window.location.origin}/querier/${window.btoa(
        JSON.stringify(encodedQuery)
      )}`
    );
    alert("query copied to clipboard");
  }

  const isThereResult = Object.entries(result).length > 0;

  return (
    <div className="grid w-full max-w-lg content-start justify-self-center">
      <label>contract address</label>
      <input
        value={contract}
        onChange={(e) => setContract(e.target.value)}
        type="text"
        className="mt-2 border border-zinc-50/10 bg-transparent p-2 font-mono focus:outline-none"
      />
      <label className="mt-8">query</label>
      <Editor initialQuery={queryString}>
        {(text, isError) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => query(text, "mainnet")}
              className="bg-sky-400 px-4 py-2 text-sm uppercase disabled:bg-gray-300"
              disabled={isError || isLoading}
            >
              query mainnet
            </button>
            <button
              type="button"
              onClick={() => query(text, "testnet")}
              className="bg-sky-400 px-4 py-2 text-sm uppercase disabled:bg-gray-300"
              disabled={isError || isLoading}
            >
              {isLoading ? "loading.." : "Query testnet"}
            </button>
          </div>
        )}
      </Editor>

      <code className="overflow-x-auto whitespace-pre font-mono">
        {JSON.stringify(result, null, 2)}
      </code>

      {isThereResult && (
        <button
          onClick={copyQuery}
          className="mt-4 rounded-md rounded-sm bg-emerald-500 px-4 py-2 text-sm uppercase hover:bg-emerald-400 active:bg-emerald-600"
        >
          copy query
        </button>
      )}
    </div>
  );
}
