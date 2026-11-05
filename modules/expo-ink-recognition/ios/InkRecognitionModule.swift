import ExpoModulesCore
import MLKitDigitalInkRecognition

// CHƯA build / chạy thử trên iOS (môi trường làm việc không có Mac). Giữ cùng API với bản Android.
// Cần build qua Mac hoặc EAS Build; nếu ML Kit đổi chữ ký hàm thì sửa ở đây.
public class InkRecognitionModule: Module {
  private var recognizers: [String: DigitalInkRecognizer] = [:]
  private var models: [String: DigitalInkRecognitionModel] = [:]

  /// Mã app -> các mã BCP-47 thử lần lượt (ML Kit đặt tên tiếng Trung là zh-Hani-*).
  private func candidates(_ lang: String) -> [String] {
    switch lang.lowercased() {
    case "zh", "zh-cn", "zh-hans": return ["zh-Hani-CN", "zh-Hani", "zh-CN", "zh"]
    case "zh-tw", "zh-hant": return ["zh-Hani-TW", "zh-TW", "zh-Hani", "zh"]
    default: return [lang]
    }
  }

  private func model(for lang: String) -> DigitalInkRecognitionModel? {
    if let cached = models[lang] { return cached }
    for tag in candidates(lang) {
      if let identifier = try? DigitalInkRecognitionModelIdentifier(forLanguageTag: tag) {
        let model = DigitalInkRecognitionModel(modelIdentifier: identifier)
        models[lang] = model
        return model
      }
    }
    return nil
  }

  public func definition() -> ModuleDefinition {
    Name("ExpoInkRecognition")

    AsyncFunction("isSupported") { (lang: String) -> Bool in
      return self.model(for: lang) != nil
    }

    AsyncFunction("isModelDownloaded") { (lang: String) -> Bool in
      guard let model = self.model(for: lang) else { return false }
      return ModelManager.modelManager().isModelDownloaded(model)
    }

    // Tải model (cần mạng): chờ thông báo thành công / thất bại của ML Kit
    AsyncFunction("downloadModel") { (lang: String, promise: Promise) in
      guard let model = self.model(for: lang) else {
        promise.resolve(false)
        return
      }
      let manager = ModelManager.modelManager()
      if manager.isModelDownloaded(model) {
        promise.resolve(true)
        return
      }
      var observers: [NSObjectProtocol] = []
      let finish: (Bool) -> Void = { ok in
        observers.forEach { NotificationCenter.default.removeObserver($0) }
        observers.removeAll()
        promise.resolve(ok)
      }
      observers.append(NotificationCenter.default.addObserver(forName: .mlkitModelDownloadDidSucceed, object: nil, queue: .main) { note in
        if let m = note.userInfo?[ModelDownloadUserInfoKey.remoteModel.rawValue] as? DigitalInkRecognitionModel, m == model { finish(true) }
      })
      observers.append(NotificationCenter.default.addObserver(forName: .mlkitModelDownloadDidFail, object: nil, queue: .main) { note in
        if let m = note.userInfo?[ModelDownloadUserInfoKey.remoteModel.rawValue] as? DigitalInkRecognitionModel, m == model { finish(false) }
      })
      manager.download(model, conditions: ModelDownloadConditions(allowsCellularAccess: true, allowsBackgroundDownloading: true))
    }

    // strokes: mỗi nét là danh sách điểm [x, y, thời gian ms]; trả các ký tự đoán được, tốt nhất trước
    AsyncFunction("recognize") { (lang: String, strokes: [[[Double]]], width: Double, height: Double, preContext: String?, promise: Promise) in
      guard let model = self.model(for: lang) else {
        promise.reject("ERR_UNSUPPORTED", "Ngôn ngữ chưa hỗ trợ nhận dạng viết tay")
        return
      }
      let inkStrokes = strokes.map { stroke in
        Stroke(points: stroke.compactMap { p -> StrokePoint? in
          guard p.count >= 3 else { return nil }
          return StrokePoint(x: Float(p[0]), y: Float(p[1]), t: Int(p[2]))
        })
      }
      let ink = Ink(strokes: inkStrokes)
      let context = DigitalInkRecognitionContext(preContext: preContext ?? "", writingArea: WritingArea(width: Float(width), height: Float(height)))
      let recognizer: DigitalInkRecognizer
      if let cached = self.recognizers[lang] {
        recognizer = cached
      } else {
        recognizer = DigitalInkRecognizer.digitalInkRecognizer(options: DigitalInkRecognizerOptions(model: model))
        self.recognizers[lang] = recognizer
      }
      recognizer.recognize(ink: ink, context: context) { result, error in
        if let error = error {
          promise.reject("ERR_RECOGNIZE", error.localizedDescription)
        } else {
          promise.resolve((result?.candidates ?? []).map { $0.text })
        }
      }
    }
  }
}
