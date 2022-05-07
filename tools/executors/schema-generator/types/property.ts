import { JSONSchema7Type } from 'json-schema';

type PropertyType = 'string' | 'number' | 'boolean' | 'array' | 'enum' | 'object';

interface BaseProperty {
    description?: string;
    type: PropertyType | PropertyType[];
    default?: JSONSchema7Type;
    onlyFor?: ('json' | 'model' | 'args')[];
    requiredIn?: ('json' | 'model')[];
}

interface StringProperty extends BaseProperty {
    type: 'string';
    default?: string;
    alias?: string;
}

interface NumberProperty extends BaseProperty {
    type: 'number';
    default?: number;
    alias?: string;
}

interface BooleanProperty extends BaseProperty {
    type: 'boolean';
    default?: boolean;
    alias?: string;
}

interface AnyOfProperty extends BaseProperty {
    type: ('string' | 'number' | 'boolean')[];
}

interface ArrayProperty extends BaseProperty {
    type: 'array';
    arrayOf: 'string' | 'number';
}

interface StringArrayProperty extends ArrayProperty {
    arrayOf: 'string';
    default?: string[];
}

interface NumberArrayProperty extends ArrayProperty {
    arrayOf: 'number';
    default?: number[];
}

interface EnumProperty extends BaseProperty {
    type: 'enum';
    default?: string;
    alias?: string;
    values: string[];
}

interface ObjectProperty extends BaseProperty {
    type: 'object';
    minProperties?: number;
    maxProperties?: number;
    patternProperties?: Record<string, PatternProperty>;
}

interface PatternProperty extends BaseProperty {
    type: 'object';
    properties: Record<string, Property>;
}

export type Property =
    | StringProperty
    | NumberProperty
    | BooleanProperty
    | AnyOfProperty
    | StringArrayProperty
    | NumberArrayProperty
    | EnumProperty
    | ObjectProperty;
