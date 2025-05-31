/**
 * The object tree node contains information about meshes and their visibility in the 3D scene.
 */
export type ObjectTreeNode = {
  name: string;
  type: string;
  hasChildren: boolean;
  children: ObjectTreeNode[];
  visible: boolean;
};

/**
 * Represents the structure of a Virtual Display object tree, which includes a root node and its variants.
 */
export type ObjectTree = {
  tree: ObjectTreeNode;
  variants: string[];
};

/**
 * Request context for fetching the object tree.
 * It includes the origin, where the server will send the response to for enhanced security.
 */
export type ObjectTreeRequestContext = {
  origin: string | null;
};

/**
 * Response context for the object tree, which contains the root node of the object tree.
 */
export type ObjectTreeResponseContext = {
  objectTree: ObjectTreeNode;
};
