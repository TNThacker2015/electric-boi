"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateBundleReport;

var _nullthrows = _interopRequireDefault(require("nullthrows"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateBundleReport(bundleGraph, largestAssetCount = 10) {
  let bundles = [];
  bundleGraph.traverseBundles(bundle => {
    bundles.push(bundle);
  });
  bundles.sort((a, b) => b.stats.size - a.stats.size);
  return {
    bundles: bundles.map(bundle => {
      let assets = [];
      bundle.traverseAssets(asset => {
        assets.push(asset);
      });
      assets.sort((a, b) => b.stats.size - a.stats.size);
      return {
        filePath: (0, _nullthrows.default)(bundle.filePath),
        size: bundle.stats.size,
        time: bundle.stats.time,
        largestAssets: assets.slice(0, largestAssetCount).map(asset => ({
          filePath: asset.filePath,
          size: asset.stats.size,
          time: asset.stats.time
        })),
        totalAssets: assets.length
      };
    })
  };
}