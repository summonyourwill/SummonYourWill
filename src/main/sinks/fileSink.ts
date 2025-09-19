// src/main/sinks/fileSink.ts
import { promises as fs } from 'fs';
import path from 'path';

export class FileSink {
  constructor(private baseDir: string) {}

  async write(name: string, data: any) {
    const filePath = path.join(this.baseDir, `${name}.json`);
    const pretty = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, pretty, 'utf8');
    return filePath;
  }
}
