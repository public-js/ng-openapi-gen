/* tslint:disable */
/* eslint-disable */
import { RefObject } from './a/b/ref-object';

export interface AdditionalProperties {
  age?: null | number;
  description?: string;
  name: string;

  [key: string]: RefObject | null | number | string | undefined;
}
