import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { Options } from '../../config/options.js';
import type { GeneratorLogger } from '../runtime/logger.js';

interface CommandRunnerResult {
    code: number;
    stdout: string;
    stderr: string;
    error?: Error;
}

type CommandRunner = (
    command: string,
    args: string[],
    cwd: string,
) => Promise<CommandRunnerResult>;

type PostProcessorName = 'eslint' | 'prettier';
type ExecutableResolver = (name: PostProcessorName, searchRoots: string[]) => string | null;

export async function runPostProcessors(
    options: Options,
    logger: GeneratorLogger,
    commandRunner: CommandRunner = defaultCommandRunner,
    executableResolver: ExecutableResolver = findLocalExecutable,
): Promise<void> {
    const outputDir = resolve(options.output);
    const commands: Array<{ enabled: boolean; name: PostProcessorName; args: string[] }> = [
        {
            enabled: options.runEslint,
            name: 'eslint',
            args: ['--fix', outputDir],
        },
        {
            enabled: options.runPrettier,
            name: 'prettier',
            args: ['--write', outputDir],
        },
    ];

    for (const command of commands) {
        if (!command.enabled) {
            continue;
        }

        const executable = executableResolver(command.name, [process.cwd(), outputDir]);
        if (!executable) {
            logger.warn(`Skipping ${command.name} post-processing because no local executable was found for the current workspace.`);
            continue;
        }

        const result = await commandRunner(executable, command.args, process.cwd());
        if (result.code === 0) {
            if (options.verbose && result.stdout.trim()) {
                logger.debug(result.stdout.trim());
            }
            continue;
        }

        const failureOutput = [result.stderr.trim(), result.stdout.trim()].filter(Boolean).join('\n');
        logger.warn(
            `Skipping ${command.name} post-processing because it could not run successfully on ${outputDir}.` +
                (failureOutput ? `\n${failureOutput}` : ''),
        );
    }
}

async function defaultCommandRunner(command: string, args: string[], cwd: string): Promise<CommandRunnerResult> {
    return new Promise((resolvePromise) => {
        const child = spawn(command, args, {
            cwd,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += String(chunk);
        });
        child.stderr.on('data', (chunk) => {
            stderr += String(chunk);
        });
        child.on('error', (error) => {
            resolvePromise({ code: 1, stdout, stderr, error, });
        });
        child.on('close', (code) => {
            resolvePromise({ code: code ?? 1, stdout, stderr, });
        });
    });
}

function findLocalExecutable(name: PostProcessorName, searchRoots: string[]): string | null {
    const candidates = new Set<string>();
    for (const root of searchRoots) {
        let current = resolve(root);
        while (true) {
            candidates.add(join(current, 'node_modules', '.bin', name));
            candidates.add(join(current, 'node_modules', '.bin', `${name}.cmd`));
            const parent = dirname(current);
            if (parent === current) {
                break;
            }
            current = parent;
        }
    }

    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}
