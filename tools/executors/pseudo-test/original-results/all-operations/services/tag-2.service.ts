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

@Injectable({
  providedIn: 'root',
})
export class Tag2Service extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation path1Post
   */
  static readonly Path1PostPath = '/path1';

  /**
   * POST on path1.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path1Post$Json()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  path1Post$Json$Response(params: {

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
    body: RefObject
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
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * POST on path1.
   *
   *
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `path1Post$Json$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  path1Post$Json(params: {

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
    body: RefObject
  }): Observable<void> {

    return this.path1Post$Json$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * POST on path1.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path1Post$Plain()` instead.
   *
   * This method sends `text/plain` and handles request body of type `text/plain`.
   */
  path1Post$Plain$Response(params: {

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
    body: string
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
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * POST on path1.
   *
   *
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `path1Post$Plain$Response()` instead.
   *
   * This method sends `text/plain` and handles request body of type `text/plain`.
   */
  path1Post$Plain(params: {

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
    body: string
  }): Observable<void> {

    return this.path1Post$Plain$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

}
