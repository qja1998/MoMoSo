import speech_recognition as sr
import os

# 디렉터리 경로 설정
directory_path = r"C:\Users\SSAFY\Desktop\please_webRTC\backend\audio_recordings\test"

# 인식기 초기화
r = sr.Recognizer()

# 변환된 텍스트를 저장할 디렉터리
output_directory = os.path.join(directory_path, "transcriptions")
os.makedirs(output_directory, exist_ok=True)

# 디렉터리 내 모든 .wav 파일 처리
for filename in os.listdir(directory_path):
    if filename.endswith(".wav"):
        file_path = os.path.join(directory_path, filename)
        print(f"처리 중인 파일: {file_path}")
        
        try:
            with sr.AudioFile(file_path) as source:
                r.adjust_for_ambient_noise(source, duration=1)
                audio_data = r.record(source)
                text = r.recognize_google(audio_data, language='ko-KR')

                # 텍스트를 파일로 저장
                output_file = os.path.join(output_directory, f"{filename}.txt")
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(text)
                print(f"텍스트 저장 완료: {output_file}")

        except sr.UnknownValueError:
            print(f"음성을 인식할 수 없습니다: {filename}")
        except sr.RequestError as e:
            print(f"Google 음성 인식 서비스에서 결과를 요청할 수 없습니다: {e}")
        except Exception as e:
            print(f"파일 처리 중 오류 발생: {e}")

