import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import util from 'util';

const execPromise = util.promisify(exec);

export type Language = 'c' | 'cpp' | 'java' | 'python';

interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    executionTimeMs: number;
}

export class ExecutionService {
    private static isLinux = os.platform() === 'linux';
    // Timeout of 5s for the execution
    private static TIMEOUT_SECONDS = 5;

    static async executeCode(language: Language, sourceCode: string, input: string): Promise<ExecutionResult> {
        const runId = crypto.randomUUID();
        const tmpDir = path.join(os.tmpdir(), `code-exec-${runId}`);
        
        try {
            fs.mkdirSync(tmpDir, { recursive: true });
            
            // Set up files
            const inputPath = path.join(tmpDir, 'input.txt');
            fs.writeFileSync(inputPath, input || '');

            let result: ExecutionResult;

            switch (language) {
                case 'c':
                    result = await this.executeC(tmpDir, sourceCode, inputPath);
                    break;
                case 'cpp':
                    result = await this.executeCpp(tmpDir, sourceCode, inputPath);
                    break;
                case 'java':
                    result = await this.executeJava(tmpDir, sourceCode, inputPath, runId);
                    break;
                case 'python':
                    result = await this.executePython(tmpDir, sourceCode, inputPath);
                    break;
                default:
                    throw new Error('Unsupported language');
            }

            return result;
        } finally {
            // Cleanup
            try {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            } catch (e) {
                console.error('Failed to cleanup temp dir', e);
            }
        }
    }

    private static getExecutionCommand(baseCmd: string): string {
        if (this.isLinux) {
            // Linux Production: Run as sandboxuser with limits
            // 256MB = 262144 KB
            return `sudo -u sandboxuser timeout ${this.TIMEOUT_SECONDS}s bash -c "ulimit -v 262144; ${baseCmd}"`;
        } else {
            // Windows/Mac Development: Run normally
            // child_process.exec handles the timeout in JS
            return baseCmd;
        }
    }

    private static async runProcess(cmd: string, tmpDir: string): Promise<ExecutionResult> {
        const startTime = Date.now();
        try {
            // We use child_process timeout as an extra safety measure (in JS land)
            const { stdout, stderr } = await execPromise(cmd, { 
                cwd: tmpDir, 
                timeout: (this.TIMEOUT_SECONDS + 1) * 1000 // Give OS timeout a chance first
            });
            const result: ExecutionResult = {
                success: true,
                output: stdout.trim(),
                executionTimeMs: Date.now() - startTime
            };
            if (stderr.trim()) result.error = stderr.trim();
            return result;
        } catch (error: any) {
            // Check if it was killed by timeout
            const isTimeout = error.killed || error.signal === 'SIGTERM' || error.code === 124; // 124 is standard timeout exit code
            return {
                success: false,
                output: error.stdout?.trim() || '',
                error: isTimeout ? 'Time Limit Exceeded (5 seconds)' : (error.stderr?.trim() || error.message),
                executionTimeMs: Date.now() - startTime
            };
        }
    }

    private static async executeC(tmpDir: string, sourceCode: string, inputPath: string): Promise<ExecutionResult> {
        const sourcePath = path.join(tmpDir, 'main.c');
        const outName = this.isLinux ? 'a.out' : 'a.exe';
        fs.writeFileSync(sourcePath, sourceCode);

        // Compile
        try {
            await execPromise(`gcc main.c -o ${outName}`, { cwd: tmpDir });
        } catch (err: any) {
            return { success: false, output: '', error: `Compilation Error:\n${err.stderr}`, executionTimeMs: 0 };
        }

        // Execute
        const cmd = this.isLinux ? this.getExecutionCommand(`./${outName} < input.txt`) : this.getExecutionCommand(`${outName} < input.txt`);
        return this.runProcess(cmd, tmpDir);
    }

    private static async executeCpp(tmpDir: string, sourceCode: string, inputPath: string): Promise<ExecutionResult> {
        const sourcePath = path.join(tmpDir, 'main.cpp');
        const outName = this.isLinux ? 'a.out' : 'a.exe';
        fs.writeFileSync(sourcePath, sourceCode);

        // Compile
        try {
            await execPromise(`g++ main.cpp -o ${outName}`, { cwd: tmpDir });
        } catch (err: any) {
            return { success: false, output: '', error: `Compilation Error:\n${err.stderr}`, executionTimeMs: 0 };
        }

        // Execute
        const cmd = this.isLinux ? this.getExecutionCommand(`./${outName} < input.txt`) : this.getExecutionCommand(`${outName} < input.txt`);
        return this.runProcess(cmd, tmpDir);
    }

    private static async executeJava(tmpDir: string, sourceCode: string, inputPath: string, runId: string): Promise<ExecutionResult> {
        // Java requires class name to match file name. We assume public class Main.
        const sourcePath = path.join(tmpDir, 'Main.java');
        fs.writeFileSync(sourcePath, sourceCode);

        // Compile
        try {
            await execPromise(`javac Main.java`, { cwd: tmpDir });
        } catch (err: any) {
            return { success: false, output: '', error: `Compilation Error:\n${err.stderr}`, executionTimeMs: 0 };
        }

        // Execute
        const cmd = this.isLinux ? this.getExecutionCommand(`java Main < input.txt`) : `java Main < input.txt`;
        return this.runProcess(cmd, tmpDir);
    }

    private static async executePython(tmpDir: string, sourceCode: string, inputPath: string): Promise<ExecutionResult> {
        const sourcePath = path.join(tmpDir, 'main.py');
        fs.writeFileSync(sourcePath, sourceCode);

        // Execute (python3 on linux, python on windows usually)
        const pyCmd = this.isLinux ? 'python3' : 'python';
        const cmd = this.isLinux ? this.getExecutionCommand(`${pyCmd} main.py < input.txt`) : `${pyCmd} main.py < input.txt`;
        return this.runProcess(cmd, tmpDir);
    }
}
