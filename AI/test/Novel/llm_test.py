import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. ChatOpenAI 모델 초기화
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini")

# ── Step 1: 초기 제목 생성 ──
draft_title_template = PromptTemplate(
    input_variables=["genre"],
    template="""
<역할>
당신은 창의적인 소설 제목 작가입니다.
주어진 소설 장르, 세계관, 줄거리 정보를 바탕으로 기본적인 제목 아이디어를 생성하세요.

<작성 지침>
- 주어진 정보를 함축하면서도 독자들의 흥미를 끌 수 있는 제목을 추천합니다.
- 구체적인 느낌은 예시를 참고하세요.

<예시>
- 예시1: 스포츠, 현대판타지 → FA 거품 포수가 너무 잘한다
- 예시2: 현대판타지, 드라마 → 천재 마취과 의사 장가갑니다
- 예시3: 현대판타지, 퓨전 → 애호받는 뉴비가 되었다
- 예시4: 무협, 퓨전 → 무공이 너무 쉽다
- 예시5: 판타지, 대체역사 → 회귀한 조선, 히데요시를 베다

<입력 정보>
소설 장르: {{ genre }}

**초기 제목 생성**
"""
)

# ── Step 2: 제목 개선 ──
refine_title_template = PromptTemplate(
    input_variables=["draft_title"],
    template="""
<역할>
당신은 전문 소설 제목 개선가입니다.
아래 초안 제목을 받아 최신 유행하는 스타일과 독창성을 반영하여 더욱 인상 깊은 제목으로 개선하세요.

<작성 지침>
- 제목은 사람들의 기억에 강렬하게 남아야 하고, 비유적인 표현을 넣어야 합니다.
- 추가 설명 없이 제목만 출력하세요.

<초안 제목>
{{ draft_title }}

**제목 개선**
"""
)

# ── Step 3: 최종 제목 확정 ──
polish_title_template = PromptTemplate(
    input_variables=["refined_title"],
    template="""
<역할>
당신은 최종 소설 제목 검토자입니다.
아래 개선된 제목을 받아, 문법과 스타일, 가독성을 최종 점검한 후 완벽한 제목을 확정하세요.

<작성 지침>
- 최종 제목은 추가 설명 없이 제목만 깔끔하게 출력합니다.

<개선된 제목>
{{ refined_title }}

**최종 제목 확정**
""",
    template_format="jinja2"
)

# ── 사용자 입력 받기 (모든 항목은 선택 사항) ──
input_genre = input("소설 장르를 입력하세요: ")

input_data = {
    "genre": input_genre.strip()
}

# ── Step 1: 초기 제목 생성 ──
draft_title_result = llm.invoke(draft_title_template.format(**input_data))
draft_title = draft_title_result.content.strip()
print(draft_title)

# ── Step 2: 제목 개선 ──
refined_title_result = llm.invoke(refine_title_template.format(draft_title=draft_title))
refined_title = refined_title_result.content.strip()
print(refined_title)

# ── Step 3: 최종 제목 확정 ──
final_title_result = llm.invoke(polish_title_template.format(refined_title=refined_title))
final_title = final_title_result.content.strip()

# ── 최종 결과 출력 ──
print("최종 추천 제목:")
print(final_title)
