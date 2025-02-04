FROM python:3.10

WORKDIR /app

COPY requirements.txt /app

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pytest pytest-asyncio httpx

COPY . /app

WORKDIR /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]