import { Mark, mergeAttributes, Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    link: {
      setLink: (attributes: { href: string; target?: string; rel?: string }) => ReturnType;
      unsetLink: () => ReturnType;
    };
    image: {
      setImage: (attributes: { src: string; alt?: string; title?: string }) => ReturnType;
    };
  }
}

const Link = Mark.create({
  name: "link",
  priority: 1000,
  inclusive: false,

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: "_blank",
      },
      rel: {
        default: "noreferrer",
      },
    };
  },

  parseHTML() {
    return [{ tag: "a[href]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["a", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setLink:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      unsetLink:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

const Image = Node.create({
  name: "image",
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: "",
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },
});

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Link,
  Image,
];
