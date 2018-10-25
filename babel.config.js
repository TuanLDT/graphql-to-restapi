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
	'@babel/plugin-proposal-class-properties'
];

module.exports = { presets, plugins };