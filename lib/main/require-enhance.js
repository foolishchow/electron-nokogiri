/**
 * this file is based on code of npm package `alias-require`
 * Modified from https://www.npmjs.com/package/alias-require
 * 
 * The MIT License (MIT)
 * Copyright (c) 2016 Tim McGee
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

const Module = require('module');
const assert = require('assert');
const path = require('path');

let aliasesMap = new Map();

const oldRequire = Module.prototype.require,
oldResolveFilename = Module._resolveFilename;

function _require(context, requiredPath) {
    return oldRequire.call(context, requiredPath);
}
function _resolveFilename(context, requiredPath) {
    return oldResolveFilename(requiredPath,context);
}
Module.prototype.require = function (request) {
    assert(typeof request === 'string', 'path must be a string');
    assert(request, 'missing path');

    if (request.startsWith('@')) {
        const matches = request.match(/@\.?([^/|^\.]+)(.+)?/);
        const requiredAlias = matches[1];
        let requiredPath = matches[2];
        if (request.startsWith('@.')) {
			requiredPath = requiredPath.replace(/\./gi,'/');
		}
        if (aliasesMap.has(requiredAlias)) {
            return _require(this, path.resolve(path.dirname(this.filename), path.join(aliasesMap.get(requiredAlias), requiredPath)));
        }
        throw new Error(`Cannot resolve alias '${requiredAlias}'`);
    }

    return _require(this, request);
};

Module._resolveFilename = function(request,_module){
    assert(typeof request === 'string', 'path must be a string');
    assert(request, 'missing path');
    if (request.startsWith('@')) {
        const matches = request.match(/@\.?([^/|^\.]+)(.+)?/);
        const requiredAlias = matches[1];
        let requiredPath = matches[2];
        if (request.startsWith('@.')) {
			requiredPath = requiredPath.replace(/\./gi,'/');
		}
        if (aliasesMap.has(requiredAlias)) {
            return _resolveFilename(_module, 
                path.resolve(path.dirname(_module.filename), path.join(aliasesMap.get(requiredAlias), requiredPath)));
        }
        throw new Error(`Cannot resolve alias '${requiredAlias}'`);
    }
    return _resolveFilename(_module,request)
};
const enhance = (aliases)=>{
    for (let alias in aliases) {
        if (aliases.hasOwnProperty(alias)) {
            const linkedPath = aliases[alias];

            if (path.isAbsolute(linkedPath)) {
                aliasesMap.set(alias, linkedPath);
            } else {
                throw new Error(`Path for alias '${alias}' must be absolute`);
            }
        }
    }
}

module.exports = enhance;