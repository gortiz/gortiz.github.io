// Turns GitHub-style alerts into callouts:
//   > [!NOTE]          or  > [!WARNING]
//   > Text of the note.
// The blockquote gets the classes "callout callout-note" (or "callout-warning"), and the marker is removed.
const KINDS = new Set(['note', 'warning']);

function visit(node, fn) {
  fn(node);
  for (const child of node.children ?? []) visit(child, fn);
}

export default function rehypeCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'blockquote') return;
      const para = node.children.find((c) => c.type === 'element');
      const text = para?.tagName === 'p' ? para.children[0] : undefined;
      const match = text?.type === 'text' && /^\s*\[!(\w+)\]\s*/.exec(text.value);
      if (!match || !KINDS.has(match[1].toLowerCase())) return;
      text.value = text.value.slice(match[0].length);
      node.properties.className = ['callout', `callout-${match[1].toLowerCase()}`];
    });
  };
}
