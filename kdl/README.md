# KDL REPL

A mobile-friendly, interactive KDL (KDL Document Language) REPL built with vanilla JavaScript.

## Features

- **Live Parsing**: Real-time KDL parsing as you type
- **Interactive AST Viewer**: Collapsible tree view of the document structure
- **JSON Representation**: View the parsed document as JSON
- **Mobile-Friendly**: Responsive design with dropdown selector for mobile devices
- **No Build Step**: Pure HTML/CSS/JS - just open `index.html` in a browser

## Usage

Simply open `index.html` in a web browser. The REPL includes:

1. **Input Area**: Enter your KDL document
2. **View Selector**: Choose between Interactive AST or JSON representation
3. **Output Area**: See the parsed result

## Technology

- Uses [@bgotink/kdl](https://github.com/bgotink/kdl) library via CDN
- No framework dependencies
- Works in any modern browser

## Example

The REPL comes pre-loaded with an example KDL document showing common patterns like nested nodes, properties, and arguments.
