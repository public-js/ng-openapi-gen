#!/usr/bin/env node

import { runCli } from './cli/main.js';

runCli().catch((error: unknown) => {
    process.stdout.write('An error occurred:\n');
    throw error;
});
