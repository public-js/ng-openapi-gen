/* tslint:disable */
/* eslint-disable */
import { NullableObject } from './nullable-object';
import { RefEnum } from './ref-enum';
import { RefObject as ABRefObject } from './a/b/ref-object';
import { Disjunct } from './disjunct';
import { Union } from './union';
import { RefObject as XYRefObject } from './x/y/ref-object';
export type Container = {

/**
 * Property of type string
 */
'stringProp'?: string;

/**
 * Property of type integer
 */
'integerProp'?: number;

/**
 * Property of type number
 */
'numberProp': number;

/**
 * Property of type boolean
 */
'booleanProp'?: boolean;

/**
 * Property of type any
 */
'anyProp'?: any;
} & ABRefObject & {
'nullableObject'?: null | NullableObject;

/**
 * Property which references an enumerated string
 */
'refEnumProp': RefEnum;

/**
 * Property which references an object
 */
'refObjectProp': ABRefObject;

/**
 * Property which references an union object
 */
'unionProp'?: Union;
'disjunctProp'?: Disjunct;

/**
 * Property which references another container
 */
'containerProp'?: Container;

/**
 * Property of type array of string
 */
'arrayOfStringsProp'?: Array<string>;

/**
 * Property of type array of integers
 */
'arrayOfIntegersProp'?: Array<number>;

/**
 * Property of type array of numbers
 */
'arrayOfNumbersProp'?: Array<number>;

/**
 * Property of type array of booleans
 */
'arrayOfBooleansProp'?: Array<boolean>;

/**
 * Property of type array of enums
 */
'arrayOfRefEnumsProp'?: Array<RefEnum>;

/**
 * Property of type array of references an object
 */
'arrayOfABRefObjectsProp'?: Array<ABRefObject>;

/**
 * Property of type array of any type
 */
'arrayOfAnyProp'?: Array<any>;
'dynamic'?: {
[key: string]: XYRefObject;
};
'stringEnumProp'?: 'a' | 'b' | 'c';
'intEnumProp'?: 1 | 2 | 3;
'boolEnumProp'?: false;
'nestedObject'?: {
'p1'?: string;
'p2'?: number;
'deeper'?: {
'd1': ABRefObject;
'd2'?: (string | Array<ABRefObject> | number);
};
};
};
