import { writePackageJson, getBabelDependencies, copyTemplate } from '../../helpers';
import { Generator } from '../Generator';

const generator: Generator = async (packageManager, npmOptions, { storyFormat }) => {
  const [
    storybookVersion,
    actionsVersion,
    linksVersion,
    addonsVersion,
    tagLoaderVersion,
  ] = await packageManager.getVersions(
    '@storybook/riot',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addons',
    'riot-tag-loader'
  );

  copyTemplate(__dirname, storyFormat);

  const packageJson = packageManager.retrievePackageJson();

  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};

  const dependencies = [
    `@storybook/riot@${storybookVersion}`,
    `@storybook/addon-actions@${actionsVersion}`,
    `@storybook/addon-links@${linksVersion}`,
    `@storybook/addons@${addonsVersion}`,
  ];
  if (
    !packageJson.devDependencies['riot-tag-loader'] &&
    !packageJson.dependencies['riot-tag-loader']
  ) {
    dependencies.push(`riot-tag-loader@${tagLoaderVersion}`);
  }

  writePackageJson(packageJson);

  const babelDependencies = await getBabelDependencies(packageManager, packageJson);

  packageManager.addDependencies({ ...npmOptions, packageJson }, [
    ...dependencies,
    ...babelDependencies,
  ]);

  packageManager.addStorybookCommandInScripts();
};

export default generator;
