// _ prefix == virtual element

// h
// allow creating elements without any options
export default (tag, { attributes = {}, children = [], textContent = "" }) => {

    // Text/Comment node check
    const isNotElementNode = tag === "Text" || tag === "Comment";

    if (isNotElementNode) {
        if (typeof textContent != "string")
            throw new Error("cannot initialize a Text/Comment node with a nn-string textContent")
    }

    // pure virtual DOM
    const _Element = Object.create(null);

    // optional props insertion
    return Object.assign(_Element, {
        tag,
        ...!isNotElementNode && { attributes },
        ...isNotElementNode && { textContent },
        ...!isNotElementNode && { children }
    });
};

/*

TEXT/COMMENT ELEMENT

const text = h('Text', {
    textContent: "prova"
})

*/

/*

HTML ELEMENT

const div = h('div', {
    attributes: {
        id: "app"
    },
    children: [
        h('img', {
            attributes: {
                src: 'data:image/jpeg;base64,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'
            }
        })
    ]
})
*/