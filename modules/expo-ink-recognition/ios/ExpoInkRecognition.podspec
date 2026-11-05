Pod::Spec.new do |s|
  s.name           = 'ExpoInkRecognition'
  s.version        = '0.1.0'
  s.summary        = 'Nhận dạng nét viết tay trên máy (Google ML Kit Digital Ink)'
  s.description    = 'Module Expo cục bộ của Flashwise: nhận dạng viết tay cho zh / ja / ko'
  s.license        = 'MIT'
  s.author         = 'Flashwise'
  s.homepage       = 'https://github.com/'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.4'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleMLKit/DigitalInkRecognition'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,swift}'
end
