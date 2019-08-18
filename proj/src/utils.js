// Repeats a string n times
const repeat = (str, n) => Array(n).join(str);

// Repeats an indent (of four spaces) n times
const indent = n => repeat('    ', n);

// Indents a string with multiple lines
const indentLines = (str, n) => indent(n) + str.replace(/\n/g, `\n${indent(n)}`);

module.exports = {repeat, indent, indentLines};