import Quill from "quill";
const BlockEmbed = Quill.import("blots/block/embed");

class CustomVideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = "video";

  static create(value) {
    const node = super.create();
    node.setAttribute("controls", true);
    node.setAttribute("src", value);
    node.classList.add("custom-video");
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

Quill.register(CustomVideoBlot, true);
export default CustomVideoBlot;
