interface Node {
  offsite?: boolean
  contentPath?: string
  urlPath?: string
  childNodes?: Node[]
  [key: string]: unknown
}

const expandPaths = (node: Node, parentNode: Node | null): Node => {
  // if this node is offsite, nothing to do
  if (node.offsite) return node

  // expand paths in this node
  if (parentNode) {
    node.contentPath = parentNode.contentPath + '/' + node.contentPath
    node.urlPath = parentNode.urlPath + '/' + node.urlPath
  }

  // recurse over children
  if (node.childNodes) {
    node.childNodes = node.childNodes.map(child => expandPaths(child, node))
  }

  // done
  return node
}

export const siteStructureWithFullPaths = (structure: Node[]): Node[] => {
  const result = JSON.parse(JSON.stringify(structure)) as Node[]
  result.map((node: Node) => expandPaths(node, null))
  return result
}
