// translate vDom to real DOM 
// _ prefix = virtual / without _ = concrete

// the parameter is a virtual Node
const renderElem = ({ tag, attributes, children }) => {

    // create the element
    const el = document.createElement(tag);

    // add all attributes 
    Object.entries(attributes).forEach(([key, val]) => el.setAttribute(key, val));

    // render and append all children recursively
    // we call render and not renderElem because a child could be a text/comment node
    children.forEach(child => el.appendChild(render(child)));

    return el;
};

const renderText = _Node => document.createTextNode(_Node.textContent);
const renderComment = _Node => document.createComment(_Node.textContent)


const render = _Node => {
    const { tag } = _Node;

    if (tag === "Text") {
        return renderText(_Node);
    } else if (tag === "Comment") {
        return renderComment(_Node);
    } else {
        // assuming that others tags are valid HTML tags
        return renderElem(_Node);
    }
}

export default render;
