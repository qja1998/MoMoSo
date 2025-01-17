# 1주차 학습내용
1. AI
    
    1. RAG 복습
    - 수집한 데이터(도서 관련)이 RAG에 얼마나 효과가 있는지 확인하기 위해 테스트트 기능을 구현.
        - txt, csv 파일을 기반으로 RAG를 테스트해볼 수 있음
        ![alt text](images/rag_test.png)
        ![alt text](images/rag_test2.png)
    - 이미지 생성을 위한 기술에 대해 학습중 (diffusion model 등)

2. Infra

    1. docker 복습
    - 현재 확정된 backend, frontend 환경을 구성하기 위해 docker container를 구성

    - docker-compose를 기반으로 한 번에 빌드 및 실행이 가능
    ```yml
    version: '3.8'

    services:
    db:
        image: mysql:8.0
        container_name: fastapi_db
        environment:
        MYSQL_ROOT_PASSWORD: root
        MYSQL_DATABASE: test
        ports:
        - "3306:3306"
        volumes:
        - db_data:/var/lib/mysql
        command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
        networks:
        - app_network
        restart: unless-stopped
        healthcheck:
        test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
        interval: 10s
        timeout: 5s
        retries: 5

    api:
        build:
        context: ./backend
        dockerfile: Dockerfile
        container_name: fastapi_app
        environment:
        DATABASE_URL: mysql+pymysql://root:root@db:3306/test?charset=utf8
        ports:
        - "8000:8000"
        depends_on:
        db:
            condition: service_healthy
        volumes:
        - ./backend:/app/backend
        networks:
        - app_network
        restart: unless-stopped

    frontend:
        build:
        context: ./frontend
        dockerfile: Dockerfile
        container_name: react_frontend
        ports:
        - "3000:3000"
        networks:
        - app_network
        volumes:
        - ./frontend:/app
        environment:
        - CHOKIDAR_USEPOLLING=true


    volumes:
    db_data:

    networks:
    app_network:
        driver: bridge
    ```

    - 아직 React 환경에서 테스트 파일이 정상적으로 실행되지 않아 debug가 필요해 이 부분에 대해 집중적으로 학습중

    2. CI/CD 학습
    - Jenkins에 대해 공부하면서 자동화 pipeline을 구성하고자 하였고 학습하였음
        - GitLab과의 연동을 완료했고, push test를 했을 때 정상적으로 jenkins가 작동하는 것을 확인

    - 하지만 구현 난이도 측면이나 현재 상황에서 GitLab CI/CD를 기반으로 구축하는 것이 낫다고 판단하여 이를 활용한 pipeline 구성을 학습 중
        | **구분**           | **GitLab CI/CD**                              | **Jenkins**                                  |
        |---------------------|-----------------------------------------------|----------------------------------------------|
        | **통합성**          | GitLab에 내장되어 있어, Git 저장소와 완벽히 통합 | 독립적인 도구로, 다양한 VCS와 연동 가능      |
        | **설치 및 유지보수** | 클라우드 기반 사용 시 추가 설치 불필요          | 자체 서버에 설치해야 하며 유지보수 필요       |
        | **파이프라인 정의** | `.gitlab-ci.yml` 파일로 YAML 형식으로 정의     | Jenkinsfile로 Groovy DSL 사용                |
        | **플러그인 의존성** | 대부분의 기능이 기본 제공                     | 다양한 기능을 플러그인으로 제공               |
        | **러너/에이전트**   | GitLab Runner 사용                           | Jenkins Agent 사용                           |
        | **학습 곡선**       | 비교적 간단하며 직관적인 UI 제공               | 설정이 복잡하며 Jenkinsfile DSL 학습 필요     |
        | **커뮤니티 지원**   | GitLab 커뮤니티 및 공식 지원                  | 대규모 오픈소스 커뮤니티                     |
        | **비용**            | 무료 플랜 제공, 유료 플랜에서 추가 기능 제공    | 무료, 플러그인에 따라 비용 발생 가능         |
        | **확장성**          | 기본 기능에 초점, Runner 추가로 확장 가능       | 플러그인으로 확장 가능                       |
        | **배포 파이프라인**  | 기본적으로 CD 지원, Kubernetes와 원활히 연동   | CD 지원 가능하지만 플러그인 설정 필요         |

    
    - AWS를 서버로 사용할 예정이라 구현하려는 pipeline에 AWS를 바로 넣어 구축할 수 있는 방식으로 학습중