const babel = require('@babel/core');

const res = babel.transformSync(`class Foo {}`, {
    plugins: [
        '@babel/plugin-transform-classes',
    ],
    filename: 'test.js',
    babelrc: false,
});

console.log(res)