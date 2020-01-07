// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import Path from 'path';
import { Connection, Request, TYPES } from 'tedious';

import { BotProjectService } from '../services/project';
import { DialogSetting } from '../models/bot/interface';

import {
  BotStatus,
  CSharpBotConnector,
  IBotConnector,
  BotEnvironments,
  IPublishHistory,
  BotConfig,
} from '../models/connector';

export class ZammoBotConnector implements IBotConnector {
  wrapped: CSharpBotConnector;

  constructor(adminEndpoint: string, endpoint: string) {
    this.wrapped = new CSharpBotConnector(adminEndpoint, endpoint);
    //super(adminEndpoint, endpoint);
  }

  public status: BotStatus = BotStatus.NotConnected;

  sync = async (config: DialogSetting) => {
    const cfg = {
      server: 'localhost', //update me
      authentication: {
        type: 'default',
        options: {
          userName: 'changeme', //update me
          password: 'changeme', //update me
        },
      },
      options: {
        // If you are on Microsoft Azure, you need encryption:
        //encrypt: true,
        port: 56944, // only necessary for local sqlexp
        instancename: 'SQLEXPRESS',
        database: 'zammodb22', //update me
      },
    };
    const connection = new Connection(cfg);
    connection.on('connect', async err => {
      const currentProject = BotProjectService.getCurrentBotProject();

      if (currentProject === undefined) {
        throw new Error('no project is opened, nothing to sync');
      }
      const dir = Path.join(currentProject.dataDir);

      await this.archiveDirectory(dir, './tmp.zip');
      const content = fs.readFileSync('./tmp.zip');
      const base64definition = new Buffer(content).toString('base64');

      const request = new Request(
        'INSERT INTO ConversationModuleDefinitions (Name,Title,Base64Definition) VALUES (@name,@name,@base64Definition)',
        function(err) {
          if (err) {
            console.log(err);
          }
        }
      );
      request.addParameter('name', TYPES.NVarChar, currentProject.name);
      request.addParameter('base64Definition', TYPES.NVarChar, base64definition);
      connection.execSql(request);
    });

    // after storing in zammo db, publish to local test instance
    // note - we may want to add some conditions around this
    await this.wrapped.sync(config);
  };

  connect = async (_: BotEnvironments, __: string) => {
    return this.wrapped.connect(_, __);
  };

  archiveDirectory = (src: string, dest: string) => {
    return this.wrapped.archiveDirectory(src, dest);
  };

  getEditingStatus = (): Promise<boolean> => {
    return this.wrapped.getEditingStatus();
  };

  getPublishHistory = (): Promise<IPublishHistory> => {
    return this.wrapped.getPublishHistory();
  };

  publish = (_: BotConfig, __: string): Promise<void> => {
    return this.wrapped.publish(_, __);
  };
}
