export function treeToFiles(nodes) {
    const files = {};
  
    function walk(nodeList, basePath = "") {
      nodeList.forEach((node) => {
        const fullPath = basePath + node.name;
  
        if (node.type === "file") {
          files[fullPath] = {
            file: {
              contents: node.content || "",
            },
          };
        }
  
        if (node.type === "folder") {
          walk(node.children || [], fullPath + "/");
        }
      });
    }
  
    walk(nodes);
    return files;
  }
  