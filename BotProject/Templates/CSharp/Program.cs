﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }
        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((hostingContext, config) =>
            {
                var env = hostingContext.HostingEnvironment;
                var luisAuthoringRegion = Environment.GetEnvironmentVariable("LUIS_AUTHORING_REGION") ?? "westus";
                var luisSettingFiles = Directory.GetFiles($"ComposerDialogs\\generated", "luis.settings.*.json");
                config
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
                    .AddJsonFile($"ComposerDialogs/settings/appsettings.json", optional: true, reloadOnChange: true)
                    .AddJsonFile(luisSettingFiles.Length > 0 ? luisSettingFiles[0] : string.Empty, optional: true, reloadOnChange: true)
                    .AddJsonFile($"luis.settings.{env.EnvironmentName}.{luisAuthoringRegion}.json", optional: true, reloadOnChange: true)
                    .AddJsonFile($"luis.settings.{Environment.UserName}.{luisAuthoringRegion}.json", optional: true, reloadOnChange: true);

                if (env.IsDevelopment())
                {
                    config.AddUserSecrets<Startup>();
                }

                config
                    .AddEnvironmentVariables()
                    .AddCommandLine(args);
            }).UseStartup<Startup>()
            .Build();

    }
}
