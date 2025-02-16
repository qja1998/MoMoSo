import os
from dotenv import load_dotenv
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage

load_dotenv()

class GeminiDiscussionAssistant:
    def __init__(self, document_path: str, api_key: str):
        """문서 경로와 api key를 받아 assistant를 초기화합니다.

        Args:
            document_path (str): Path to the document to be processed.
            api_key (str): Gemini의 API key.
        """
        self.api_key = api_key
        self.document_path = document_path
        self.docs = self._load_documents()
        self.llm = self._initialize_llm()
        self.embeddings = self._initialize_embeddings()
        self.chroma_db = self._initialize_chroma_db()
    
    def _load_documents(self):
        """문서를 불러들이고 문장으로 분리하여 반환합니다.

        Returns:
            list: 문서 리스트
        """
        loader = TextLoader(self.document_path, encoding='UTF8')
        return loader.load_and_split()
    
    def _initialize_llm(self):
        """Gemini miodel를 초기화합니다.

        Returns:
            ChatGoogleGenerativeAI: Configured LLM instance.
        """
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key
        )
    
    def _initialize_embeddings(self):
        """Gemini의 Embeddings를 초기화합니다.

        Returns:
            GoogleGenerativeAIEmbeddings: Configured embedding instance.
        """
        return GoogleGenerativeAIEmbeddings(
            model = "models/embedding-001", 
            google_api_key=self.api_key
        )
    
    def _initialize_chroma_db(self):
        """Chroma database를 불러오거나 초기화합니다.

        Returns:
            Chroma: Configured Chroma database instance.
        """
        chroma_db = Chroma(persist_directory="data", 
                        embedding_function=self.embeddings,
                        collection_name="lc_chroma_demo")
        collection = chroma_db.get()
        
        if len(collection['ids']) == 0:
            chroma_db = Chroma.from_documents(
                documents=self.docs, 
                embedding=self.embeddings, 
                persist_directory="data",
                collection_name="lc_chroma_demo"
            )
            chroma_db.persist()
        
        return chroma_db
    
    def recommend_discussion_topic(self, query: str):
        """추천 토론 주제를 반환합니다.

        Args:
            query (str): 유저의 발화

        Returns:
            str: 추천 토론 주제
        """
        prompt = f"다음 내용에 대해 토론할 주제를 추천해주세요:\n{query}"
        retriever = self.chroma_db.as_retriever()
        chain = RetrievalQA.from_chain_type(llm=self.llm, chain_type="stuff", retriever=retriever)
        return chain(prompt)['result']
    
    def fact_check(self, query: str):
        """입력된 query에 대한 팩트체크 결과를 반환합니다.

        Args:
            query (str): 팩트체크할 내용

        Returns:
            str: 팩트 체크 결과
        """
        prompt = f"주어진 정보가 아래 문서에서 사실인지 검증해 주세요.\n\n질문: {query}\n\n사실 여부 및 근거:"
        retriever = self.chroma_db.as_retriever()
        chain = RetrievalQA.from_chain_type(llm=self.llm, chain_type="stuff", retriever=retriever)
        return chain(prompt)['result']
    
    def generate_meeting_notes(self, discussion_transcript: str):
        """토론 내용을 요약하여 회의록을 작성합니다.

        Args:
            discussion_transcript (str): 토론 내용

        Returns:
            str: 회의록
        """
        prompt = f"다음 토론 내용을 간결하고 명확하게 요약하여 회의록을 작성해 주세요.\n\n토론 내용: {discussion_transcript}\n\n회의록:"
        return self.llm.invoke([HumanMessage(content=prompt)])
    
    def delete_collection(self):
        """Delete the Chroma database collection."""
        self.chroma_db.delete_collection()

if __name__ == "__main__":
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    assistant = GeminiDiscussionAssistant("./시간의 흔적.txt", GEMINI_API_KEY)
    
    query = "이 소설의 논점"
    print("Recommended Discussion Topic:", assistant.recommend_discussion_topic(query))
    print("Fact Check:", assistant.fact_check(query))
    
    transcript = "이 소설은 시간의 흔적을 따라가며 인간의 삶을 그려낸 작품이다."
    print("Meeting Notes:", assistant.generate_meeting_notes(transcript))