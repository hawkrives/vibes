/**
 * Utility functions for KDL REPL
 */

/**
 * Format a value for display in the AST view
 */
export function formatValue(value) {
    if (value === null || value === undefined) {
        return 'null';
    }

    if (typeof value === 'string') {
        return `"${escapeHtml(value)}"`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return escapeHtml(String(value));
    }

    return escapeHtml(JSON.stringify(value));
}

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Convert a KDL document to plain JSON
 */
export function documentToJSON(doc) {
    if (!doc || !doc.nodes) {
        return { nodes: [] };
    }

    return {
        nodes: doc.nodes.map(nodeToJSON)
    };
}

/**
 * Convert a KDL node to plain JSON
 */
export function nodeToJSON(node) {
    const result = {
        name: node.name
    };

    if (node.entries && node.entries.length > 0) {
        const args = [];
        const props = {};

        node.entries.forEach(entry => {
            if (entry.name) {
                props[entry.name] = entry.value;
            } else {
                args.push(entry.value);
            }
        });

        if (args.length > 0) {
            result.arguments = args;
        }
        if (Object.keys(props).length > 0) {
            result.properties = props;
        }
    }

    if (node.children && node.children.nodes && node.children.nodes.length > 0) {
        result.children = node.children.nodes.map(nodeToJSON);
    }

    return result;
}
