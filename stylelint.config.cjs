module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-config-standard', 'stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
  rules: {
    'custom-property-empty-line-before': null,
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    'selector-class-pattern': null,
    'scss/no-global-function-names': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'input-placeholder', 'deep'],
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    'no-empty-source': null,
    'no-duplicate-selectors': null,
    'named-grid-areas-no-invalid': null,
    'number-max-precision': 6,
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    'keyframes-name-pattern': [
      '^([a-z][a-z0-9]*|slideInRight|slideInLeft)(-[a-z0-9]+)*$',
      {
        message: name => `Expected keyframe name "${name}" to be kebab-case`,
      },
    ],
  },
  ignoreFiles: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.html'],
};
