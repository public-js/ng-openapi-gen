/* tslint:disable */
/* eslint-disable */

/**
 * This file was generated automatically from API specification.
 * Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.
 * To update this file run the generation tool.
 */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { API_ROOT_URL_TOKEN } from '../api-configuration';
import { RequestBuilder, StrictHttpResponse } from '../request-builder';

import { AdditionalProperties } from '../models/additional-properties';
import { AuditCdr } from '../models/audit-cdr';
import { Containers } from '../models/containers';
import { InlineObject } from '../models/inline-object';
import { Nullables } from '../models/nullables';
import { ReferencedInParamOneOf1 } from '../models/referenced-in-param-one-of-1';
import { ReferencedInParamOneOf2 } from '../models/referenced-in-param-one-of-2';
import { ReferencedInServiceOneOf1 } from '../models/referenced-in-service-one-of-1';
import { ReferencedInServiceOneOf2 } from '../models/referenced-in-service-one-of-2';
import { RefObject } from '../models/a/b/ref-object';
import { Disjunct } from '../models/disjunct';

@Injectable()
export class ApiService {
  constructor(
    @Inject(API_ROOT_URL_TOKEN) private rootUrl: string,
    @Inject(HttpClient) private http: HttpClient,
  ) {}

  /** Path part for operation `fooGet` */
  private static readonly FooGetPath = '/foo';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `fooGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  public fooGet$Response(params?: {
  },
  context?: HttpContext): Observable<StrictHttpResponse<Containers>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.FooGetPath, 'get');
    if (params) {
    }

    return this.http.request(
      rb.build({ responseType: 'json', accept: 'application/json', context: context })
    ).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<Containers>,
      ),
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `fooGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public fooGet(params?: {
  },
  context?: HttpContext): Observable<Containers> {
    return this.fooGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Containers>) => r.body as Containers),
    );
  }

  /** Path part for operation `barGet` */
  private static readonly BarGetPath = '/bar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `barGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  public barGet$Response(params?: {
    param?: (ReferencedInParamOneOf1 | ReferencedInParamOneOf2 | RefObject | AdditionalProperties | Nullables | InlineObject | AuditCdr);
  },
  context?: HttpContext): Observable<StrictHttpResponse<(ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2)>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.BarGetPath, 'get');
    if (params) {
      rb.query('param', params.param, {});
    }

    return this.http.request(
      rb.build({ responseType: 'json', accept: 'application/json', context: context })
    ).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<(ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2)>,
      ),
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `barGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public barGet(params?: {
    param?: (ReferencedInParamOneOf1 | ReferencedInParamOneOf2 | RefObject | AdditionalProperties | Nullables | InlineObject | AuditCdr);
  },
  context?: HttpContext): Observable<(ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2)> {
    return this.barGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<(ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2)>) => r.body as (ReferencedInServiceOneOf1 | ReferencedInServiceOneOf2)),
    );
  }

  /** Path part for operation `bazGet` */
  private static readonly BazGetPath = '/baz';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `bazGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  public bazGet$Response(params?: {
  },
  context?: HttpContext): Observable<StrictHttpResponse<Disjunct>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.BazGetPath, 'get');
    if (params) {
    }

    return this.http.request(
      rb.build({ responseType: 'json', accept: 'application/json', context: context })
    ).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<Disjunct>,
      ),
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `bazGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public bazGet(params?: {
  },
  context?: HttpContext): Observable<Disjunct> {
    return this.bazGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Disjunct>) => r.body as Disjunct),
    );
  }

}
