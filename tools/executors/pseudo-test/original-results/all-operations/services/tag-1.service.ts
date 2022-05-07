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

import { RefObject } from '../models/ref-object';
import { RefString } from '../models/ref-string';


/**
 * Description of tag1
 */
@Injectable({
  providedIn: 'root',
})
export class Tag1Service extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation path1Get
   */
  static readonly Path1GetPath = '/path1';

  /**
   * Path 1 GET description
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path1Get$Json()` instead.
   *
   * This method doesn't expect any request body.
   */
  path1Get$Json$Response(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * GET param 1
     */
    get1?: RefString;

    /**
     * GET param 2
     */
    get2?: number;

    /**
     * GET param 3
     */
    get3?: boolean;

    /**
     * GET param 4
     */
    get4?: Array<string>;

    /**
     * Should be escaped
     */
    '='?: string;

    /**
     * Should be escaped
     */
    '123'?: string;

    /**
     * Should be escaped
     */
    'a-b'?: string;
  }): Observable<StrictHttpResponse<RefObject>> {

    const rb = new RequestBuilder(this.rootUrl, Tag1Service.Path1GetPath, 'get');
    if (params) {
      rb.query('common1', params.common1, {});
      rb.header('common2', params.common2, {"style":"form","explode":true});
      rb.query('get1', params.get1, {});
      rb.query('get2', params.get2, {});
      rb.query('get3', params.get3, {});
      rb.query('get4', params.get4, {"style":"form","explode":false});
      rb.query('=', params['='], {});
      rb.query('123', params['123'], {});
      rb.query('a-b', params['a-b'], {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'text/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<RefObject>;
      })
    );
  }

  /**
   * Path 1 GET description
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `path1Get$Json$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  path1Get$Json(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * GET param 1
     */
    get1?: RefString;

    /**
     * GET param 2
     */
    get2?: number;

    /**
     * GET param 3
     */
    get3?: boolean;

    /**
     * GET param 4
     */
    get4?: Array<string>;

    /**
     * Should be escaped
     */
    '='?: string;

    /**
     * Should be escaped
     */
    '123'?: string;

    /**
     * Should be escaped
     */
    'a-b'?: string;
  }): Observable<RefObject> {

    return this.path1Get$Json$Response(params).pipe(
      map((r: StrictHttpResponse<RefObject>) => r.body as RefObject)
    );
  }

  /**
   * Path 1 GET description
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path1Get$Image()` instead.
   *
   * This method doesn't expect any request body.
   */
  path1Get$Image$Response(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * GET param 1
     */
    get1?: RefString;

    /**
     * GET param 2
     */
    get2?: number;

    /**
     * GET param 3
     */
    get3?: boolean;

    /**
     * GET param 4
     */
    get4?: Array<string>;

    /**
     * Should be escaped
     */
    '='?: string;

    /**
     * Should be escaped
     */
    '123'?: string;

    /**
     * Should be escaped
     */
    'a-b'?: string;
  }): Observable<StrictHttpResponse<Blob>> {

    const rb = new RequestBuilder(this.rootUrl, Tag1Service.Path1GetPath, 'get');
    if (params) {
      rb.query('common1', params.common1, {});
      rb.header('common2', params.common2, {"style":"form","explode":true});
      rb.query('get1', params.get1, {});
      rb.query('get2', params.get2, {});
      rb.query('get3', params.get3, {});
      rb.query('get4', params.get4, {"style":"form","explode":false});
      rb.query('=', params['='], {});
      rb.query('123', params['123'], {});
      rb.query('a-b', params['a-b'], {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: 'image/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Blob>;
      })
    );
  }

  /**
   * Path 1 GET description
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `path1Get$Image$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  path1Get$Image(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * GET param 1
     */
    get1?: RefString;

    /**
     * GET param 2
     */
    get2?: number;

    /**
     * GET param 3
     */
    get3?: boolean;

    /**
     * GET param 4
     */
    get4?: Array<string>;

    /**
     * Should be escaped
     */
    '='?: string;

    /**
     * Should be escaped
     */
    '123'?: string;

    /**
     * Should be escaped
     */
    'a-b'?: string;
  }): Observable<Blob> {

    return this.path1Get$Image$Response(params).pipe(
      map((r: StrictHttpResponse<Blob>) => r.body as Blob)
    );
  }

  /**
   * Path part for operation path2Get
   */
  static readonly Path2GetPath = '/path2/{id}';

  /**
   * GET on path2.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path2Get()` instead.
   *
   * This method doesn't expect any request body.
   */
  path2Get$Response(params: {
    id: number;

    /**
     * Query param
     */
    param1?: RefString;

    /**
     * Header param
     */
    param2?: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, Tag1Service.Path2GetPath, 'get');
    if (params) {
      rb.path('id', params.id, {});
      rb.query('param1', params.param1, {});
      rb.header('param2', params.param2, {});
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * GET on path2.
   *
   *
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `path2Get$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  path2Get(params: {
    id: number;

    /**
     * Query param
     */
    param1?: RefString;

    /**
     * Header param
     */
    param2?: string;
  }): Observable<void> {

    return this.path2Get$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

}
