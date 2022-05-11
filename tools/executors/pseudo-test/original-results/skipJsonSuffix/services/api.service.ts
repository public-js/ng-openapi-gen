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
  }): Observable<StrictHttpResponse<string>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.FooGetPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<string>,
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
  }): Observable<string> {
    return this.fooGet$Response(params).pipe(
      map((r: StrictHttpResponse<string>) => r.body as string),
    );
  }

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `fooGet$Plain()` instead.
   *
   * This method doesn't expect any request body.
   */
  public fooGet$Plain$Response(params?: {
  }): Observable<StrictHttpResponse<any>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.FooGetPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: 'text/plain',
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<any>,
      ),
    );
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `fooGet$Plain$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public fooGet$Plain(params?: {
  }): Observable<any> {
    return this.fooGet$Plain$Response(params).pipe(
      map((r: StrictHttpResponse<any>) => r.body as any),
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
  }): Observable<StrictHttpResponse<any>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.BarGetPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: 'text/plain',
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<any>,
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
  }): Observable<any> {
    return this.barGet$Response(params).pipe(
      map((r: StrictHttpResponse<any>) => r.body as any),
    );
  }

}
