import 'package:flutter_tts/flutter_tts.dart';

class TtsHelper {
  static final TtsHelper _instance = TtsHelper._internal();
  factory TtsHelper() => _instance;
  TtsHelper._internal();

  FlutterTts? _flutterTts;
  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      _flutterTts = FlutterTts();
      await _flutterTts?.setLanguage('en-US');
      await _flutterTts?.setSpeechRate(0.48);
      await _flutterTts?.setVolume(1.0);
      await _flutterTts?.setPitch(1.0);
      _isInitialized = true;
    } catch (e) {
      // Gracefully handle web/desktop/unsupported platforms
      _isInitialized = false;
    }
  }

  Future<void> speak(String text) async {
    if (!_isInitialized) await init();
    try {
      if (text.trim().isNotEmpty) {
        await _flutterTts?.stop();
        await _flutterTts?.speak(text);
      }
    } catch (_) {}
  }

  Future<void> stop() async {
    try {
      await _flutterTts?.stop();
    } catch (_) {}
  }
}
