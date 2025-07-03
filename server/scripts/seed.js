#!/usr/bin/env node

// Set config directory before importing config
process.env.NODE_CONFIG_DIR = process.cwd() + '/config';

import '../src/database/seeders/index.js';
