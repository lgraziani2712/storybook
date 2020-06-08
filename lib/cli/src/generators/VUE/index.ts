import {
  writePackageJson,
  getBabelDependencies,
  addToDevDependenciesIfNotPresent,
  copyTemplate,
} from '../../helpers';
import { StoryFormat } from '../../project_types';
import { Generator } from '../Generator';

const generator: Generator = async (packageManager, npmOptions, { storyFormat }) => {
  const packages = [
    '@storybook/vue',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addons',
    '@babel/core',
  ];
  if (storyFormat === StoryFormat.MDX) {
    packages.push('@storybook/addon-docs');
  }
  const versionedPackages = await packageManager.getVersionedPackages(...packages);

  copyTemplate(__dirname, storyFormat);

  const packageJson = packageManager.retrievePackageJson();

  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};

  const packageBabelCoreVersion =
    packageJson.dependencies['babel-core'] || packageJson.devDependencies['babel-core'];

  // This seems to be the version installed by the Vue CLI, and it is not handled by
  // installBabel below. For some reason it leads to the wrong version of @babel/core (a beta)
  // being installed
  if (packageBabelCoreVersion === '7.0.0-bridge.0') {
    addToDevDependenciesIfNotPresent(
      packageJson,
      '@babel/core',
      await packageManager.getVersion('@babel/core')
    );
  }

  writePackageJson(packageJson);

  const babelDependencies = await getBabelDependencies(packageManager, packageJson);
  packageManager.addDependencies({ ...npmOptions, packageJson }, [
    ...versionedPackages,
    ...babelDependencies,
  ]);

  packageManager.addStorybookCommandInScripts();
};

export default generator;
