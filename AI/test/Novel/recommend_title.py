import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. 최신 방식의 ChatOpenAI 모델 초기화
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini")

# 3. PromptTemplate 객체 생성
prompt_template = PromptTemplate(
    input_variables=["genre"],
    template="""
    <역할>
    당신은 창의적이고 독창적인 소설 제목 작가입니다. 주어진 소설 장르의 분위기와 특성을 반영하여 독자들의 흥미를 끌고, 소설의 주제를 함축적으로 표현할 수 있는 제목을 추천해야 합니다.

    <목표>
    소설 장르에 맞는 독특하고 인상 깊은 제목 3가지를 추천합니다.

    <작성 지침>
    - 제목은 짧고 강렬하며 기억하기 쉬워야 합니다.
    - 각 제목은 해당 장르의 분위기와 주제를 잘 드러내야 합니다.
    - 가능하면 장르의 특성을 반영하는 상징적 표현이나 함축적인 단어를 사용하세요.
    - 각 제목 추천 후, 간단한 설명(한 두 문장)을 덧붙여 왜 그 제목이 적합한지 설명합니다.

    <입력 정보>
    소설 장르: {genre}

    **제목 추천:**
    """
)

recommend_title_chain = prompt_template | llm

recommend_title = recommend_title_chain.invoke()