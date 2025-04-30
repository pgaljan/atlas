import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");

class CustomImageBlot extends BlockEmbed {
  static blotName = "image";
  static tagName = "img";

  static create(value) {
    const node = super.create();

    const url = typeof value === "string" ? value : value.url;
    node.setAttribute("src", url);

    if (value.style) {
      node.setAttribute("style", value.style);
    }

    if (value.width) node.setAttribute("width", value.width);
    if (value.height) node.setAttribute("height", value.height);

    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
      style: node.getAttribute("style"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    };
  }
}

Quill.register("formats/image", CustomImageBlot);
