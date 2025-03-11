/**
 * VideoOptimizer.ts - Utilities for optimizing video streams
 * 
 * This module provides functions to optimize video streams for minimal file size
 * while maintaining enough quality for LLM analysis.
 */

/**
 * Processes a MediaStream to optimize it for smaller file sizes
 * 
 * @param inputStream The original screen capture MediaStream
 * @returns A new optimized MediaStream or the original if optimization failed
 */
export const optimizeVideoStream = async (inputStream: MediaStream): Promise<MediaStream> => {
  try {
    // Extract video and audio tracks
    const videoTrack = inputStream.getVideoTracks()[0];
    
    if (!videoTrack) {
      console.warn("No video track found in stream to optimize");
      return inputStream;
    }
    
    // Get the capabilities of the track (may not be supported in all browsers)
    if (!('getCapabilities' in videoTrack)) {
      console.warn("Video track capabilities API not supported");
      return inputStream;
    }
    
    try {
      // Apply the most aggressive constraints possible
      const constraints = {
        width: { ideal: 960 },     // Even lower resolution (960x540)
        height: { ideal: 540 },
        frameRate: { ideal: 10 },  // Very low frame rate, should be ok for screen content
      };
      
      await videoTrack.applyConstraints(constraints);
      console.log("Applied aggressive optimization constraints to video track");
    } catch (e) {
      console.warn("Failed to apply aggressive constraints:", e);
      // Continue with original track
    }
    
    // Return the modified stream (tracks are modified in-place)
    return inputStream;
  } catch (error) {
    console.error("Error in video stream optimization:", error);
    // Return the original stream as fallback
    return inputStream;
  }
};

/**
 * Process a video blob to potentially reduce its size even further
 * 
 * @param blob Original recording blob
 * @returns Processed blob (possibly smaller)
 */
export const processVideoBlob = async (blob: Blob): Promise<Blob> => {
  try {
    // Check if the blob is already small enough
    const sizeMB = blob.size / (1024 * 1024);
    
    // If the recording is already small, no need for additional processing
    if (sizeMB < 1) {
      console.log(`Recording is already small (${sizeMB.toFixed(2)}MB), skipping additional processing`);
      return blob;
    }
    
    // For larger recordings, we can do simple optimization
    // For now, we'll just repack the blob with the same type
    // In the future, this function could be enhanced with more advanced compression
    
    // Create URL from the blob
    const url = URL.createObjectURL(blob);
    
    // Return a promise that resolves when processing is complete
    return new Promise((resolve, reject) => {
      // Clean up function to release resources
      const cleanup = () => {
        URL.revokeObjectURL(url);
      };
      
      try {
        // For now, just return the original blob
        // This is a placeholder for future implementation of more advanced compression
        resolve(blob);
        cleanup();
      } catch (error) {
        console.error("Error processing video blob:", error);
        cleanup();
        // In case of error, return the original blob
        resolve(blob);
      }
    });
  } catch (error) {
    console.error("Error in processVideoBlob:", error);
    // Return the original blob as fallback
    return blob;
  }
};

/**
 * Advanced configuration settings for recording
 * This can be used to centralize all optimization settings in one place
 */
export const optimizationSettings = {
  // Stream capture settings
  stream: {
    video: {
      width: { ideal: 960 },
      height: { ideal: 540 },
      frameRate: { ideal: 10 }
    }
  },
  
  // MediaRecorder settings
  recorder: {
    preferredMimeTypes: [
      'video/webm;codecs=vp9,opus', // Most efficient combination
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ],
    videoBitsPerSecond: 500000, // 500 kbps
    audioBitsPerSecond: 32000,  // 32 kbps
    timeslice: 2000 // 2 seconds
  }
}; 