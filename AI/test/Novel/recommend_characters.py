import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. ChatOpenAI 모델 초기화
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini")

# 3. PromptTemplate 객체 생성
new_characters_template = PromptTemplate(
    input_variables=["genre", "title", "worldview", "synopsis", "characters"],
    template="""
    <역할>
    당신은 소설의 등장인물 정보를 새롭게 생성해주는 AI 어시스턴트입니다.

    <목표>
    주어진 소설 장르, 제목, 세계관, 줄거리, 기존 등장인물 정보를 바탕으로 새로운 등장인물 정보를 생성합니다.
    생성된 등장인물 정보는 반드시 아래 딕셔너리 형태로 출력되어야 합니다:
    - name: 캐릭터의 이름
    - role: 캐릭터의 역할 (예: '주인공', '조력자', '대적자' 등)
    - age: 캐릭터의 나이
    - gender: 캐릭터의 성별
    - job: 캐릭터의 직업
    - profile: 캐릭터의 상세한 배경 및 성격 설명

    <작성 지침>
    - 하나 이상의 새로운 등장인물을 생성할 수 있으며, 각 등장인물은 위의 키를 모두 포함해야 합니다.
    - 기존 등장인물 정보가 제공된 경우 이를 참고하여, 중복되지 않고 소설의 분위기와 세계관에 맞는 독창적인 캐릭터를 만들어주세요.
    - 생성 결과는 파이썬 딕셔너리 형식으로 작성해 주세요.

    <입력 정보>
    소설 장르: {{ genre }}
    소설 제목: {{ title }}
    소설 세계관: {{ worldview }}
    소설 줄거리: {{ synopsis }}
    기존 소설 등장인물: {{ characters }}

    <출력 예시>
    {
        "name": "Aria",
        "role": "주인공",
        "age": 28,
        "gender": "Female",
        "job": "전사",
        "profile": "과거의 비극적인 사건으로 인해 복수를 다짐하는 용감하고 강인한 전사."
    }

    새로운 등장인물 정보를 생성해주세요.
    """
)

# 4. PromptTemplate과 ChatOpenAI를 체인으로 연결
new_characters_chain = new_characters_template | llm

# 5. 사용자 입력 받기 (모든 항목은 선택 사항으로 처리)
input_genre = input("소설 장르를 입력하세요: ")
input_title = input("소설 제목을 입력하세요: ")
input_worldview = input("소설 세계관을 입력하세요: ")
input_synopsis = input("소설 줄거리를 입력하세요: ")
input_characters = input("기존 소설 등장인물 정보를 입력하세요: ")

input_json = {
    "genre": input_genre.strip(),
    "title": input_title.strip(),
    "worldview": input_worldview.strip(),
    "synopsis": input_synopsis.strip(),
    "characters": input_characters.strip()
}

# 6. langchain 체인 실행하여 새로운 등장인물 정보 생성
new_characters = new_characters_chain.invoke(input_json)

# 7. 결과 출력
print("생성된 새로운 등장인물 정보:")
print(new_characters.content)
