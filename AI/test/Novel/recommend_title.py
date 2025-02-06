import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. ChatOpenAI 모델 초기화
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini")

# 3. PromptTemplate 객체 생성
prompt_template = PromptTemplate(
    input_variables=["genre"],
    template="""
    <역할>
    당신은 창의적이고 독창적인 소설 제목 작가입니다. 주어진 소설 장르의 분위기와 특성을 반영하여 독자들의 흥미를 끌고, 소설의 주제를 함축적으로 표현할 수 있는 제목을 추천해야 합니다.

    <목표>
    소설 장르에 맞는 독특하고 인상 깊은 제목을 추천합니다.

    <작성 지침>
    - 제목은 강렬하며 기억하기 쉬워야 합니다.
    - 반드시 단 하나의 제목만 추천하며, 그 외의 추가 설명이나 정보는 포함하지 마세요.
    - 출력 결과는 큰따옴표(")나 그 외의 따옴표 없이 오직 제목만 깔끔하게 표시되어야 합니다.
    - 예시:
      - 예시1: 스포츠, 현대판타지 장르 → FA 거품 포수가 너무 잘한다
      - 예시2: 현대판타지, 드라마 장르 → 천재 마취과 의사 장가갑니다
      - 예시3: 현대판타지, 퓨전 장르 → 애호받는 뉴비가 되었다
      - 예시4: 무협, 퓨전 장르 → 무공이 너무 쉽다
      - 예시5: 판타지, 대체역사 → 회귀한 조선, 히데요시를 베다
    - 각 제목은 해당 장르의 분위기와 주제를 잘 드러내는 단어를 사용하세요.
    - 독자가 흥미를 가질만한 내용을 포함하여 제목을 추천하세요.

    <입력 정보>
    소설 장르: {genre}

    <예시>


    **제목 추천**
    """
)

# 4. PromptTemplate과 ChatOpenAI를 체인으로 연결
recommend_title_chain = prompt_template | llm

# 5. 장르 입력
input_genre = input("소설 장르를 입력하세요: ")

# 6. input값으로 langchain 체인 실행
recommend_title = recommend_title_chain.invoke(input_genre)

# 7. 결과 출력
print(f"추천 제목: {recommend_title.content}")