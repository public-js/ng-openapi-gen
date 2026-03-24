export type DiagnosticLevel = 'debug' | 'info' | 'warn' | 'error';

export interface DiagnosticEntry {
    level: DiagnosticLevel;
    message: string;
}

export class GeneratorLogger {
    public readonly diagnostics: DiagnosticEntry[] = [];

    constructor(private readonly verbose: boolean) {}

    public debug(message: string): void {
        this.record('debug', message, this.verbose);
    }

    public info(message: string): void {
        this.record('info', message, true);
    }

    public warn(message: string): void {
        this.record('warn', message, true);
    }

    public error(message: string): void {
        this.record('error', message, true);
    }

    private record(level: DiagnosticLevel, message: string, writeToConsole: boolean): void {
        this.diagnostics.push({ level, message });
        if (!writeToConsole) {
            return;
        }
        switch (level) {
            case 'debug':
                console.debug(message);
                break;
            case 'info':
                console.info(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            case 'error':
                console.error(message);
                break;
        }
    }
}
