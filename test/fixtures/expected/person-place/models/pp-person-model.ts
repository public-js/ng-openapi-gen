/* tslint:disable */
/* eslint-disable */
import { PPEntityModel } from './pp-entity-model';
import { PPPersonPlaceModel } from './pp-person-place-model';

export type PPPersonModel = PPEntityModel & {
'name'?: string;
'places'?: Array<PPPersonPlaceModel>;
};
