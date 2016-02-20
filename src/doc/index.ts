/// <reference path="./defines.d.ts" />

require('source-map-support').install();

import { extractPackage, getFileInfo } from './utils';
import { processSourceFile } from './gen';
import { Item } from './items';
import * as uuid from 'node-uuid';

import {
    TypeChecker,
    Program,
    SourceFile
} from 'typescript';

import * as typescript from 'typescript';

export interface Package {
    info: PackageInfo;
    path: string;
}

export interface PackageInfo {
    name: string;
    version: string;
    description: string;
}

export interface FileInfo {
    relativeToPackage: string;
    withPackage: string;
    metaName: string;
}

export enum ModuleKind {
    TypeScript = 'typescript' as any
}

export interface ModuleInfo {
    kind: ModuleKind;
    text: string;
    pkgName: string;
    fileInfo: FileInfo;
    items: Item[];
}

export interface IdMap {
    [key: string]: {
        id: string;
        semanticId: string;
        pkg: string;
        path: string;
        nesting: string[];
    };
}

export interface SemanticIdMap {
    [pkg: string]: {[path: string]: {[semanticId: string]: string}};
}

export interface DocRegistry {
    mainPackage: string;
    files: Dictionary<ModuleInfo>;
    idMap: IdMap;
    semanticIdMap: SemanticIdMap;
    packages: Dictionary<PackageInfo>;
}

/**
 * Contains all documents
 */
export class Context {
    modules: Dictionary<Module> = {};
    ts = typescript;
    checker: TypeChecker = null;
    program: Program;

    packages: Dictionary<PackageInfo> = {};

    currentModule: Module;
    currentStack: string[];
    currentId: number;

    ids: WeakMap<any, string>;
    _visited: WeakMap<any, boolean>;

    constructor() {
        this.ids = new WeakMap();
        this._visited = new WeakMap();
        this.currentStack = [];
        this.currentId = 1;
    }

    dive<T>(level: string, func: () => T): T {
        this.currentStack.push(level);
        let result = func();
        this.currentStack.pop();

        return result;
    }

    visit(obj: any) {
        this._visited.set(obj, true);
    }

    isVisited(obj: any): boolean {
        return this._visited.get(obj);
    }

    semanticId(level?: string): string {
        let currentStack = this.currentStack;
        if (level) {
            currentStack = currentStack.concat(level);
        }
        return currentStack.join('.');
    }

    id(object: any): string {
        if (!this.ids.has(object)) {
            this.ids.set(object, (this.currentId++).toString());
            // this.ids.set(object, uuid.v1());
        }

        return this.ids.get(object);
    }

    setProgram(program: Program) {
        this.program = program;
        this.checker = this.program.getTypeChecker();
    }

    addModule(fileName, sourceFile: SourceFile) {
        let module = this.generateModule(fileName, sourceFile);
        this.modules[fileName] = module;
    }

    getModule(fileName): Module {
        return this.modules[fileName];
    }

    private generateModule(fileName: string, source: SourceFile): Module {
        let pkg = extractPackage(fileName);
        this.packages[pkg.info.name] = pkg.info;
        let fileInfo = getFileInfo(fileName, pkg);
        let doc = new Module(source, pkg.info.name, fileInfo);

        this.currentModule = doc;
        processSourceFile(source as any, this);
        this.currentModule = null;

        return doc;
    }
}

export class Module implements ModuleInfo {
    kind = ModuleKind.TypeScript;
    text: string;
    pkgName: string;
    fileInfo: FileInfo;

    items: Item[] = [];

    constructor(sourceFile: SourceFile, pkgName: string, fileInfo: FileInfo) {
        this.text = sourceFile.text;
        this.pkgName = pkgName;
        this.fileInfo = fileInfo;
    }

    toJSON() {
        let { text, pkgName, fileInfo, items, kind } = this;
        return { pkgName, fileInfo, text, items, kind };
    }
}
