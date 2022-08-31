import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { ReactElement, useCallback, useRef, useState } from "react";

export default function Editor(props: {
  initialQuery?: string;
  children: (text: string, isError: boolean) => ReactElement;
}) {
  const editoRef = useRef<JSONEditor | null>(null);
  const [isError, setIsError] = useState(false);
  const [text, setText] = useState(props.initialQuery || "");

  const divRef = useCallback((div: HTMLDivElement | null) => {
    if (!div) return;
    if (editoRef.current) return;
    editoRef.current = new JSONEditor(div, {
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

    editoRef.current.setText(props.initialQuery || "");
  }, []);

  return (
    <>
      <div ref={divRef} className="mt-4 w-full" style={{ margin: "1rem" }} />
      {props.children(text, isError)}
    </>
  );
}
