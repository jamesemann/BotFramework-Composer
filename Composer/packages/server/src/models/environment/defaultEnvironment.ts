// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ISettingManager } from '../settings';
import { DefaultSettingManager } from '../settings/defaultSettingManager';
import { IBotConnector } from '../connector';

import { IEnvironmentConfig, IEnvironment } from '.';
import { ZammoBotConnector } from '../../_zammo/ZammoBotConnector';

export class DefaultEnvironment implements IEnvironment {
  private config: IEnvironmentConfig;
  private settingManager: DefaultSettingManager;
  private botConnector: IBotConnector;
  private defaultSlot = '';
  private slots: string[] = [''];

  public constructor(config: IEnvironmentConfig) {
    this.config = config;
    this.settingManager = new DefaultSettingManager(this.config.basePath);
    //this.botConnector = new CSharpBotConnector(this.config.adminEndpoint, this.config.endpoint);
    this.botConnector = new ZammoBotConnector(this.config.adminEndpoint, this.config.endpoint);
  }

  public getEnvironmentName(_: string): string | undefined {
    return undefined;
  }

  public getDefaultSlot(): string {
    return this.defaultSlot;
  }

  public getSlotNames(): string[] {
    return this.slots;
  }

  public getSettingsManager(): ISettingManager {
    return this.settingManager;
  }

  public getBotConnector(): IBotConnector {
    return this.botConnector;
  }
}
