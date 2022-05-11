/* tslint:disable */
/* eslint-disable */
import { PPEntityModel } from './pp-entity-model';
import { PPGpsLocationModel } from './pp-gps-location-model';
export type PPPlaceModel = PPEntityModel &
    (
        | PPGpsLocationModel
        | {
              /**
               * Street address
               */
              address?: string;
          }
    ) & {
        description?: string;
        [key: string]: string;
    };
