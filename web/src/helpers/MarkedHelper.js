import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

const mathExtension = {
  name: "math",
  level: "inline", 
  start(src) {
    return src.match(/\$+/)?.index;
  },
  tokenizer(src) {
   
    const blockMatch = src.match(/^\$\$([\s\S]+?)\$\$/);
    if (blockMatch) {
      return {
        type: "math",
        raw: blockMatch[0],
        text: blockMatch[1].trim(),
        block: true,
      };
    }

   
    const inlineMatch = src.match(/^\$([^\$]+?)\$/);
    if (inlineMatch) {
      return {
        type: "math",
        raw: inlineMatch[0],
        text: inlineMatch[1].trim(),
        block: false,
      };
    }

    return false;
  },
  renderer(token) {
    try {
      return katex.renderToString(token.text, {
        throwOnError: false,
        displayMode: token.block,
      });
    } catch (err) {
      return `<span class="katex-error">${token.text}</span>`;
    }
  },
};


marked.use({ extensions: [mathExtension] });

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: (code, lang) => hljs.highlightAuto(code, [lang]).value,
});

export default marked;
