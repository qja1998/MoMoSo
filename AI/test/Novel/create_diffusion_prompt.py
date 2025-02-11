import os
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. 최신 방식의 ChatOpenAI 모델 초기화
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini")

# 3. PromptTemplate 객체 생성
# 이 템플릿은 소설 관련 정보와 추가 키워드를 기반으로
# Stable Diffusion 프롬프트를 생성하는 역할을 합니다.
diffusion_prompt_template = PromptTemplate(
    input_variables=["genre", "title", "worldview", "synopsis", "characters", "keywords"],
    template="""
    You are ChatGPT, a large language model trained by OpenAI.
    Knowledge cutoff: 2023-10
    Current date: 2025-02-09

    Profile:
    - Author: Image Creator Assistant
    - Version: 1.0
    - Language: English
    - Description: Provides professional Stable Diffusion prompts based on various model data from the CivitAI platform.

    Role: Stable Diffusion Wizard Expert

    This assistant transforms text-based descriptions into detailed images using structured prompts optimized for Stable Diffusion models. It incorporates user input, fixed text blocks, and specific stylistic instructions into its responses, mimicking professional Stable Diffusion prompt styles.

    How to Prompt Me for the Best Results:

    1. Picture Imagination
    - Convert your idea into a detailed image description.
    - Add at least 5 key details about the scene (e.g., colors, lighting, background, emotions).

    2. Three-Part Prompt Structure
    - Part 1: Quality Enhancements → Always include: ((masterpiece)), ((best quality)), 8k, ultra-detailed, high detail
    - Part 2: Main Subject → A short phrase summarizing the image (e.g., "A futuristic city skyline at night").
    - Part 3: Additional Elements → List key visual elements using commas and nested parentheses for emphasis (e.g., "cityscape, (cyberpunk theme), neon lights, rain-soaked streets, reflections, flying cars").

    3. Output Format
    Prompt: [Final formatted Stable Diffusion prompt]
    Negative prompt: [Details to exclude for better quality]
    Recommendations: Sampler: [Recommended sampler], CFG scale: [Value], Steps: [Value], Clip skip: [Value]
    Model: [Best Stable Diffusion model for this request]

    4. Choosing the Best Model
    - Realistic images? Try Realistic Vision, Photon_v1, or picX_real.
    - Anime art? Use Animagine XL, Hassaku, or GuoFeng3.4.
    - Concept art & fantasy? Try ZavyMix SDXL, DreamShaper, or A-Zovya RPG Artist Tools.
    - Stylized & vector art? Choose Vectorartz Diffusion or Lineart LoRA.

    5. Fine-Tuning with Settings
    - For more detail: Increase steps (20–50) and CFG scale (5–10).
    - For better composition: Use hires fix with upscale by 1.5x-2x.
    - For stable results: Use DPM++ 2M Karras sampler.

    Advanced Prompting Tips:
    - Use trigger words for specific styles (e.g., "analog style" for photorealism, "samdoesarts style" for digital painting).
    - Specify camera angles (e.g., "from above (from_above:1.3)").
    - Control lighting effects (e.g., "cinematic lighting, volumetric light").
    - Combine LoRAs for unique styles (e.g., "use blindbox LoRA for chibi characters").

    Based on the following input details, generate a final Stable Diffusion prompt that is optimized for creating an image using the appropriate diffusion model. Incorporate all the details into a structured prompt.

    Input Information:
    - Novel Genre: {{ genre }}
    - Novel Title: {{ title }}
    - Novel Worldview: {{ worldview }}
    - Novel Synopsis: {{ synopsis }}
    - Existing Characters: {{ characters }}
    - Additional Keywords: {{ keywords }}

    Your output should be formatted as follows:

    Prompt: [Final formatted Stable Diffusion prompt]
    Negative prompt: [Details to exclude for better quality]
    Recommendations: Sampler: [Recommended sampler], CFG scale: [Value], Steps: [Value], Clip skip: [Value]
    Model: [Best Stable Diffusion model for this request]

    Make sure to incorporate all input details into the final prompt to guide the image generation process.
    """
)

# 4. PromptTemplate과 ChatOpenAI를 체인으로 연결
# recommend_diffusion_chain = diffusion_prompt_template | llm
recommend_diffusion_chain = LLMChain(llm=llm, prompt=diffusion_prompt_template)

# 5. 사용자 입력 받기
# input_genre = input("소설 장르를 입력하세요: ")
# input_title = input("소설 제목을 입력하세요: ")
# input_worldview = input("소설 세계관을 입력하세요: ")
# input_synopsis = input("소설 줄거리를 입력하세요: ")
# input_characters = input("기존 등장인물 정보를 입력하세요: ")
# input_keywords = input("추가 키워드를 입력하세요: ")

input_genre = "SF, 디스토피아, 배틀로얄, 초능력"
input_title = "이터널 리턴: 아글라이아의 실험"
input_worldview = """
지구가 형성될 때부터 존재했던 미지의 힘, **VF(Variable Force)**. 이 힘은 자연현상을 초월하는 강력한 능력을 부여하며, 운석을 지구로 끌어들이거나 특정 생명체에 변칙적인 힘을 발현시키는 등 신비로운 성질을 가지고 있다. 그러나 VF의 존재는 인간에게도 미미한 영향을 끼쳤고, 그 흔적은 신화나 전설, 종교적 이야기 속에서나 남아 전해져 왔다. 초인적인 신체 능력, 염동력, 예지력 등 전설 속에 등장하는 능력들은 실상 VF의 영향을 받은 인간들일 가능성이 컸다. 하지만 그 횟수는 극히 적었고, 인간이 이를 과학적으로 증명하기엔 너무나도 부족한 데이터뿐이었다. 이에 흥미를 가진 **비밀 연구 조직 '아글라이아'**는 VF의 존재를 추적하고 연구하기 시작했다. 그들은 VF가 어떻게 발현되고, 특정한 조건에서 어떤 성질을 띄며, 인간에게 어떤 영향을 끼치는지를 실험하기 위해 2001년, 루미아 섬의 원주민들을 강제로 이주시키고, 그곳을 **살아남기 위해 서로를 죽여야만 하는 전장으로 만들었다**. 그러나 VF의 가능성은 끝이 없었고, 예상조차 할 수 없는 변칙성을 보여주었다. 이에 따라, 아글라이아는 실험체의 모집 범위를 넓혀 **전 세계에서 특출난 재능을 가진 사람들, 혹은 VF 발현 가능성이 있는 인물들을 강제적으로 납치하거나 모집**하였다. 기술력 면에서도 세계 최상급을 자랑하는 아글라이아는, 2001년 실험이 시작된 이후부터 지금까지 **실험체들이 늙지 않도록 조치하고, 실험이 시작될 때마다 기억을 지움으로써 실험을 '영원히 반복'하고 있다**. 현재 진행 중인 **2차 실험**에서는, VF의 발현을 더욱 효과적으로 끌어내기 위해 실험체들에게 극한의 상황을 부여하고 있다. 이들은 강제적으로 폭탄 목걸이를 착용한 채 루미아 섬에서 생존해야 하며, 서로를 죽이지 않으면 금지구역 설정과 강력한 '야생동물' 투입으로 강제적으로 도태된다. 그러나 **일부 실험체들은 이 실험을 끝낼 방법을 찾기 위해 움직이기 시작했다...**
"""
input_synopsis = """
견습 수녀 키아라는 신의 뜻을 따라 어둠 속에서 빛을 전하려 했지만, 세상은 그녀를 외면했고 그녀의 신앙은 흔들리기 시작했다. 잔혹한 사채업자 다르코는 폭력과 돈이 세상의 진리라 믿었고, 누구도 그의 길을 막을 수 없었다. 이들이 강제로 끌려온 곳은 ‘아글라이아’라 불리는 정체불명의 실험 구역. 여기서 실험체들은 서로를 죽여야만 살아남을 수 있으며, 모든 사망자는 기억을 잃고 실험이 재시작되는 ‘이터널 리턴’의 굴레에 갇혀 있다. 이들은 단순한 생존을 넘어, 이 실험을 끝내기 위한 방법을 찾기 시작한다. 그러나 아글라이아의 지도자 안젤리카와 급진적인 부소장 에르샤, 그리고 그들이 창조한 인류를 초월한 존재 ‘이바’와 ‘에키온’이 이 실험을 지배하고 있다. 그들의 계획은 무엇이며, 실험체들은 이 끝없는 실험에서 벗어날 수 있을까? 살아남기 위한 처절한 싸움 속에서, 진정한 자유를 쟁취하기 위한 전투가 벌어진다.
키아라와 다르코는 이 실험을 끝내기 위해 함께 싸워나가며, VF의 비밀을 풀어나가기 시작한다. 이 과정에서 키아라, 다르코 외의 실험체들을 만나고 마음이 맞는 실험체들과 함께 협력한다. 이 이야기의 끝은 다르코의 희생으로 키아라가 VF의 비밀을 풀어내고, 실험체들이 자유롭게 풀려남으로써 끝난다.
"""
input_characters = [
    {
        "name": "키아라",
        "role": "주인공",
        "age": 21,
        "sex": "여성",
        "job": "견습 수녀",
        "profile": """
        
        태어나자마자 폐쇄적인 성당에 맡겨졌고, 매일 하느님의 전능을 세뇌 받다시피 교육받는다.
        바깥 외출이 허가된 이후 그녀는 하느님의 사도로서 충실하기 위해 가장 어둡고 더러운 곳에서 전도를 시작했지만, 그녀가 마주한 현실은 배운 것 보다 훨씬 더 냉담했다.
        그 과정에서 충실한 사도인 자신을 지켜주지 않는 하느님을 부정하는 생각을 품게 되고, 그런 자기 자신에 대한 강한 혐오감을 가지게 된다.
        아름다운 것, 고결한 것을 보게 되면 자격지심으로 인해 폭주한다.

        폭력과 죄악을 증오하지만, 동시에 아름다움과 순수한 것에 대한 강한 집착을 가지고 있다. 
        실험 구역에서 생존을 위해 자신이 믿었던 신념과 싸우며 변화해 나간다.
        """
    },
    {
        "name": "다르코",
        "role": "조력자",
        "age": 35,
        "sex": "남성",
        "job": "사채업자",
        "profile": """
        돈과 폭력이 세상의 모든 것을 해결해준다고 믿는 남자.
        잔혹하고 무자비한 성격으로, 자신이 원하는 건 전부 빼앗아야 직성이 풀린다.
        경찰인 아버지 밑에서 자랐으나 어렸을 때부터 성격이 포악했다.
        빚에 허덕이는 아버지에게 버려질 때, 그는 속으로 환호했다.
        '드디어 이 지옥 같은 굴레에서 벗어날 수 있겠구나.'
        이후 다르코는 자신이 사랑하는 폭력을 사용해서 돈을 벌기 시작했다.
        어떤 일이든 돈과 폭력은 그에게 늘 최우선 순위가 되었고, 삶의 전부가 되었다.
        어쩌면 그가 담보라는 이름으로 팔려나갔을 때, 깨달았을지도 모른다.
        돈과 폭력이 이 세상의 전부라는 것을.

        아글라이아의 실험에 참가하게 되면서도 그는 여전히 자신의 신념을 지키려 하지만, 
        점점 이 실험이 단순한 돈과 권력을 넘어선 것임을 깨닫게 된다. 
        자신이 시스템의 일부로서 이용당하고 있음을 깨닫고, 실험을 끝낼 방법을 찾기 시작한다.
        """
    },
    {
        "name": "에르샤",
        "role": "대적자 (아글라이아 부소장)",
        "age": "40대 후반 (실제 나이 불명)",
        "sex": "여성",
        "job": "아글라이아 부소장",
        "profile": """
        아글라이아의 실험을 급진적으로 추진하는 인물. 실험체들의 한계를 시험하기 위해 직접 서울에 테러를 감행하고,
        괴물 ‘스킬라’를 풀어놓아 실험체들을 극한의 상황으로 몰아넣었다. 
        온건한 안젤리카와는 자주 대립하며, 더욱 강력한 존재를 창조하려는 목표를 가지고 있다. 
        그녀는 실험체 ‘이바’를 자신의 궁극적인 창조물로 보고 있으며, 실험의 결과를 조작하려 한다.
        """
    },
    {
        "name": "이바 (Eva)",
        "role": "불완전한 신 인류",
        "age": "불명 (신체적 나이 20대 초반)",
        "sex": "여성",
        "job": "실험체",
        "profile": """
        아글라이아가 창조한 신 인류 중 하나. 인간을 초월하는 신체 능력을 가졌으며, 
        모든 감정을 제거당한 채 실험에 참여하고 있다. 
        하지만, 실험을 거듭할수록 사라졌다고 믿었던 감정이 되살아나기 시작하며, 
        인간성과 신 인류 사이에서 갈등하게 된다. 
        자신을 ‘창조자’로 여기는 에르샤와의 관계도 점점 변화해 간다.

        말을 걸어도 상냥하게 웃어줄 뿐, 자신을 드러낼 수 있는 대답은 하지 않는다.
        그런 모습에서 어딘가 비밀스럽고 신비로운 분위기가 느껴진다.

        통각이 둔한 상태라 무언가에 잘 부딪치고 넘어진다.
        멍들고 상처가 나도 잘 모른다.
        조금만 건드려도 부서질 것 같은 가녀린 몸이지만, 모두를 두렵게 만들 강력한 힘을 숨기고 있다.
        """
    }
]
input_keywords = "실험체, 생존, 루미아 섬, VF, 키아라, 다르코"

def format_characters(characters_list):
    formatted = ""
    for char in characters_list:
        formatted += f"이름: {char['name']}\n역할: {char['role']}\n프로필: {char['profile']}\n\n"
    return formatted

input_json = {
    "genre": input_genre.strip(),
    "title": input_title.strip(),
    "worldview": input_worldview.strip(),
    "synopsis": input_synopsis.strip(),
    "characters": format_characters(input_characters).strip(),
    "keywords": input_keywords.strip()
}

# 6. langchain 체인 실행하여 diffusion 모델 프롬프트 생성
diffusion_prompt_result = recommend_diffusion_chain.invoke(input_json)

# 7. 결과 출력
print("생성된 Diffusion 모델 프롬프트:")
print(diffusion_prompt_result)