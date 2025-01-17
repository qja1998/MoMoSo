import requests
import json

url = "https://dapi.kakao.com/v3/search/book"

quertString = {'query':'어린왕자'}
header = {'Authorization' : ''}

response = requests.get(url, headers=header,params=quertString)
tokens = response.json()

print(response)
print(tokens)