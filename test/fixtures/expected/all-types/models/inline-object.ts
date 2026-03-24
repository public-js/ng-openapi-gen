/* tslint:disable */
/* eslint-disable */
import { RefEnum } from './ref-enum';

export interface InlineObject {
  object?: {
'string'?: string;
'nullableString'?: string | null;
'ref'?: RefEnum;
'nullableRef'?: RefEnum | null;
};
}
