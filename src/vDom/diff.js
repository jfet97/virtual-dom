import render from './render';

/*
function diff(oldVirtualTree, newVirtualTree) which calculate the differences between
two virtual trees, created by the 'h' function;
return a patch function that takes in the real DOM of oldVTree
and perform appropriate operations to the real DOM to make the real DOM looks like the newVTree.
*/

const diff = (oldVirtualTree, newVirtualTree) => {

    // BASE CASES ------------------------------------------------------------------------------------------------------------------------------

    // 1) newVirtualTree null or undefined
    if (newVirtualTree == undefined) {
        return function patch(node) {
            // since there is no corresponding newVirtualTree
            // we'll remove the node
            node.remove();

            // the patch should return the new root node.
            // since there is none in this case,
            // we will just return undefined.
            return undefined;
        }
    }

    // 2) either oldVirtualTree or newVirtualTree is VirtualTextNode or VirtualCommentNode
    if ((oldVirtualTree.tag == 'Text' || oldVirtualTree.tag == 'Comment') || (newVirtualTree.tag == 'Text' || newVirtualTree.tag == 'Comment')) {

        // are both VirtualTextNodes or both VirtualCommentNodes?
        if (oldVirtualTree.tag == newVirtualTree.tag) {

            // have they the same textContent?
            if (oldVirtualTree.textContent == newVirtualTree.textContent) {
                // same tag and same textContent == do nothing
                return function patch(node) {
                    return node;
                }
            } else {
                // same tag but different textContent == replace
                return function patch(node) {
                    const newNode = render(newVirtualTree);
                    node.replaceWith(newNode);
                    return newNode;
                }
            }

        } else {
            // different tag (Text vs Comment || Comment vs Text || Text vs Element || Comment vs Element || Element vs Text || Element vs Comment )
            //  == replace
            return function patch(node) {
                const newNode = render(newVirtualTree);
                node.replaceWith(newNode);
                return newNode;
            }
        }
    }

    // 3) different tags
    if (oldVirtualTree.tag != newVirtualTree.tag) {
        // we assume that they are totally different and 
        // will not attempt to find the differences.
        // simply render the newVTree and mount it.

        // replace
        return function patch(node) {
            const newNode = render(newVirtualTree);
            node.replaceWith(newNode);
            return newNode;
        }
    }

    // END OF BASE CASES ---------------------------------------------------------------------------------------------------------------------------

    /*
    If the code reaches here, it implies the following:
    
    1) oldVirtualTree and newVirtualTree are both virtual elements (neither is a Text/Comment virtual node).
    2) They have the same tag
    3) They might have different attributes and children
    
    We will implement two functions to deal with the attributes and children separately,
    namely diffAttributes (oldAttributes, newAttributes) and diffChildren (oldVirtualChildren, newVirtualChildren),
    which will return a patch function separately.
    At this point we are not going to replace a node node,
    we can safely return the node node after applying both patches
    */

    const patchAttributes = diffAttributes(oldVirtualTree.attributes, newVirtualTree.attributes);
    const patchChildren = diffChildren(oldVirtualTree.children, newVirtualTree.children);

    return function patch(node) {
        // both patch functions return the just patched node
        return patchChildren(patchAttributes(node));
    }
}

// it creates an array of patches: a patch for each attribute
const diffAttributes = (oldAttributes, newAttributes) => {
    // patches store
    const attributesPatches = [];

    // patches to remove old attributes
    Object.keys(oldAttributes).forEach(oldAttribute => {
        attributesPatches.push(function singleAttributePatch(node) {
            node.removeAttribute(oldAttribute);
            return node;
        })
    });

    // patches to insert new attributes
    Object.entries(newAttributes).forEach(([newAttribute, value]) => {
        attributesPatches.push(function singleAttributePatch(node) {
            node.setAttribute(newAttribute, value);
            return node;
        })
    });

    return function patchAttributes(node) {
        const allPatches = attributesPatches.reduce((f, g) => node => g(f(node))); // piping patches
        allPatches(node);
        return node;
    }
}

// it creates an array of patches: a patch for each attribute
const diffChildren = (oldVirtualChildren, newVirtualChildren) => {
    // patches store
    const childrenPatches = [];

    // analize each oldVirtualChild and the corresponding newVirtualChild
    // thanks to the diff() function to create a patch for each child

    // if there are less newVirtualChildren than oldVirtualChildren
    // diff() function will create a 'removing patch' for the extra items
    oldVirtualChildren.forEach((oldVirtualChild, i) => {
        childrenPatches.push(diff(oldVirtualChild, newVirtualChildren[i]));
    });

    // if there were more oldVirtualChildren than newVirtualChildren...
    const additionalChildrenPatches = [];
    // get additional new virtual nodes
    const additionalNewVirtualChildren = newVirtualChildren.slice(oldVirtualChildren.length);

    additionalNewVirtualChildren.forEach(additionalNewVirtualChild => {
        // for each of them produces a function that will add each new but rendered child node
        additionalChildrenPatches.push(function addNewChildNode(node) {
            node.appendChild(render(additionalNewVirtualChild));
            return node;
        })
    });

    return function patchChildren(node) {

        // patch each already present child node using childrenPatches functions
        childrenPatches.forEach((childrenPatch, i) => {
            childrenPatch(node.childNodes[i]);
        })

        // insert eventually present new children
        additionalChildrenPatches.forEach(additionalChildrenPatch => {
            additionalChildrenPatch(node);
        })

        return node;
    }
}

export default diff;