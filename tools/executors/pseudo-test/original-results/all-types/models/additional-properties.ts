/* tslint:disable */
/* eslint-disable */
import { RefObject as ABRefObject } from './a/b/ref-object';
export interface AdditionalProperties {
  age?: null | number;
  description?: string;
  name: string;

  [key: string]: ABRefObject | null | number | string | undefined;
}
