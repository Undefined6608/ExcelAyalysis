import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  example: () => 'Hello from Electron!',
});