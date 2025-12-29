import { describe, it, expect } from 'vitest';
import { formatValue, escapeHtml, documentToJSON, nodeToJSON } from './utils.js';

describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        expect(escapeHtml('Hello & goodbye')).toBe('Hello &amp; goodbye');
        expect(escapeHtml('"quotes"')).toBe('"quotes"');
    });

    it('should handle empty strings', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('should handle normal text', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });
});

describe('formatValue', () => {
    it('should format null and undefined', () => {
        expect(formatValue(null)).toBe('null');
        expect(formatValue(undefined)).toBe('null');
    });

    it('should format strings with quotes and escaping', () => {
        expect(formatValue('hello')).toBe('"hello"');
        expect(formatValue('hello <world>')).toBe('"hello &lt;world&gt;"');
    });

    it('should format numbers', () => {
        expect(formatValue(42)).toBe('42');
        expect(formatValue(3.14)).toBe('3.14');
        expect(formatValue(0)).toBe('0');
        expect(formatValue(-10)).toBe('-10');
    });

    it('should format booleans', () => {
        expect(formatValue(true)).toBe('true');
        expect(formatValue(false)).toBe('false');
    });

    it('should format objects as JSON', () => {
        expect(formatValue({ key: 'value' })).toBe('{"key":"value"}');
        expect(formatValue([1, 2, 3])).toBe('[1,2,3]');
    });
});

describe('nodeToJSON', () => {
    it('should convert a simple node', () => {
        const node = {
            name: 'test-node',
            entries: []
        };

        expect(nodeToJSON(node)).toEqual({
            name: 'test-node'
        });
    });

    it('should convert node with arguments', () => {
        const node = {
            name: 'node',
            entries: [
                { value: 'arg1' },
                { value: 42 }
            ]
        };

        expect(nodeToJSON(node)).toEqual({
            name: 'node',
            arguments: ['arg1', 42]
        });
    });

    it('should convert node with properties', () => {
        const node = {
            name: 'node',
            entries: [
                { name: 'prop1', value: 'value1' },
                { name: 'prop2', value: true }
            ]
        };

        expect(nodeToJSON(node)).toEqual({
            name: 'node',
            properties: {
                prop1: 'value1',
                prop2: true
            }
        });
    });

    it('should convert node with both arguments and properties', () => {
        const node = {
            name: 'node',
            entries: [
                { value: 'arg1' },
                { name: 'prop', value: 'val' }
            ]
        };

        expect(nodeToJSON(node)).toEqual({
            name: 'node',
            arguments: ['arg1'],
            properties: { prop: 'val' }
        });
    });

    it('should convert node with children', () => {
        const node = {
            name: 'parent',
            entries: [],
            children: {
                nodes: [
                    { name: 'child1', entries: [] },
                    { name: 'child2', entries: [] }
                ]
            }
        };

        expect(nodeToJSON(node)).toEqual({
            name: 'parent',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        });
    });

    it('should handle nested children', () => {
        const node = {
            name: 'root',
            entries: [],
            children: {
                nodes: [
                    {
                        name: 'parent',
                        entries: [],
                        children: {
                            nodes: [
                                { name: 'child', entries: [{ value: 'test' }] }
                            ]
                        }
                    }
                ]
            }
        };

        expect(nodeToJSON(node)).toEqual({
            name: 'root',
            children: [
                {
                    name: 'parent',
                    children: [
                        {
                            name: 'child',
                            arguments: ['test']
                        }
                    ]
                }
            ]
        });
    });
});

describe('documentToJSON', () => {
    it('should convert empty document', () => {
        expect(documentToJSON(null)).toEqual({ nodes: [] });
        expect(documentToJSON(undefined)).toEqual({ nodes: [] });
        expect(documentToJSON({ nodes: [] })).toEqual({ nodes: [] });
    });

    it('should convert document with nodes', () => {
        const doc = {
            nodes: [
                { name: 'node1', entries: [] },
                { name: 'node2', entries: [{ value: 'arg' }] }
            ]
        };

        expect(documentToJSON(doc)).toEqual({
            nodes: [
                { name: 'node1' },
                { name: 'node2', arguments: ['arg'] }
            ]
        });
    });

    it('should convert complex document', () => {
        const doc = {
            nodes: [
                {
                    name: 'package',
                    entries: [
                        { value: 'my-app' },
                        { name: 'version', value: '1.0.0' }
                    ],
                    children: {
                        nodes: [
                            {
                                name: 'author',
                                entries: [{ value: 'Jane' }]
                            }
                        ]
                    }
                }
            ]
        };

        expect(documentToJSON(doc)).toEqual({
            nodes: [
                {
                    name: 'package',
                    arguments: ['my-app'],
                    properties: { version: '1.0.0' },
                    children: [
                        {
                            name: 'author',
                            arguments: ['Jane']
                        }
                    ]
                }
            ]
        });
    });
});
