import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: (code, lang) => hljs.highlightAuto(code, [lang]).value,
});

export default marked;
