package expo.modules.inkrecognition

import com.google.mlkit.common.MlKitException
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.vision.digitalink.DigitalInkRecognition
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModel
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModelIdentifier
import com.google.mlkit.vision.digitalink.DigitalInkRecognizer
import com.google.mlkit.vision.digitalink.DigitalInkRecognizerOptions
import com.google.mlkit.vision.digitalink.Ink
import com.google.mlkit.vision.digitalink.RecognitionContext
import com.google.mlkit.vision.digitalink.WritingArea
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Nhận dạng nét viết tay (Google ML Kit Digital Ink). Ngôn ngữ truyền vào là mã app: zh, ja, ko... */
class InkRecognitionModule : Module() {
  private val recognizers = HashMap<String, DigitalInkRecognizer>()
  private val models = HashMap<String, DigitalInkRecognitionModel>()
  private val manager get() = RemoteModelManager.getInstance()

  /** Mã app -> các mã BCP-47 thử lần lượt (ML Kit đặt tên tiếng Trung là zh-Hani-*). */
  private fun candidates(lang: String): List<String> = when (lang.lowercase()) {
    "zh", "zh-cn", "zh-hans" -> listOf("zh-Hani-CN", "zh-Hani", "zh-CN", "zh")
    "zh-tw", "zh-hant" -> listOf("zh-Hani-TW", "zh-TW", "zh-Hani", "zh")
    else -> listOf(lang)
  }

  private fun modelFor(lang: String): DigitalInkRecognitionModel? {
    models[lang]?.let { return it }
    for (tag in candidates(lang)) {
      val id = try {
        DigitalInkRecognitionModelIdentifier.fromLanguageTag(tag)
      } catch (e: MlKitException) {
        null
      }
      if (id != null) {
        val model = DigitalInkRecognitionModel.builder(id).build()
        models[lang] = model
        return model
      }
    }
    return null
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoInkRecognition")

    // Ngôn ngữ này có model nhận dạng không (chưa chắc đã tải)
    AsyncFunction("isSupported") { lang: String -> modelFor(lang) != null }

    AsyncFunction("isModelDownloaded") { lang: String, promise: Promise ->
      val model = modelFor(lang)
      if (model == null) {
        promise.resolve(false)
      } else {
        manager.isModelDownloaded(model)
          .addOnSuccessListener { promise.resolve(it) }
          .addOnFailureListener { promise.resolve(false) }
      }
    }

    // Tải model (cần mạng, ~vài chục MB, 1 lần)
    AsyncFunction("downloadModel") { lang: String, promise: Promise ->
      val model = modelFor(lang)
      if (model == null) {
        promise.resolve(false)
      } else {
        manager.download(model, DownloadConditions.Builder().build())
          .addOnSuccessListener { promise.resolve(true) }
          .addOnFailureListener { promise.resolve(false) }
      }
    }

    // strokes: mỗi nét là danh sách điểm [x, y, thời gian ms]; trả các ký tự đoán được, tốt nhất trước
    AsyncFunction("recognize") { lang: String, strokes: List<List<List<Double>>>, width: Double, height: Double, preContext: String?, promise: Promise ->
      val model = modelFor(lang)
      if (model == null) {
        promise.reject("ERR_UNSUPPORTED", "Ngôn ngữ chưa hỗ trợ nhận dạng viết tay", null)
        return@AsyncFunction
      }
      val ink = Ink.builder()
      for (stroke in strokes) {
        val sb = Ink.Stroke.builder()
        for (p in stroke) {
          if (p.size >= 3) sb.addPoint(Ink.Point.create(p[0].toFloat(), p[1].toFloat(), p[2].toLong()))
        }
        ink.addStroke(sb.build())
      }
      val context = RecognitionContext.builder()
        .setPreContext(preContext ?: "")
        .setWritingArea(WritingArea(width.toFloat(), height.toFloat()))
        .build()
      val recognizer = recognizers.getOrPut(lang) {
        DigitalInkRecognition.getClient(DigitalInkRecognizerOptions.builder(model).build())
      }
      recognizer.recognize(ink.build(), context)
        .addOnSuccessListener { result -> promise.resolve(result.candidates.map { it.text }) }
        .addOnFailureListener { e -> promise.reject("ERR_RECOGNIZE", e.message ?: "Không nhận dạng được", e) }
    }

    OnDestroy {
      recognizers.values.forEach { it.close() }
      recognizers.clear()
    }
  }
}
