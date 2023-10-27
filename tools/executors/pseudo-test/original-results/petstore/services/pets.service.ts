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

import { PetstorePetsModel } from '../models/petstore-pets-model';

@Injectable()
export class PetsService {
  constructor(
    @Inject(API_ROOT_URL_TOKEN) private rootUrl: string,
    @Inject(HttpClient) private http: HttpClient,
  ) {}

  /** Path part for operation `listPets` */
  private static readonly ListPetsPath = '/pets';

  /**
   * List all pets.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `listPets()` instead.
   *
   * This method doesn't expect any request body.
   */
  public listPets$Response(params?: {

    /**
     * How many items to return at one time (max 100)
     */
    limit?: number;
  },
  context?: HttpContext): Observable<StrictHttpResponse<PetstorePetsModel>> {

    const rb = new RequestBuilder(this.rootUrl, PetsService.ListPetsPath, 'get');
    if (params) {
      rb.query('limit', params.limit, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context,
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<PetstorePetsModel>,
      ),
    );
  }

  /**
   * List all pets.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `listPets$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public listPets(params?: {

    /**
     * How many items to return at one time (max 100)
     */
    limit?: number;
  },
  context?: HttpContext): Observable<PetstorePetsModel> {
    return this.listPets$Response(params, context).pipe(
      map((r: StrictHttpResponse<PetstorePetsModel>) => r.body as PetstorePetsModel),
    );
  }

  /** Path part for operation `createPets` */
  private static readonly CreatePetsPath = '/pets';

  /**
   * Create a pet.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createPets()` instead.
   *
   * This method doesn't expect any request body.
   */
  public createPets$Response(params?: {
  },
  context?: HttpContext): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, PetsService.CreatePetsPath, 'post');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*',
      context: context,
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>,
      ),
    );
  }

  /**
   * Create a pet.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `createPets$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public createPets(params?: {
  },
  context?: HttpContext): Observable<void> {
    return this.createPets$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void),
    );
  }

  /** Path part for operation `showPetById` */
  private static readonly ShowPetByIdPath = '/pets/{petId}';

  /**
   * Info for a specific pet.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `showPetById()` instead.
   *
   * This method doesn't expect any request body.
   */
  public showPetById$Response(params: {

    /**
     * The id of the pet to retrieve
     */
    petId: string;
  },
  context?: HttpContext): Observable<StrictHttpResponse<PetstorePetsModel>> {

    const rb = new RequestBuilder(this.rootUrl, PetsService.ShowPetByIdPath, 'get');
    if (params) {
      rb.path('petId', params.petId, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: context,
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<PetstorePetsModel>,
      ),
    );
  }

  /**
   * Info for a specific pet.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `showPetById$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public showPetById(params: {

    /**
     * The id of the pet to retrieve
     */
    petId: string;
  },
  context?: HttpContext): Observable<PetstorePetsModel> {
    return this.showPetById$Response(params, context).pipe(
      map((r: StrictHttpResponse<PetstorePetsModel>) => r.body as PetstorePetsModel),
    );
  }

}
