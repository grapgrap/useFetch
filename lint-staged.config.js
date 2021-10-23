module.exports = {
  '{src,tests}/**/*.{js,ts,tsx}': ['eslint --config .eslintrc --fix'],
  '{src,tests}/**/*': ['prettier --write'],
};
