#!/bin/bash

python migrate.py

uvicorn main:app --host 0.0.0.0 --port 8000 --reload --proxy-headers --forwarded-allow-ips='*'