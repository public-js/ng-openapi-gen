import { Property } from './property.js';

export class PropForModel {
    public defaulted: boolean;
    public defaultValue: unknown;
    public typeDef: string;
    public comment: string;

    constructor(
        public name: string,
        public prop: Property,
    ) {
        this.defaulted = this.prop.default !== undefined;
        this.defaultValue = this.getDefaultValue();
        this.typeDef = this.getTypeDef(this.name, this.prop);
        this.comment = this.getComment();
    }

    private getDefaultValue() {
        if (this.prop.default === undefined) {
            return;
        }
        if (typeof this.prop.default === 'string') {
            return `'${this.prop.default.replace('\n', '\\n')}'`;
        } else if (Array.isArray(this.prop.default)) {
            const innerValue =
                typeof this.prop.default[0] === 'string'
                    ? this.prop.default.map((val) => `'${val}'`)
                    : this.prop.default;
            return `[${innerValue.join(', ')}]`;
        } else if (typeof this.prop.default === 'object') {
            return JSON.stringify(this.prop.default); // .slice(1, -1);
        }
        return this.prop.default;
    }

    // noinspection JSMethodCanBeStatic
    private getTypeDef(name: string, prop: Property) {
        let typeValue;
        if (prop.type === 'array') {
            typeValue = `${prop.arrayOf}[]`;
        } else if (prop.type === 'enum') {
            typeValue = prop.values.map((val) => `'${val}'`).join(' | ');
        } else if (Array.isArray(prop.type)) {
            typeValue = prop.type.join(' | ');
        } else if (prop.type === 'object') {
            if (prop.properties !== undefined) {
                const childProps: string[] = [];
                for (const [propName, propDesc] of Object.entries(prop.properties)) {
                    const propMod = new PropForModel(propName, propDesc);
                    childProps.push(
                        propMod.comment ? `${propMod.comment}\n${propMod.typeDef};` : `${propMod.typeDef};`,
                    );
                }
                typeValue = ['{', ...childProps, '}'].join('\n');
            }
            if (prop.patternProperties !== undefined) {
                const childProps: string[] = [];
                for (const [, patternObj] of Object.entries(prop.patternProperties)) {
                    for (const [propName, propDesc] of Object.entries(patternObj.properties)) {
                        const propMod = new PropForModel(propName, propDesc);
                        childProps.push(
                            propMod.comment ? `${propMod.comment}\n${propMod.typeDef};` : `${propMod.typeDef};`,
                        );
                    }
                }
                typeValue = ['{', '[key: string]: {', ...childProps, '};', '}'].join('\n');
            }
        } else if (prop.type === 'fnObject') {
            const childProps: string[] = [];
            for (const propName of Object.keys(prop.properties)) {
                childProps.push(`${propName}?: (...params: unknown[]) => void;`);
            }
            typeValue = ['{', ...childProps, '}'].join('\n');
        } else {
            typeValue = prop.type;
        }
        const optionalChar = prop.requiredIn?.includes('model') ? '' : '?';
        return `${name}${optionalChar}: ${typeValue}`;
    }

    private getComment() {
        const origDescription = (this.prop.description || '').trim();
        if (!origDescription) {
            return '';
        }
        const defaultsTo = this.defaultValue === undefined ? '' : `Defaults to ${this.defaultValue}.`;
        if (!origDescription.includes('\n')) {
            const description = defaultsTo ? `${origDescription} ${defaultsTo}` : origDescription;
            return `/** ${description} */`;
        }
        const description = (defaultsTo ? `${origDescription}\n${defaultsTo}` : origDescription)
            .split('\n')
            .map((line) => '* ' + line)
            .join('\n');
        return `/**\n${description}\n*/`;
    }
}
