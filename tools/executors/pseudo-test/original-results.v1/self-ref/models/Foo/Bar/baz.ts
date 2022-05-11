/* tslint:disable */
/* eslint-disable */
export interface Baz {
    arrayProperty: Array<Baz>;
    objectProperty?: {
        nestedArray: Array<Baz>;
        nestedRef: Baz;
    };
    refProperty?: Baz;
}
