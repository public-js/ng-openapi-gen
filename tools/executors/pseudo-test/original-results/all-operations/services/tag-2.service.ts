/* tslint:disable */
/* eslint-disable */

/**
 * This file was generated automatically from API specification.
 * Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.
 * To update this file run the generation tool.
 */

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { API_ROOT_URL_TOKEN } from '../api-configuration';
import { RequestBuilder, StrictHttpResponse } from '../request-builder';

import { RefObject } from '../models/ref-object';
import { RefString } from '../models/ref-string';

@Injectable()
export class Tag2Service {
  constructor(
    @Inject(API_ROOT_URL_TOKEN) private rootUrl: string,
    @Inject(HttpClient) private http: HttpClient,
  ) {}

  /** Path part for operation `path1Post` */
  private static readonly Path1PostPath = '/path1';

  /**
   * POST on path1.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path1Post$Json()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  public path1Post$Json$Response(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * POST param 1
     */
    post1?: number;
    body: RefObject;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, Tag2Service.Path1PostPath, 'post');
    if (params) {
      rb.query('common1', params.common1, {});
      rb.header('common2', params.common2, {"style":"form","explode":true});
      rb.query('post1', params.post1, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*',
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>,
      ),
    );
  }

  /**
   * POST on path1.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `path1Post$Json$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  public path1Post$Json(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * POST param 1
     */
    post1?: number;
    body: RefObject;
  }): Observable<void> {
    return this.path1Post$Json$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void),
    );
  }

  /**
   * POST on path1.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path1Post$Plain()` instead.
   *
   * This method sends `text/plain` and handles request body of type `text/plain`.
   */
  public path1Post$Plain$Response(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * POST param 1
     */
    post1?: number;
    body: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, Tag2Service.Path1PostPath, 'post');
    if (params) {
      rb.query('common1', params.common1, {});
      rb.header('common2', params.common2, {"style":"form","explode":true});
      rb.query('post1', params.post1, {});
      rb.body(params.body, 'text/plain');
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*',
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>,
      ),
    );
  }

  /**
   * POST on path1.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `path1Post$Plain$Response()` instead.
   *
   * This method sends `text/plain` and handles request body of type `text/plain`.
   */
  public path1Post$Plain(params: {

    /**
     * Common param 1
     */
    common1?: RefString;

    /**
     * Common param 2
     */
    common2: RefObject;

    /**
     * POST param 1
     */
    post1?: number;
    body: string;
  }): Observable<void> {
    return this.path1Post$Plain$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void),
    );
  }

}
