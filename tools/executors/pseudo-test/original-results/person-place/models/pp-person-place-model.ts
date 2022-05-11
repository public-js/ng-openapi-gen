/* tslint:disable */
/* eslint-disable */
import { PPPlaceModel } from './pp-place-model';

export interface PPPersonPlaceModel {
  place?: PPPlaceModel;

  /**
   * The date this place was assigned to the person
   */
  since?: string;
}
