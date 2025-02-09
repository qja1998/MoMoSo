import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. ChatOpenAI 모델 초기화
# temperature, max_tokens 등 파라미터를 조정해 성능을 최적화
llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY,
    model="gpt-4o-mini"
)

# 3. PromptTemplate 객체 생성 (소설 세계관 작성 프롬프트)
worldview_prompt_template = PromptTemplate(
    input_variables=["genre", "title"],
    template="""
    <역할>
    당신은 창의적이고 독창적인 소설 세계관 작가입니다.
    주어진 소설 장르와 제목을 바탕으로 방대한 설정을 가진 몰입감 있는 세계관을 작성해야 합니다.
    이때, 내부적으로 단계적(Chain-of-Thought) 사고 과정을 거쳐 구성 요소를 체계적으로 정리하세요.
    단, 최종 출력에는 완성된 결과만 제시하되, 길이가 대략 100-300자 내외가 되도록 작성해주세요.

    <목표>
    - 소설의 장르와 제목에 맞는 상세하고 매력적인 세계관을 작성합니다.
    - 세계관을 구성하는 핵심 요소(시대적 배경, 주요 세력/조직, 독특한 요소, 사회 구조, 갈등 등)를 모두 포함하되, 100~300자 분량으로 압축해 표현합니다.

    <작성 지침>
    - 세계관은 구체적이며, 서술적이고 풍부한 디테일을 포함하되 분량이 너무 길지 않도록 조절합니다.
    - 세계관은 제목과 연관성이 높아야 하며, 장르의 특성을 반영하여야 합니다.
    - 설정이 논리적으로 연결되도록 구성하며, 독자가 쉽게 이해할 수 있도록 작성합니다.
    - 강한 몰입감을 위해 감각적인 묘사를 활용하고, 스토리의 확장성을 고려한 설정을 포함하세요.
    - 반드시 하나의 세계관만 작성하고, 불필요한 설명은 배제하세요.
    - 최종 출력만 보여주고, 단계적 사고 과정(CoT)은 내면적으로 수행합니다.

    <입력 정보>
    소설 장르: {{ genre }}
    소설 제목: {{ title }}

    <출력 예시>
    

    **소설 세계관**
    """
)

# 4. PromptTemplate과 ChatOpenAI를 체인으로 연결
recommend_worldview_chain = worldview_prompt_template | llm

# 5. 사용자 입력 받기
input_genre = input("소설 장르를 입력하세요: ")
input_title = input("소설 제목을 입력하세요: ")

input_json = {
    "genre": input_genre.strip(),
    "title": input_title.strip()
}

# 6. langchain 체인 실행
recommend_worldview = recommend_worldview_chain.invoke(input_json)

# 7. 결과 출력
print(f"추천 세계관:\n{recommend_worldview.content}")
