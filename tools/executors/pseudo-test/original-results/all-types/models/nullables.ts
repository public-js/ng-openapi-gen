/* tslint:disable */
/* eslint-disable */
import { NullableObject } from './nullable-object';
export interface Nullables {
  inlinedNullableObject: null | {
'someProperty': string;
};
  nullableObject: null | NullableObject;
  withNullableProperty: {
'someProperty': null | NullableObject;
};
}
