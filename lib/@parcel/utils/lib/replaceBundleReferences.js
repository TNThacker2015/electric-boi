"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceBundleReferences = replaceBundleReferences;
exports.replaceURLReferences = replaceURLReferences;

var _stream = require("stream");

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _url = _interopRequireDefault(require("url"));

var _ = require("../");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Replaces references to dependency ids with either:
 *   - in the case of an inline bundle, the packaged contents of that bundle
 *   - in the case of another bundle reference, the bundle's url from the publicUrl root
 *   - in the case of a url dependency that Parcel did not handle,
 *     the original moduleSpecifier. These are external requests.
 */
async function replaceBundleReferences({
  bundle,
  bundleGraph,
  contents,
  map,
  getInlineReplacement,
  getInlineBundleContents
}) {
  let replacements = new Map();

  for (let {
    dependency,
    bundleGroup
  } of bundleGraph.getBundleGroupsReferencedByBundle(bundle)) {
    let [entryBundle] = bundleGraph.getBundlesInBundleGroup(bundleGroup);

    if (entryBundle.isInline) {
      // inline bundles
      let packagedBundle = await getInlineBundleContents(entryBundle, bundleGraph);
      let packagedContents = (packagedBundle.contents instanceof _stream.Readable ? await (0, _.bufferStream)(packagedBundle.contents) : packagedBundle.contents).toString();
      let inlineType = (0, _nullthrows.default)(entryBundle.getMainEntry()).meta.inlineType;

      if (inlineType == null || inlineType === 'string') {
        replacements.set(dependency.id, getInlineReplacement(dependency, inlineType, packagedContents));
      }
    } else if (dependency.isURL) {
      // url references
      replacements.set(dependency.id, getURLReplacement(dependency, entryBundle));
    }
  }

  collectExternalReferences(bundle, replacements);
  return performReplacement(replacements, contents, map);
}

function replaceURLReferences({
  bundle,
  bundleGraph,
  contents,
  map
}) {
  let replacements = new Map();

  for (let {
    dependency,
    bundleGroup
  } of bundleGraph.getBundleGroupsReferencedByBundle(bundle)) {
    let [entryBundle] = bundleGraph.getBundlesInBundleGroup(bundleGroup);

    if (dependency.isURL && !entryBundle.isInline) {
      // url references
      replacements.set(dependency.id, getURLReplacement(dependency, entryBundle));
    }
  }

  collectExternalReferences(bundle, replacements);
  return performReplacement(replacements, contents, map);
}

function collectExternalReferences(bundle, replacements) {
  bundle.traverse(node => {
    if (node.type !== 'dependency') {
      return;
    }

    let dependency = node.value;

    if (dependency.isURL && !replacements.has(dependency.id)) {
      replacements.set(dependency.id, {
        from: dependency.id,
        to: dependency.moduleSpecifier
      });
    }
  });
}

function getURLReplacement(dependency, bundle) {
  var _bundle$target$public;

  let url = _url.default.parse(dependency.moduleSpecifier);

  url.pathname = (0, _nullthrows.default)(bundle.name);
  return {
    from: dependency.id,
    to: (0, _.urlJoin)((_bundle$target$public = bundle.target.publicUrl) !== null && _bundle$target$public !== void 0 ? _bundle$target$public : '/', _url.default.format(url))
  };
}

function performReplacement(replacements, contents, map) {
  let finalContents = contents;

  for (let {
    from,
    to
  } of replacements.values()) {
    // Perform replacement
    finalContents = finalContents.split(from).join(to);
  }

  return {
    contents: finalContents,
    // TODO: Update sourcemap with adjusted contents
    map
  };
}