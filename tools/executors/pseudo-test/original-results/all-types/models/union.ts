/* tslint:disable */
/* eslint-disable */
import { Container } from './container';
import { RefEnum } from './ref-enum';
import { RefIntEnum } from './ref-int-enum';
import { RefNamedIntEnum } from './ref-named-int-enum';
export type Union = ({
[key: string]: any;
} | RefEnum | RefIntEnum | RefNamedIntEnum | Container);
