// src/main/sinks/compositeSink.ts
export class CompositeSink {
  constructor(private sinks: Array<{ write: (n: string, d: any) => Promise<any> }>) {}
  
  async write(name: string, data: any) {
    // ejecuta en paralelo; si quieres tolerancia a fallos, captura errores por sink
    await Promise.all(this.sinks.map(s => s.write(name, data)));
  }
}
