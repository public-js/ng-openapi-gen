/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { AdditionalProperties } from '../models/additional-properties';
import { AuditCdr } from '../models/audit-cdr';
import { Containers } from '../models/containers';
import { InlineObject } from '../models/inline-object';
import { Nullables } from '../models/nullables';
import { ReferencedInParamOneOf1 } from '../models/referenced-in-param-one-of-1';
import { ReferencedInParamOneOf2 } from '../models/referenced-in-param-one-of-2';
import { ReferencedInServiceOneOf1 } from '../models/referenced-in-service-one-of-1';
import { ReferencedInServiceOneOf2 } from '../models/referenced-in-service-one-of-2';
import { RefObject as ABRefObject } from '../models/a/b/ref-object';
import { Disjunct } from '../models/disjunct';

@Injectable({
    providedIn: 'root',
})
export class ApiService extends BaseService {
    constructor(config: ApiConfiguration, http: HttpClient) {
        super(config, http);
    }

    /**
     * Path part for operation fooGet
     */
    static readonly FooGetPath = '/foo';

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `fooGet()` instead.
     *
     * This method doesn't expect any request body.
     */
    fooGet$Response(params?: {}): Observable<StrictHttpResponse<Containers>> {
        const rb = new RequestBuilder(this.rootUrl, ApiService.FooGetPath, 'get');
        if (params) {
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'json',
                    accept: 'application/json',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Containers>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `fooGet$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    fooGet(params?: {}): Observable<Containers> {
        return this.fooGet$Response(params).pipe(map((r: StrictHttpResponse<Containers>) => r.body as Containers));
    }

    /**
     * Path part for operation barGet
     */
    static readonly BarGetPath = '/bar';

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `barGet()` instead.
     *
     * This method doesn't expect any request body.
     */
    barGet$Response(params?: {
        param?:
            | ReferencedInParamOneOf1
            | ReferencedInParamOneOf2
            | ABRefObject
            | AdditionalProperties
            | Nullables
            | InlineObject
            | AuditCdr;
    }): Observable<StrictHttpResponse<ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2>> {
        const rb = new RequestBuilder(this.rootUrl, ApiService.BarGetPath, 'get');
        if (params) {
            rb.query('param', params.param, {});
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'json',
                    accept: 'application/json',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `barGet$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    barGet(params?: {
        param?:
            | ReferencedInParamOneOf1
            | ReferencedInParamOneOf2
            | ABRefObject
            | AdditionalProperties
            | Nullables
            | InlineObject
            | AuditCdr;
    }): Observable<ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2> {
        return this.barGet$Response(params).pipe(
            map(
                (r: StrictHttpResponse<ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2>) =>
                    r.body as ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2,
            ),
        );
    }

    /**
     * Path part for operation bazGet
     */
    static readonly BazGetPath = '/baz';

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `bazGet()` instead.
     *
     * This method doesn't expect any request body.
     */
    bazGet$Response(params?: {}): Observable<StrictHttpResponse<Disjunct>> {
        const rb = new RequestBuilder(this.rootUrl, ApiService.BazGetPath, 'get');
        if (params) {
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'json',
                    accept: 'application/json',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Disjunct>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `bazGet$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    bazGet(params?: {}): Observable<Disjunct> {
        return this.bazGet$Response(params).pipe(map((r: StrictHttpResponse<Disjunct>) => r.body as Disjunct));
    }
}
