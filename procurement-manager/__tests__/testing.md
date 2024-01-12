# Welcome to Testing!

## The testing environment used is Jest since it has more documentations related to Next.js, React, and Prisma

To run: `npm run test` or `npm run test:watch` to keep re-running tests whenever a file is changed

## Ignore everything in the spec folder!

The spec folder was when I used Jasmine as the testing, and there are some testing files but all of the tests succeeded when some should have failed. Plus, Jest says more to the console as to what it is doing. Once everything is working, it can definitely be removed!

## Directory:

All the test files are found in the `__tests__` folder

Everything is similar to how the root directory is structured. For example, every test for APIs can be found in `pages/api`. You want to test functions inside `lib` or test componenets? Then put them in the `__tests__/lib` and `__tests__/components`, respectively. Every test file should be the name of the file and add `test.ts` to it. For APIs, the file should be named the API name + test.ts instead of index.ts

## Issues:

A lot of the tests that I wrote was from when I wrote them in Jasmine but I tried to add "mocking" in order for the tests to not make actual calls to the API and affect the database. I, unfortunately, had difficult with this so not every test is structured well. Your mission (if you choose to accept it) is to help us fix and create better unit/functional tests and if you ever have questions feel free to contact me too since I'll probably will learn more about it then!

## Resources:

- https://nextjs.org/docs/pages/building-your-application/testing/jest
- https://jestjs.io/
- https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing

Good luck and hope you learn as much as I did! - Isaac (Winter 2023)
