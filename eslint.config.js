import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';

// Lint only; there is no formatter. Tabs, single quotes, semicolons, by hand.
export default ts.config(
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'eslint.config.js',
			'node_modules/',
			'drizzle/',
			'static/',
			'package-lock.json',
			'test-results/'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: { parser: ts.parser, svelteConfig }
		}
	},
	{
		// A rejected promise nobody holds ends the node process.
		files: ['**/*.ts'],
		ignores: ['drizzle.config.ts'],
		languageOptions: { parserOptions: { projectService: true } },
		rules: {
			'@typescript-eslint/no-floating-promises': 'error'
		}
	},
	{
		files: ['scripts/**/*.mjs'],
		languageOptions: { globals: globals.node }
	},
	{
		rules: {
			// TypeScript already resolves globals; no-undef only misfires on typed files.
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		rules: {
			// A bare expression in `$effect` is how Svelte 5 declares a dependency.
			'@typescript-eslint/no-unused-expressions': 'off',
			// No `base` path is configured, so resolve() would be a no-op on every link.
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/prefer-svelte-reactivity': 'off',
			'svelte/prefer-writable-derived': 'off'
		}
	}
);
