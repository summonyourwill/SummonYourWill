/**
 * @typedef {Object} MusicTrack
 * @property {string} id - UUID v4 identifier for the track.
 * @property {string} title - Human readable song title.
 * @property {string} filename - File name stored on disk.
 * @property {string} absPath - Encoded absolute file path (file:// URI).
 * @property {number} durationSec - Length of the track in seconds.
 * @property {string} addedAt - ISO timestamp when the track was added.
 * @property {boolean} builtIn - True if the track is bundled with the app.
 */

/**
 * @typedef {MusicTrack[]} MusicLibrarySnapshot
 */

module.exports = {};
