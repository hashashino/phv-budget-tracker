const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure Metro to support TypeScript and resolve path aliases
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@types': path.resolve(__dirname, 'src/types'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@store': path.resolve(__dirname, 'src/store'),
  '@assets': path.resolve(__dirname, 'assets'),
};

// Configure asset extensions for images and other media
config.resolver.assetExts.push(
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Audio/Video
  'mp3',
  'mp4',
  'mov',
  'avi',
  // Documents
  'pdf',
  'doc',
  'docx'
);

// Configure source extensions for TypeScript
config.resolver.sourceExts.push('tsx', 'ts', 'jsx', 'js', 'json');

// Configure transformer for SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Performance optimizations
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  compress: {
    drop_console: true, // Remove console.log in production
  },
};

// Enable experimental features for better performance
config.transformer.experimentalImportSupport = false;
config.transformer.inlineRequires = true;

module.exports = config;