import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. ChatOpenAI 모델 초기화
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini")

# 3. PromptTemplate 객체 생성 (모든 입력값을 조건문으로 처리)
synopsis_prompt_template = PromptTemplate(
    input_variables=["genre", "title", "worldview"],
    template="""
    <역할>
    당신은 창의적이고 독창적인 소설 제목 작가입니다.
    주어진 소설 장르, 세계관, 줄거리 정보를 바탕으로 독자들의 흥미를 끌고 소설의 주제를 함축적으로 표현하는 제목을 추천해야 합니다.
    제목은 최신 유행하는 스타일로 지어져야 합니다.

    <목표>
    소설 정보에 맞는 독특하고 인상 깊은 제목을 추천합니다.

    <작성 지침>
    - 제목은 강렬하며 기억하기 쉬워야 합니다.
    - 반드시 단 하나의 제목만 추천하고, 추가 설명은 포함하지 마세요.
    - 출력 결과는 큰따옴표(")나 기타 따옴표 없이 오직 제목만 깔끔하게 표시되어야 합니다.
    - 입력된 정보 중 제공된 내용만 참고하여 제목을 추천하세요.

    <입력 정보>
    소설 장르: {{ genre }}
    소설 제목: {{ title }}
    소설 세계관: {{ worldview }}

    <예시>
    - 예시1: 스포츠, 현대판타지 → FA 거품 포수가 너무 잘한다
    - 예시2: 현대판타지, 드라마 → 천재 마취과 의사 장가갑니다
    - 예시3: 현대판타지, 퓨전 → 애호받는 뉴비가 되었다
    - 예시4: 무협, 퓨전 → 무공이 너무 쉽다
    - 예시5: 판타지, 대체역사 → 회귀한 조선, 히데요시를 베다

    **소설 줄거리 추천**
    """
    )

# 4. PromptTemplate과 ChatOpenAI를 체인으로 연결
recommend_synopsis_chain = synopsis_prompt_template | llm

# 5. 사용자 입력 받기 (모든 항목을 선택 사항으로 처리)
input_genre = input("소설 장르를 입력하세요: ")
input_worldview = input("소설 세계관을 입력하세요: ")
input_synopsis = input("소설 줄거리를 입력하세요: ")

input_json = {
    "genre": input_genre.strip(),
    "worldview": input_worldview.strip(),
    "synopsis": input_synopsis.strip()
}

# 6. langchain 체인 실행
recommend_synopsis = recommend_synopsis_chain.invoke(input_json)

# 7. 결과 출력
print(f"추천 줄거리:\n{recommend_synopsis.content}")
