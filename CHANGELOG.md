# Changelog

All notable changes to TaleForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **End Story Generation**: Fixed critical issue where "End Story" button was generating 3 additional chapters instead of 1 ending segment. Now properly creates a single concluding chapter with no continuation choices.
- **Save Button Functionality**: Fixed the Save button in story display which was not connected to any functionality. Now properly saves stories to user accounts or local storage for anonymous users.
- **Duplicate Audio Players**: Removed multiple conflicting audio player components that were playing simultaneously, causing audio conflicts during story playbook.
- **Slideshow Auto-Advance Timing**: Improved slideshow auto-advance to sync with actual audio narration duration instead of estimated reading time, providing a much better synchronized experience.

### Improved
- Enhanced user feedback for story saving with proper success/error messages
- Better audio synchronization in slideshow mode for immersive storytelling
- Streamlined audio player architecture to prevent conflicts

### Technical
- Consolidated audio player components to prevent simultaneous playback
- Improved slideshow timing algorithm using actual audio duration calculation
- Added proper error handling for story save operations
- Enhanced authentication integration for story ownership

---

## Previous Releases

*This changelog was created on January 10, 2025. Previous changes were not tracked in this format.*
