// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import Path from 'path';

import archiver from 'archiver';

import { Connection, Request, TYPES } from 'tedious';

import { BotProjectService } from '../services/project';
import { DialogSetting } from '../models/bot/interface';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from '../models/connector';

export class ZammoBotConnector implements IBotConnector {
  private endpoint: string;
  constructor(adminEndpoint: string, endpoint: string) {
    this.endpoint = endpoint;
  }

  public status: BotStatus = BotStatus.NotConnected;

  connect = async (_: BotEnvironments, __: string) => {
    return `${this.endpoint}/api/messages`;
  };

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
      console.log(err);
      // If no error, then good to proceed.
      console.log('Connected');
      const currentProject = BotProjectService.getCurrentBotProject();

      if (currentProject === undefined) {
        throw new Error('no project is opened, nothing to sync');
      }
      const dir = Path.join(currentProject.dataDir);
      // const luisConfig = currentProject.luPublisher.getLuisConfig();
      await this.archiveDirectory(dir, './tmp.zip');
      const content = fs.readFileSync('./tmp.zip');
      const base64definition = new Buffer(content).toString('base64');

      // do the do
      const request = new Request(
        'INSERT INTO ComposerDefinitions (Name,Base64Definition) VALUES (@name, @base64Definition)',
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
  };

  archiveDirectory = (src: string, dest: string) => {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dest);

      archive.pipe(output);
      archive.directory(src, false);
      archive.finalize();

      output.on('close', () => resolve(archive));
      archive.on('error', err => reject(err));
    });
  };

  getEditingStatus = (): Promise<boolean> => {
    return new Promise(resolve => {
      resolve(true);
    });
  };

  getPublishHistory = (): Promise<IPublishHistory> => {
    return new Promise(resolve => {
      resolve({
        production: undefined,
        previousProduction: undefined,
        integration: undefined,
      });
    });
  };

  publish = (_: BotConfig, __: string): Promise<void> => {
    return new Promise(resolve => {
      resolve();
    });
  };
}
