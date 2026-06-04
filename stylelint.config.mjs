import { propertiesOrderRule } from './stylelint-properties-order.mjs'

/** @type {import('stylelint').Config} */
export default {
  customSyntax: 'postcss-scss',
  plugins: ['stylelint-order'],
  ignoreFiles: ['**/node_modules/**', '.nuxt/**', '.output/**', 'dist/**'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
  ],
  rules: {
    /** Порядок CSS-свойств — `stylelint-properties-order.mjs` */
    'order/properties-order': propertiesOrderRule,
    indentation: null,
    'custom-property-pattern': null,
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
  },
}
