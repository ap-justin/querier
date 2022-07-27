import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { useEffect, useRef, useState } from "react";

const mainnetUrl = "https://lcd-juno.itastakers.com";
const testnetUrl = "https://lcd.uni.juno.deuslabs.fi";

type Query = {
  address: string;
  msg: string;
};

type Queries = {
  queries: Query[];
};

const Key = "__queries";
const queries = JSON.parse(localStorage.getItem(Key) || "{}") as Queries;

export default function App() {
  const [contract, setContract] = useState("");
  const [text, setText] = useState("");
  const [isError, setIsError] = useState(false);
  const [result, setResult] = useState<object>({});

  const divRef = useRef<HTMLDivElement | null>(null);
  const editoRef = useRef<JSONEditor | null>(null);

  useEffect(() => {
    if (editoRef.current) return;
    editoRef.current = new JSONEditor(divRef.current as HTMLElement, {
      onValidationError(errors) {
        setIsError(errors.length > 0);
      },
      mode: "code",
      statusBar: false,
      mainMenuBar: false,
      onChangeText(json) {
        setText(json);
      },
    });
  }, []);

  async function query(isTest?: true) {
    const msg = window.btoa(JSON.stringify(JSON.parse(text)));
    setResult({});
    const data = await fetch(
      `${
        isTest ? testnetUrl : mainnetUrl
      }/cosmwasm/wasm/v1/contract/${contract}/smart/${msg}`
    ).then((x) => x.json());
    setResult(data);
  }

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
      <div ref={divRef} className="mt-4" style={{ margin: "1rem" }} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => query()}
          className="bg-sky-400 px-4 py-2 text-sm uppercase"
          disabled={isError}
        >
          query mainnet
        </button>
        <button
          type="button"
          onClick={() => query(true)}
          className="bg-sky-400 px-4 py-2 text-sm uppercase"
          disabled={isError}
        >
          query testnet
        </button>
      </div>
      <code className="overflow-x-auto whitespace-pre font-mono">
        {JSON.stringify(result, null, 2)}
      </code>
    </div>
  );
}
