interface TreeNode {
  name?: string
  urlPath?: string
  offsite?: boolean
  childNodes?: TreeNode[]
  parentNodeName?: string
  [key: string]: unknown
}

export const expandTree = (structure: TreeNode[], parentNode?: TreeNode): TreeNode[] => {
  return structure.reduce((acc: TreeNode[], node) => {
    const updatedNode = { ...node }

    if (parentNode) {
      updatedNode.parentNodeName = parentNode.name
      if (!node.offsite) {
        updatedNode.urlPath = `${parentNode.urlPath}/${node.urlPath}`
      }
    }

    if (node.childNodes) {
      acc.push(...expandTree(node.childNodes, updatedNode))
    }

    return [...acc, { ...updatedNode, childNodes: undefined }]
  }, [])
}
