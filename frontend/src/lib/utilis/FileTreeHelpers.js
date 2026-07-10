export function insertNode(tree, parentId, newNode) {
  if (!parentId) return [...tree, newNode];

  return tree.map((node) => {
    if (node.id === parentId && node.type === "folder") {
      return {
        ...node,
        children: [...node.children, newNode],
      };
    }

    if (node.children) {
      return {
        ...node,
        children: insertNode(node.children, parentId, newNode),
      };
    }

    return node;
  });
}

export function updateNodeContent(tree, fileId, content) {
  return tree.map((node) => {
    if (node.id === fileId) {
      return { ...node, content };
    }

    if (node.children) {
      return {
        ...node,
        children: updateNodeContent(node.children, fileId, content),
      };
    }

    return node;
  });
}

export function findFileByName(tree, filename) {
  for (let node of tree) {
    if (node.type === "file" && node.name === filename) return node;

    if (node.children) {
      const found = findFileByName(node.children, filename);
      if (found) return found;
    }
  }
  return null;
}
