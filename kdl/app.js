// Import KDL library
import { parse } from '@bgotink/kdl';
import { formatValue, escapeHtml, documentToJSON, nodeToJSON } from './utils.js';

// DOM elements
const kdlInput = document.getElementById('kdl-input');
const viewSelector = document.getElementById('view-selector');
const astView = document.getElementById('ast-view');
const jsonView = document.getElementById('json-view');
const astContent = document.getElementById('ast-content');
const jsonContent = document.getElementById('json-content');
const errorMessage = document.getElementById('error-message');

// State
let currentDocument = null;
let expandedNodes = new Set();

// Initialize with example KDL
const exampleKDL = `// Example KDL document
package "my-app" version="1.0.0" {
    author "Jane Doe" email="jane@example.com"

    dependencies {
        library "kdl" version="^0.6.0"
        library "express" version="^4.18.0"
    }

    scripts {
        start "node index.js"
        test "npm test"
    }
}

config {
    port 3000
    debug #true
}`;

kdlInput.value = exampleKDL;

// Parse and update views
function updateViews() {
    const input = kdlInput.value.trim();

    if (!input) {
        currentDocument = null;
        astContent.innerHTML = '<div class="ast-empty">Enter KDL to see the AST</div>';
        jsonContent.textContent = '';
        errorMessage.classList.add('hidden');
        return;
    }

    try {
        currentDocument = parse(input);
        errorMessage.classList.add('hidden');

        // Update AST view
        renderAST();

        // Update JSON view
        renderJSON();

    } catch (error) {
        currentDocument = null;
        errorMessage.textContent = `Parse Error: ${error.message}`;
        errorMessage.classList.remove('hidden');
        astContent.innerHTML = '<div class="ast-empty">Fix errors to see the AST</div>';
        jsonContent.textContent = '';
    }
}

// Render AST as interactive tree
function renderAST() {
    if (!currentDocument || !currentDocument.nodes || currentDocument.nodes.length === 0) {
        astContent.innerHTML = '<div class="ast-empty">No nodes in document</div>';
        return;
    }

    astContent.innerHTML = '';
    currentDocument.nodes.forEach(node => {
        astContent.appendChild(createNodeElement(node));
    });
}

// Create a DOM element for a node
function createNodeElement(node, path = []) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'ast-node';

    const nodePath = [...path, node.name];
    const nodeId = nodePath.join('.');
    const hasChildren = node.children && node.children.nodes && node.children.nodes.length > 0;
    const isExpanded = expandedNodes.has(nodeId);

    // Node header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'ast-node-header';

    // Toggle button for nodes with children
    if (hasChildren) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'ast-toggle';
        toggleBtn.textContent = isExpanded ? '▼' : '▶';
        toggleBtn.onclick = () => toggleNode(nodeId);
        headerDiv.appendChild(toggleBtn);
    } else {
        const spacer = document.createElement('span');
        spacer.className = 'ast-toggle no-children';
        headerDiv.appendChild(spacer);
    }

    // Node content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ast-node-content';

    let contentHTML = `<span class="ast-node-name">${escapeHtml(node.name)}</span>`;

    // Add entries (arguments and properties)
    if (node.entries && node.entries.length > 0) {
        const args = [];
        const props = [];

        node.entries.forEach(entry => {
            if (entry.name) {
                // Property
                props.push(`<span class="ast-node-property">${escapeHtml(entry.name)}</span>=<span class="ast-node-value">${formatValue(entry.value)}</span>`);
            } else {
                // Argument
                args.push(`<span class="ast-node-value">${formatValue(entry.value)}</span>`);
            }
        });

        if (args.length > 0) {
            contentHTML += ' ' + args.join(' ');
        }
        if (props.length > 0) {
            contentHTML += ' ' + props.join(' ');
        }
    }

    contentDiv.innerHTML = contentHTML;
    headerDiv.appendChild(contentDiv);
    nodeDiv.appendChild(headerDiv);

    // Children
    if (hasChildren) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'ast-node-children' + (isExpanded ? '' : ' collapsed');
        childrenDiv.id = `children-${nodeId}`;

        node.children.nodes.forEach(child => {
            childrenDiv.appendChild(createNodeElement(child, nodePath));
        });

        nodeDiv.appendChild(childrenDiv);
    }

    return nodeDiv;
}

// Toggle node expansion
function toggleNode(nodeId) {
    if (expandedNodes.has(nodeId)) {
        expandedNodes.delete(nodeId);
    } else {
        expandedNodes.add(nodeId);
    }
    renderAST();
}

// Render JSON representation
function renderJSON() {
    if (!currentDocument) {
        jsonContent.textContent = '';
        return;
    }

    // Convert document to plain object for JSON serialization
    const jsonData = documentToJSON(currentDocument);
    jsonContent.textContent = JSON.stringify(jsonData, null, 2);
}

// Handle view switching
function switchView() {
    const selectedView = viewSelector.value;

    if (selectedView === 'ast') {
        astView.classList.remove('hidden');
        jsonView.classList.add('hidden');
    } else {
        astView.classList.add('hidden');
        jsonView.classList.remove('hidden');
    }
}

// Event listeners
kdlInput.addEventListener('input', updateViews);
viewSelector.addEventListener('change', switchView);

// Initial render
updateViews();
