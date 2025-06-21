module.exports = {
  // 1) Use the ts-jest preset to let Jest compile & run .ts files
  preset: 'ts-jest',

  // 2) Tell Jest to emulate a Node.js environment (not a browser)
  testEnvironment: 'node',

  // 3) Which files Jest should consider “test files”
  testMatch: [
    '**/__tests__/**/*.ts',        // any .ts under a __tests__ folder
    '**/?(*.)+(spec|test).ts'      // OR any .spec.ts or .test.ts anywhere
  ]
};
