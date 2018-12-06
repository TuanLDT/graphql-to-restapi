const presets = [
  [
    "@babel/env",
    {
      targets: {
        node: "current"
      },
      useBuiltIns: "usage",
    },
  ],
];

const plugins = [
	'@babel/plugin-proposal-class-properties',
  ["@babel/plugin-transform-runtime", {
    "corejs": false,
    "helpers": true,
    "regenerator": true,
    "useESModules": false
  }]
];

module.exports = { presets, plugins };