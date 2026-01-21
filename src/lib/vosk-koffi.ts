/**
 * Vosk Koffi Wrapper
 * 
 * A Koffi-based replacement for the vosk npm package that avoids ffi-napi
 * compilation issues. Uses the libvosk shared library directly.
 */

import koffi from 'koffi';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine library path based on platform
function getLibraryPath(): string {
   const platform = process.platform;
   const arch = process.arch;

   // Check for bundled library in vosk package
   const voskLibBase = path.resolve(__dirname, '../../node_modules/vosk/lib');

   if (platform === 'linux' && arch === 'x64') {
      const libPath = path.join(voskLibBase, 'linux-x86_64', 'libvosk.so');
      if (fs.existsSync(libPath)) return libPath;
   } else if (platform === 'darwin') {
      const libPath = path.join(voskLibBase, 'osx-universal', 'libvosk.dylib');
      if (fs.existsSync(libPath)) return libPath;
   } else if (platform === 'win32') {
      const libPath = path.join(voskLibBase, 'win64', 'vosk.dll');
      if (fs.existsSync(libPath)) return libPath;
   }

   // Fallback: check system library path
   if (platform === 'linux') {
      if (fs.existsSync('/usr/local/lib/libvosk.so')) return '/usr/local/lib/libvosk.so';
      if (fs.existsSync('/usr/lib/libvosk.so')) return '/usr/lib/libvosk.so';
   }

   throw new Error(`Could not find libvosk library for platform: ${platform}-${arch}`);
}

// Load the library
const libPath = getLibraryPath();
const lib = koffi.load(libPath);

// Define opaque pointer types
const VoskModelPtr = koffi.pointer('VoskModel', koffi.opaque());
const VoskRecognizerPtr = koffi.pointer('VoskRecognizer', koffi.opaque());

// Define the vosk C API functions
const vosk_model_new = lib.func('vosk_model_new', VoskModelPtr, ['str']);
const vosk_model_free = lib.func('vosk_model_free', 'void', [VoskModelPtr]);

const vosk_recognizer_new = lib.func('vosk_recognizer_new', VoskRecognizerPtr, [VoskModelPtr, 'float']);
const vosk_recognizer_set_words = lib.func('vosk_recognizer_set_words', 'void', [VoskRecognizerPtr, 'int']);
const vosk_recognizer_accept_waveform = lib.func('vosk_recognizer_accept_waveform', 'int', [VoskRecognizerPtr, koffi.pointer('void'), 'int']);
const vosk_recognizer_result = lib.func('vosk_recognizer_result', 'str', [VoskRecognizerPtr]);
const vosk_recognizer_partial_result = lib.func('vosk_recognizer_partial_result', 'str', [VoskRecognizerPtr]);
const vosk_recognizer_final_result = lib.func('vosk_recognizer_final_result', 'str', [VoskRecognizerPtr]);
const vosk_recognizer_free = lib.func('vosk_recognizer_free', 'void', [VoskRecognizerPtr]);

// Optional: Set log level (0 = no logs)
const vosk_set_log_level = lib.func('vosk_set_log_level', 'void', ['int']);
vosk_set_log_level(0);

/**
 * VoskModel class - compatible with the original vosk npm package API
 */
export class Model {
   private ptr: any;

   constructor(modelPath: string) {
      if (!fs.existsSync(modelPath)) {
         throw new Error(`Model path does not exist: ${modelPath}`);
      }
      this.ptr = vosk_model_new(modelPath);
      if (!this.ptr) {
         throw new Error(`Failed to load model from: ${modelPath}`);
      }
   }

   getPointer(): any {
      return this.ptr;
   }

   free(): void {
      if (this.ptr) {
         vosk_model_free(this.ptr);
         this.ptr = null;
      }
   }
}

/**
 * VoskRecognizer class - compatible with the original vosk npm package API
 */
export class Recognizer {
   private ptr: any;

   constructor(options: { model: Model; sampleRate: number }) {
      const { model, sampleRate } = options;
      this.ptr = vosk_recognizer_new(model.getPointer(), sampleRate);
      if (!this.ptr) {
         throw new Error('Failed to create recognizer');
      }
   }

   setWords(words: boolean): void {
      vosk_recognizer_set_words(this.ptr, words ? 1 : 0);
   }

   /**
    * Accept waveform data for recognition
    * @param data Buffer containing audio data (16-bit PCM, mono)
    * @returns true if a complete utterance was recognized
    */
   acceptWaveform(data: Buffer): boolean {
      const result = vosk_recognizer_accept_waveform(this.ptr, data, data.length);
      return result === 1;
   }

   /**
    * Get the current recognition result
    */
   result(): { text: string } {
      const json = vosk_recognizer_result(this.ptr);
      try {
         return JSON.parse(json);
      } catch {
         return { text: '' };
      }
   }

   /**
    * Get partial recognition result (while still processing)
    */
   partialResult(): { partial: string } {
      const json = vosk_recognizer_partial_result(this.ptr);
      try {
         return JSON.parse(json);
      } catch {
         return { partial: '' };
      }
   }

   /**
    * Get final recognition result (after all audio processed)
    */
   finalResult(): { text: string } {
      const json = vosk_recognizer_final_result(this.ptr);
      try {
         return JSON.parse(json);
      } catch {
         return { text: '' };
      }
   }

   free(): void {
      if (this.ptr) {
         vosk_recognizer_free(this.ptr);
         this.ptr = null;
      }
   }
}

export default { Model, Recognizer };
