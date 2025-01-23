import os
import sys
import requests
import json

# 키와 URL 정의
key = ""
url = f"http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey={key}&QueryType=ItemNewAll&MaxResults=100" \
      "&start=1&SearchTarget=Book&output=js&Version=20131101&CategoryId=50993"

# request 보내기
response = requests.get(url)

# 받은 response를 json 타입으로 바꿔주기
response_json = json.loads(response.text)

# JSON 데이터를 파일로 저장
with open("response.json", "w", encoding="utf-8") as json_file:
    json.dump(response_json, json_file, indent=4, ensure_ascii=False)

print("JSON 데이터가 'response.json' 파일로 저장되었습니다.")
