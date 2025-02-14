# MOMOSO

### **AI 기반 소설생성 & 토론 서비스**
![MOMOSO](/uploads/93054a8c93d071fe2f65d755dc3ccbad/MOMOSO.png)

---

## 목차
1. [프로젝트 소개](#1️⃣-프로젝트-소개)
2. [서비스 소개](#2️⃣-서비스-소개)
3. [기획 배경](#3️⃣-기획-배경)
4. [주요 기능](#4️⃣-주요-기능)
5. [화면 소개](#5️⃣-화면-소개)
6. [기술 스택](#6️⃣-기술-스택)
7. [서비스 아키텍처](#7️⃣-서비스-아키텍처)
8. [프로젝트 산출물](#8️⃣-프로젝트-산출물)

---

## 카테고리

| Application | Domain | Language | Framework | Infra |
| ---- | ---- | ---- | ---- | ---- |
| :white_check_mark: Desktop Web | :white_check_mark: AI | :white_check_mark: JavaScript | :black_square_button: Vue.js | :white_check_mark: Docker |
| :black_square_button: Mobile Web | :black_square_button: Big Data | :black_square_button: TypeScript | :white_check_mark: React | :white_check_mark: Gitlab CI/CD |
| :white_check_mark: Responsive Web | :black_square_button: Blockchain | :black_square_button: C/C++ | :black_square_button: Angular | |
| :black_square_button: Android App | :black_square_button: IoT | :black_square_button: C# | :white_check_mark: Node.js | |
| :black_square_button: iOS App | :black_square_button: AR/VR/Metaverse | :white_check_mark: Python | :black_square_button: Flask/Django | |
| :black_square_button: Desktop App | :black_square_button: Game | :black_square_button: Java | :black_square_button: Spring/Springboot | |
| | | :black_square_button: Kotlin | :white_check_mark: FastAPI | |

## 1️⃣ 프로젝트 소개

### **프로젝트 개요**  
MOMOSO는 소설을 써보고 싶지만 필력이 부족하거나, 독자의 의견을 적극적으로 반영하고 싶은 작가 또는 소설의 전개에 보다 적극적으로 개입하고 싶거나, 내가 보는 소설에 대해 더 깊은 토론을 해보고 싶은 독자에게 도움이 될 수 있는 서비스를 제공하는 프로젝트 입니다.

### **프로젝트 기간**  
25.01.13 ~ 25.02.21 (총 6주)

### **팀원 소개 및 역할**  
| <img src="/uploads/4a41858040a8f38644214eed08613063/전제후.png" width="100"/> <br> 전제후 <br> **팀장/AI/PM** | <img src="/uploads/db5edf5adf21aa5c1a182439139a6936/권기범.png" width="100"/> <br> 권기범 <br> **Devops/AI** | <img src="/uploads/7be088a72bb329d2a2370e24f18a940c/김의찬.png" width="100"/> <br> 김의찬 <br> **WebRTC** | <img src="/uploads/ced62e92587854fce8696b8799faf392/김윤하.png" width="100"/> <br> 김윤하 <br> **BE, FE** | <img src="/uploads/c96b88c3f3e7efc2d269844166c52909/이지은.png" width="100"/> <br> 이지은 <br> **BE, FE** | <img src="/uploads/0f5b6c8a382b213991c95b2326a99cc6/조현준.png" width="100"/> <br> 조현준 <br> **FE** |
|:------------------------------------------------------------------:|:------------------------------------------------------------------:|:------------------------------------------------------------------:|:--------------------------------------------------------------------:|:--------------------------------------------------------------------:|:--------------------------------------------------------------------:|
- **전제후 (팀장/AI/PM)**  
  - 프로젝트 총괄
  - 소설 생성 및 회의록 요약 기능 구현
- **권기범 (Devops/AI)**
  - Infra(Docker, Gitlab CI/CD)
  - Diffusion Model
  - RAG
- **김의찬 (WebRTC)**
  - 그룹 토론 기능 구현(WebRTC, OpenVidu)
- **김윤하 (BE, FE)**
  - Back-end 개발 총괄
  - 
- **이지은 (BE, FE)**
  - Back-end 개발 총괄 
  -
- **조현준 (FE)**
  - FE 개발 총괄
  - UI, UX 디자인 총괄(Figma, Webflow)

### **UCC**  
- [UCC 영상](https://example.com/video)  

---

## 3️⃣ 기획 배경

### 배경

### 목적

### 의의

---

## 4️⃣ 주요 기능
### **회원 관리 기능**  
- 회원 가입(구글, 카카오 등)
- 회원 탈퇴
- 회원... 

### **AI 기반 소설 생성 기능**  
- AI 기반 소설 기본정보 생성
  - 장르, 제목 입력
  - AI기반 세계관, 줄거리, 등장인물 생성
  - Diffusion Model을 활용한 소설 표시 생성
- AI 기반 소설 내용 생성
  - 기본정보 기반 소설 1화 생성
  - 기본정보 및 이전 소설 내용 기반 소설 다음화 생성

### **그룹 토론 기능**  
- WebRTC, OpenVidu 기반 그룹 토론
- RAG 기반 주제 추천, FactCheck 기능
- STT 기반 회의록 기록 기능
- AI 기반 회의록 요약 기능

---

## 5️⃣ 화면 소개
### **랜딩 페이지**  
![랜딩 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)
### **회원 가입 페이지**
![회원 가입 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)
### **소설 목록 페이지**
![소설 목록 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)
### **소설 에디터 페이지**
![소설 에디터 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)
### **그룹 토론 생성 페이지**
![그룹 토론 생성 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)
### **그룹 토론 페이지**
![그룹 토론 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)
### **회의록 요약 페이지**
![회의록 요약 페이지](/uploads/4a41858040a8f38644214eed08613063/전제후.png)

---

## 6️⃣ 기술 스택

### ✅ 기술스택

<table>
  <tr>
    <th>프론트엔드</th>
    <td>
      <img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat-square&logo=react&logoColor=white"/>
      <img src="https://img.shields.io/badge/Redux-764ABC.svg?style=flat-square&logo=redux&logoColor=white"/>
      <img src="https://img.shields.io/badge/Next.js-000000.svg?style=flat-square&logo=nextdotjs&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <th>백엔드</th>
    <td>
      <img src="https://img.shields.io/badge/FastAPI-009688.svg?style=flat-square&logo=fastapi&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <th>데이터베이스</th>
    <td>
      <img src="https://img.shields.io/badge/MariaDB-003545.svg?style=flat-square&logo=mariadb&logoColor=white"/>
      <img src="https://img.shields.io/badge/Redis-DC382D.svg?style=flat-square&logo=redis&logoColor=white"/>
      <img src="https://img.shields.io/badge/ChromaDB-009688.svg?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <th>웹서버</th>
    <td>
      <img src="https://img.shields.io/badge/Nginx-009639.svg?style=flat-square&logo=nginx&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <th>AI</th>
    <td>
      <img src="https://img.shields.io/badge/Stable%20Diffusion-000000.svg?style=flat-square&logo=stabilityai&logoColor=white"/>
      <img src="https://img.shields.io/badge/Langchain-00C853.svg?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <th>WebRTC</th>
    <td>
      <img src="https://img.shields.io/badge/OpenVidu-0078D7.svg?style=flat-square"/>
    </td>
  </tr>
  <tr>
    <th>배포 및 기타</th>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat-square&logo=docker&logoColor=white"/>
      <img src="https://img.shields.io/badge/GitLab%20CI%2FCD-FC6D26.svg?style=flat-square&logo=gitlab&logoColor=white"/>
    </td>
  </tr>
</table>

- **프론트엔드:**  
  - React, Redux, Next.js
- **백엔드:**  
  - FastAPI
- **데이터베이스:**  
  - MariaDB, Redis, ChromaDB
- **웹서버:**
  - Nginx
- **AI:**
  - Stable Diffusion, Langchain
- **WebRTC:**
  - OpenVidu
- **배포 및 기타:**  
  - Docker, Gitlab CI/CD

---

## 7️⃣ 서비스 아키텍처
기범아 소개랑 구성요소 부분 부탁해

MOMOSO는 모듈화된 마이크로서비스 아키텍처를 채택하여 높은 확장성과 유연성을 제공합니다.

- **구성 요소**  
  - **클라이언트:** React 기반 웹 애플리케이션  
  - **API 서버:** Node.js를 활용한 RESTful API 서버  
  - **데이터베이스:** MongoDB를 주 데이터베이스로 사용하며, Redis로 캐시 관리  
  - **파일 저장소:** AWS S3를 활용한 파일 업로드 및 관리

### **아키텍처 다이어그램**  
  ![서비스 아키텍처](/uploads/c035b51521f8de6d581b2740c976d8a7/시스템_아키텍처.png)

---

## 8️⃣ 프로젝트 산출물

### 기획서

### 기능명세서

### API 연동 규격서

### ERD

### 플로우차트

### 화면 설계(목업)

### 포팅 매뉴얼얼

### 발표 자료(PPT)

### 시연 영상상
