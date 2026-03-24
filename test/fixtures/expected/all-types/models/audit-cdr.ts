/* tslint:disable */
/* eslint-disable */
import { AuditLog } from './audit-log';

export type AuditCdr = AuditLog & {
'callFrom'?: string;
'callTo'?: string;
'callStartDate'?: string;
'callEndDate'?: string;
} & {
};
