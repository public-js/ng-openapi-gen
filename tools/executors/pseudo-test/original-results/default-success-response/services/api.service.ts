/* tslint:disable */
/* eslint-disable */

/**
 * This file was generated automatically from API specification.
 * Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.
 * To update this file run the generation tool.
 */

import { HttpClient, HttpResponse, HttpContext } from '@angular/common/http';
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

  /** Path part for operation `getPath1` */
  private static readonly GetPath1Path = '/path1';

  /**
   * Get a default string response.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPath1()` instead.
   *
   * This method doesn't expect any request body.
   */
  public getPath1$Response(params?: {
  },
  context?: HttpContext): Observable<StrictHttpResponse<string>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.GetPath1Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context,
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<string>,
      ),
    );
  }

  /**
   * Get a default string response.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `getPath1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public getPath1(params?: {
  },
  context?: HttpContext): Observable<string> {
    return this.getPath1$Response(params, context).pipe(
      map((r: StrictHttpResponse<string>) => r.body as string),
    );
  }

  /** Path part for operation `getPath2` */
  private static readonly GetPath2Path = '/path2';

  /**
   * Get a default number response.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPath2()` instead.
   *
   * This method doesn't expect any request body.
   */
  public getPath2$Response(params?: {
  },
  context?: HttpContext): Observable<StrictHttpResponse<number>> {

    const rb = new RequestBuilder(this.rootUrl, ApiService.GetPath2Path, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context,
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        (r as HttpResponse<any>).clone({ body: parseFloat(String((r as HttpResponse<any>).body)) }) as StrictHttpResponse<number>,
      ),
    );
  }

  /**
   * Get a default number response.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `getPath2$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public getPath2(params?: {
  },
  context?: HttpContext): Observable<number> {
    return this.getPath2$Response(params, context).pipe(
      map((r: StrictHttpResponse<number>) => r.body as number),
    );
  }

}
