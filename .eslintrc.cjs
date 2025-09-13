module.exports = {
  extends: ['./eslint.config.mjs'],
  rules: {
    // Evitar console.log en prod; permitir warn/error
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
