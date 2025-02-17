/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { BASE_URL } from 'config';
import {
  TaskManagerListInterface,
  TaskManagerDetailInterface,
  TaskManagerLogItemInterface,
  TaskManagerThreadDumpInterface,
  TaskmanagersItemInterface
} from 'interfaces';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  taskManagerDetail$ = new ReplaySubject<TaskManagerDetailInterface>(1);

  /**
   * Load TM list
   */
  loadManagers(): Observable<TaskmanagersItemInterface[]> {
    return this.httpClient.get<TaskManagerListInterface>(`${BASE_URL}/taskmanagers`).pipe(
      map(data => data.taskmanagers || []),
      catchError(() => of([]))
    );
  }

  /**
   * Load specify TM
   *
   * @param taskManagerId
   */
  loadManager(taskManagerId: string): Observable<TaskManagerDetailInterface> {
    return this.httpClient
      .get<TaskManagerDetailInterface>(`${BASE_URL}/taskmanagers/${taskManagerId}`)
      .pipe(catchError(() => EMPTY));
  }

  /**
   * Load TM log list
   *
   * @param taskManagerId
   */
  loadLogList(taskManagerId: string): Observable<TaskManagerLogItemInterface[]> {
    return this.httpClient
      .get<{ logs: TaskManagerLogItemInterface[] }>(`${BASE_URL}/taskmanagers/${taskManagerId}/logs`)
      .pipe(map(data => data.logs));
  }

  /**
   * Load TM log
   *
   * @param taskManagerId
   * @param logName
   */
  loadLog(taskManagerId: string, logName: string): Observable<{ data: string; url: string }> {
    const url = `${BASE_URL}/taskmanagers/${taskManagerId}/logs/${logName}`;
    return this.httpClient
      .get(url, { responseType: 'text', headers: new HttpHeaders().append('Cache-Control', 'no-cache') })
      .pipe(
        map(data => {
          return {
            data,
            url
          };
        })
      );
  }

  /**
   * Load TM thread dump
   */
  loadThreadDump(taskManagerId: string): Observable<string> {
    return this.httpClient
      .get<TaskManagerThreadDumpInterface>(`${BASE_URL}/taskmanagers/${taskManagerId}/thread-dump`)
      .pipe(
        map(taskManagerThreadDump => {
          return taskManagerThreadDump.threadInfos.map(threadInfo => threadInfo.stringifiedThreadInfo).join('');
        })
      );
  }

  /**
   * Load TM logs
   *
   * @param taskManagerId
   */
  loadLogs(taskManagerId: string): Observable<string> {
    return this.httpClient.get(`${BASE_URL}/taskmanagers/${taskManagerId}/log`, {
      responseType: 'text',
      headers: new HttpHeaders().append('Cache-Control', 'no-cache')
    });
  }

  /**
   * Load TM stdout
   *
   * @param taskManagerId
   */
  loadStdout(taskManagerId: string): Observable<string> {
    return this.httpClient.get(`${BASE_URL}/taskmanagers/${taskManagerId}/stdout`, {
      responseType: 'text',
      headers: new HttpHeaders().append('Cache-Control', 'no-cache')
    });
  }

  /**
   * Get TM metric
   *
   * @param taskManagerId
   * @param listOfMetricName
   */
  getMetrics(taskManagerId: string, listOfMetricName: string[]): Observable<{ [p: string]: number }> {
    const metricName = listOfMetricName.join(',');
    return this.httpClient
      .get<Array<{ id: string; value: string }>>(`${BASE_URL}/taskmanagers/${taskManagerId}/metrics?get=${metricName}`)
      .pipe(
        map(arr => {
          const result: { [id: string]: number } = {};
          arr.forEach(item => {
            result[item.id] = parseInt(item.value, 10);
          });
          return result;
        })
      );
  }

  constructor(private httpClient: HttpClient) {}
}
