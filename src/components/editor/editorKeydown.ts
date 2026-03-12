import { redo, undo } from "@tiptap/pm/history";
import type { EditorView } from "@tiptap/pm/view";
import { liftListItem, splitListItem } from "@tiptap/pm/schema-list";

function isInListItem(view: EditorView) {
  const { $from } = view.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "listItem") {
      return true;
    }
  }

  return false;
}

export function handleEditorKeyDown(view: EditorView, event: KeyboardEvent) {
  const isModKey = event.ctrlKey || event.metaKey;

  if (isModKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    return event.shiftKey ? redo(view.state, view.dispatch) : undo(view.state, view.dispatch);
  }

  if (isModKey && event.key.toLowerCase() === "y") {
    event.preventDefault();
    return redo(view.state, view.dispatch);
  }

  if (event.key !== "Enter" || event.shiftKey) {
    return false;
  }

  const listItemType = view.state.schema.nodes.listItem;
  if (!listItemType || !isInListItem(view)) {
    return false;
  }

  event.preventDefault();

  if (view.state.selection.$from.parent.textContent.trim().length === 0) {
    return liftListItem(listItemType)(view.state, view.dispatch);
  }

  return splitListItem(listItemType)(view.state, view.dispatch);
}
