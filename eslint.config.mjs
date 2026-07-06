import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import pluginI18nJson from 'eslint-plugin-i18n-json';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import * as path from 'path';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'**/*.test.{ts,tsx}',
			'*.d.ts',
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/coverage/**',
			'__tests__',
			'.vscode',
			'coverage',
			'docs',
			'cli',
			'eslint.config.mjs',
			'jest.config.js',
			'scripts/**/*.js',
			'.next/**',
			'postcss.config.mjs',
		],
	},
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	reactPlugin.configs.flat.recommended,
	reactPlugin.configs.flat['jsx-runtime'],
	{
		settings: {
			react: {
				version: 'detect',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			import: importPlugin,
			unicorn: pluginUnicorn,
			'unused-imports': pluginUnusedImports,
			prettier: prettierPlugin,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'no-console': 'warn',
			'react/jsx-no-useless-fragment': 'error',
			'react-hooks/exhaustive-deps': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/ban-ts-comment': 'error',
			'react/prop-types': 'off',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						['parent', 'sibling', 'index'],
						'object',
						'type',
					],
					pathGroups: [
						{
							pattern: 'react',
							group: 'builtin',
							position: 'before',
						},
						{
							pattern: '@/**',
							group: 'internal',
							position: 'after',
						},
					],
					pathGroupsExcludedImportTypes: ['react'],
					'newlines-between': 'never',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
			'unicorn/filename-case': ['off', { case: 'kebabCase', ignore: ['/android', '/ios'] }],
			'max-params': ['error', 10],
			'max-lines-per-function': ['error', 600],
			'react/display-name': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/destructuring-assignment': 'off',
			'react/require-default-props': 'off',
			'@typescript-eslint/comma-dangle': 'off',
			'@typescript-eslint/no-explicit-any': 'error',
			'import/prefer-default-export': 'off',
			'import/no-cycle': ['error', { maxDepth: '∞' }],
			'unused-imports/no-unused-imports': 'error',
			'@typescript-eslint/no-require-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'react/jsx-uses-react': 'error',
			'react/jsx-uses-vars': 'error',
			'prettier/prettier': ['error', { endOfLine: 'auto' }],
		},
	},

	{
		files: ['**/*.test.tsx'],
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},

	{
		files: ['src/translations/*.json'],
		plugins: [pluginI18nJson],
		rules: {
			'i18n-json/valid-message-syntax': [
				'error',
				{
					syntax: path.resolve('./scripts/i18next-syntax-validation.js'),
				},
			],
			'i18n-json/valid-json': 'error',
			'i18n-json/sorted-keys': [
				'error',
				{
					order: 'asc',
					indentSpaces: 2,
				},
			],
			'i18n-json/identical-keys': [
				'error',
				{
					filePath: path.resolve('./src/translations/en.json'),
				},
			],
		},
	},
	prettierConfig,
);
