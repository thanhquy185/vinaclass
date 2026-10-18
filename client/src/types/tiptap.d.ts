import "@tiptap/react";
import "@tiptap/react";
// import { StarterKit } from "@tiptap/starter-kit";

declare module "@tiptap/react" {
  interface ChainedCommands {
    toggleBold: () => ReturnType<ChainedCommands["command"]>;
    toggleItalic: () => ReturnType<ChainedCommands["command"]>;
    toggleBulletList: () => ReturnType<ChainedCommands["command"]>;
    toggleOrderedList: () => ReturnType<ChainedCommands["command"]>;
    toggleBlockquote: () => ReturnType<ChainedCommands["command"]>;
  }
}
