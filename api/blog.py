import os
import json
import requests
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 환경 변수 로드
        CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
        CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")

        if not CLIENT_ID or not CLIENT_SECRET:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Naver API keys not configured"}).encode())
            return

        # 쿼리 파라미터 파싱
        query_components = parse_qs(urlparse(self.path).query)
        keywords = query_components.get("keywords", [])
        
        if not keywords:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "No keywords provided"}).encode())
            return

        all_results = []
        # 각 키워드별로 검색 수행 (기본 50개씩 조회)
        for keyword in keywords:
            url = f"https://openapi.naver.com/v1/search/blog.json?query={requests.utils.quote(keyword)}&display=50&sort=sim"
            headers = {
                "X-Naver-Client-Id": CLIENT_ID,
                "X-Naver-Client-Secret": CLIENT_SECRET
            }
            
            try:
                response = requests.get(url, headers=headers)
                if response.status_code == 200:
                    items = response.json().get("items", [])
                    # 키워드 정보 추가
                    for item in items:
                        item['search_keyword'] = keyword
                    all_results.extend(items)
            except Exception as e:
                print(f"Error fetching keyword {keyword}: {e}")

        # 중복 제거 (제목 또는 URL 기준, 최신 데이터 우선)
        # 네이버 블로그 검색 결과는 기본적으로 신뢰도가 높은 순이지만, 
        # 발행일 정렬을 위해 먼저 수집 후 처리
        unique_results = {}
        for item in all_results:
            # HTML 태그 제거된 제목을 키로 사용하거나 URL을 키로 사용
            clean_title = item['title'].replace("<b>", "").replace("</b>", "").strip()
            link = item['link']
            
            # 고유 키 생성 (URL이 가장 정확함)
            key = link
            
            # 이미 존재하면 발행일 비교 (더 최신이면 교체)
            if key in unique_results:
                existing_date = unique_results[key]['postdate']
                if item['postdate'] > existing_date:
                    unique_results[key] = item
            else:
                unique_results[key] = item

        # 리스트로 변환 및 발행일 최신순 정렬
        final_list = list(unique_results.values())
        final_list.sort(key=lambda x: x['postdate'], reverse=True)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(final_list).encode())
        return
