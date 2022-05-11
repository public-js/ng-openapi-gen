/* tslint:disable */
/* eslint-disable */
import { EscapedProperties } from './escaped-properties';
import { ReferencedInNullableOneOf } from './referenced-in-nullable-one-of';
import { ReferencedInOneOf } from './referenced-in-one-of';
import { RefObject as ABRefObject } from './a/b/ref-object';
import { RefObject as XYRefObject } from './x/y/ref-object';
export type Disjunct =
    | {
          ref?: ReferencedInNullableOneOf | null;
      }
    | ABRefObject
    | XYRefObject
    | ReferencedInOneOf
    | EscapedProperties;
