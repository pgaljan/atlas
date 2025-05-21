import React, {
  useRef,
  useMemo,
  useEffect,
} from "react";
import mermaid from "mermaid";
import debounce from "lodash.debounce";

mermaid.initialize({ startOnLoad: false });

let idCounter = 0;
const generateUniqueId = () => `mermaid-react-${idCounter++}`;

function Mermaid({ code, onSvgChange }) {
  const containerRef = useRef(null);
  const id = useMemo(() => generateUniqueId(), []);

  const debouncedRender = useRef(
    debounce((code) => {
      if (!code || !code.trim()) {
        containerRef.current.innerHTML = `<pre class="font-normal text-gray-500" >Please enter Mermaid code.</pre>`;
        if (onSvgChange) onSvgChange(null);
        return;
      }
      mermaid
        .render(id, code)
        .then(({ svg }) => {
          if (containerRef.current) containerRef.current.innerHTML = svg;
          if (onSvgChange) onSvgChange(svg);
        })
        .catch((err) => {
          console.error("Mermaid render error:", err);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre style="color: red; white-space: pre-wrap;">Oops! Invalid Mermaid code.</pre>`;
          }
          if (onSvgChange) onSvgChange(null);
        });
    }, 800)
  ).current;

  useEffect(() => {
    debouncedRender(code);
    return () => debouncedRender.cancel();
  }, [code, debouncedRender]);

  return <div ref={containerRef} />;
}

export default Mermaid;
