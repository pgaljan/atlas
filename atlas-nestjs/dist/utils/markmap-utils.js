"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMarkmapHeader = generateMarkmapHeader;
function generateMarkmapHeader(level) {
    if (level <= 0) {
        throw new Error('Level must be a positive integer.');
    }
    return '#'.repeat(level);
}
//# sourceMappingURL=markmap-utils.js.map