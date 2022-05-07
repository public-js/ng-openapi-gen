import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ExecutorContext } from '@nrwl/devkit';
import { JSONSchema7 } from 'json-schema';
import { Options as YArgsOptions } from 'yargs-parser';

import { schemaDescriptor } from './schema-descriptor.js';
import { PropForJson } from './types/prop-for-json.js';
import { PropForModel } from './types/prop-for-model.js';

function writeSchemaJson(schemaJsonPath: string, schemaId: string): void {
    const schema: JSONSchema7 = {
        // $schema: 'http://json-schema.org/schema',
        $schema: 'http://json-schema.org/draft-07/schema',
        $id: schemaId,
        title: 'Options for ng-openapi-gen',
        type: 'object',
    };

    const required: string[] = [];
    const properties: Record<string, JSONSchema7> = {};

    for (const [propName, propDesc] of Object.entries(schemaDescriptor.properties)) {
        if (propDesc.onlyFor && !propDesc.onlyFor.includes('json')) {
            continue;
        }

        const propMod = new PropForJson(propName, propDesc);
        properties[propName] = propMod.getSchema();

        if (propDesc.requiredIn?.includes('json')) {
            required.push(propName);
        }
    }

    if (required.length > 0) {
        schema.required = required;
    }
    if (Object.keys(properties).length > 0) {
        schema.properties = properties;
    }

    const content = JSON.stringify(schema, null, 2);
    writeFileSync(schemaJsonPath, content + '\n', { encoding: 'utf8' });
}

function writeArgsParse(argsParsePath: string): void {
    const options: YArgsOptions & { array: { key: string; number?: true }[] } = {
        string: [],
        number: [],
        boolean: [],
        array: [],
        alias: {},
        // default: {},
        configuration: { 'strip-dashed': true, 'strip-aliased': true },
    };

    for (const [propName, propDesc] of Object.entries(schemaDescriptor.properties)) {
        if (propDesc.onlyFor && !propDesc.onlyFor.includes('args')) {
            continue;
        }

        switch (propDesc.type) {
            case 'string': {
                options.string.push(propName);
                break;
            }
            case 'number': {
                options.number.push(propName);
                break;
            }
            case 'boolean': {
                options.boolean.push(propName);
                break;
            }
            case 'array': {
                if (propDesc.arrayOf === 'string') {
                    options.array.push({ key: propName });
                } else if (propDesc.arrayOf === 'number') {
                    options.array.push({ key: propName, number: true });
                }
                break;
            }
            default: {
                continue;
            }
        }

        if ('alias' in propDesc) {
            options.alias[propName] = propDesc.alias;
        }

        // if (propDesc.default) {
        //     options.default[propName] = propDesc.default;
        // }
    }

    const joined = {
        string: options.string.map((prop) => `'${prop}'`).join(', '),
        number: options.number.map((prop) => `'${prop}'`).join(', '),
        boolean: options.boolean.map((prop) => `'${prop}'`).join(', '),
        array: options.array.map((prop) => JSON.stringify(prop)).join(', '),
        alias: Object.keys(options.alias).length > 0 ? JSON.stringify(options.alias) : '',
        // default: Object.keys(options.default).length > 0 ? JSON.stringify(options.default) : '',
        configuration: JSON.stringify(options.configuration),
    };
    const combined = Object.entries(joined)
        .filter(([, value]) => value)
        .map(([key, value]) =>
            ['string', 'number', 'boolean', 'array'].includes(key) ? `${key}: [${value}],` : `${key}: ${value},`,
        )
        .join('\n');

    const { mStart, mEnd } = { mStart: '// CONFIG_START', mEnd: '// CONFIG_END' };
    const markers = new RegExp(`${mStart}[\\S\\s]*${mEnd}`, 'm');

    const fileContent = readFileSync(argsParsePath, { encoding: 'utf8' });
    const content = fileContent.replace(markers, `${mStart}\n${combined}\n${mEnd}`);
    writeFileSync(argsParsePath, content, { encoding: 'utf8' });
}

function writeOptionsFile(optionsFilePath: string): void {
    const interfaceProps = new Map<string, PropForModel>();
    const defaulted: string[] = [];

    for (const [propName, propDesc] of Object.entries(schemaDescriptor.properties)) {
        if (propDesc.onlyFor && !propDesc.onlyFor.includes('model')) {
            continue;
        }

        const propMod = new PropForModel(propName, propDesc);
        interfaceProps.set(propName, propMod);

        if (propMod.defaulted) {
            defaulted.push(propName);
        }
    }

    const interfaceStr = [
        'interface OptionsInput {',
        ...Array.from(interfaceProps.values()).map((propMod) =>
            propMod.comment ? `${propMod.comment}\n${propMod.typeDef};` : `${propMod.typeDef};`,
        ),
        '}',
    ].join('\n');
    let defaultOptsStr = '';
    let optionsTypeStr = 'export type Options = OptionsInput;';
    let defaultObjStr = '';

    if (defaulted.length > 0) {
        const pickType = 'Required<Pick<OptionsInput, DefaultedOptions>>';

        const keysUnion = defaulted.map((propName) => ` | '${propName}'`).join('\n');
        defaultOptsStr = `type DefaultedOptions =\n${keysUnion};`;
        optionsTypeStr = `export type Options = ${pickType} & OptionsInput;`;

        defaultObjStr = [
            `export const defaultOptions: ${pickType} = {`,
            ...defaulted.map((propName) => `${propName}: ${interfaceProps.get(propName).defaultValue},`),
            '};',
        ].join('\n');
    }

    writeFileSync(optionsFilePath, [interfaceStr, defaultOptsStr, optionsTypeStr, defaultObjStr].join('\n\n') + '\n', {
        encoding: 'utf8',
    });
}

export default async function main(_: never, context: ExecutorContext): Promise<{ success: boolean }> {
    const sourceRoot = context.workspace.projects[context.projectName].sourceRoot || '';
    const pkgSrc = resolve(sourceRoot);

    const packageJson = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }));
    const schemaId = `${packageJson.repository}/blob/main/${sourceRoot}/schema.json`;

    const schemaJsonPath = join(pkgSrc, 'schema.json');
    writeSchemaJson(schemaJsonPath, schemaId);

    const argsParsePath = join(pkgSrc, 'ng-openapi-gen.ts');
    writeArgsParse(argsParsePath);

    const optionsFilePath = join(pkgSrc, 'lib', 'options.ts');
    writeOptionsFile(optionsFilePath);

    const projectDeps = new Set([
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
    ]);
    if (projectDeps.has('prettier')) {
        execSync('npx prettier --write ' + schemaJsonPath, { stdio: 'inherit', cwd: process.cwd() });
        execSync('npx prettier --write ' + argsParsePath, { stdio: 'inherit', cwd: process.cwd() });
        execSync('npx prettier --write ' + optionsFilePath, { stdio: 'inherit', cwd: process.cwd() });
    }
    if (projectDeps.has('eslint')) {
        execSync('npx eslint --fix ' + argsParsePath, { stdio: 'inherit', cwd: process.cwd() });
        execSync('npx eslint --fix ' + optionsFilePath, { stdio: 'inherit', cwd: process.cwd() });
    }

    return { success: true };
}
