import { scripter } from './scripter.js';

Hooks.on('ready', scripter.execute);