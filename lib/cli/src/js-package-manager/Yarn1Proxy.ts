import { sync, sync as spawnSync } from 'cross-spawn';
import { JsPackageManager } from './JsPackageManager';

export class Yarn1Proxy extends JsPackageManager {
  initPackageJson() {
    const results = spawnSync('yarn', ['init', '-y'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return results.stdout;
  }

  getRunStorybookCommand(): string {
    return 'yarn storybook';
  }

  protected runInstall(): { status: number } {
    return spawnSync('yarn', { stdio: 'inherit' });
  }

  protected runAddDeps(
    dependencies: string[],
    installAsDevDependencies: boolean
  ): { status: number } {
    const args = ['add', '--ignore-workspace-root-check', ...dependencies];

    if (installAsDevDependencies) {
      args.push('-D');
    }

    return spawnSync('yarn', args, { stdio: 'inherit' });
  }

  protected runGetVersions<T extends boolean>(
    packageName: string,
    fetchAllVersions: T
  ): Promise<T extends true ? string[] : string> {
    const commandResult = sync(
      'yarn',
      ['info', packageName, fetchAllVersions ? 'versions' : 'version', '--json'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe',
        encoding: 'utf-8',
      }
    );

    if (commandResult.status !== 0) {
      throw new Error(commandResult.stderr.toString());
    }

    try {
      const parsedOutput = JSON.parse(commandResult.stdout.toString());
      if (parsedOutput.type === 'inspect') {
        return parsedOutput.data;
      }
      throw new Error(`Unable to find versions of ${packageName} using yarn`);
    } catch (e) {
      throw new Error(`Unable to find versions of ${packageName} using yarn`);
    }
  }
}
