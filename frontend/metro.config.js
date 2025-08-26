const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for CSS files (for NativeWind)
config.resolver.assetExts.push('css');

module.exports = config;