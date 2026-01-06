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
        mode = query_components.get("mode", ["or"])[0]
        
        if not keywords:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "No keywords provided"}).encode())
            return

        all_results = []
        # 각 키워드별로 검색 수행
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

        # 중복 제거 (URL 기준)
        unique_results = {}
        for item in all_results:
            key = item['link']
            if key in unique_results:
                if item['postdate'] > unique_results[key]['postdate']:
                    unique_results[key] = item
            else:
                unique_results[key] = item

        final_list = list(unique_results.values())

        # AND 조건 필터링
        if mode == "and" and len(keywords) > 1:
            filtered_list = []
            for item in final_list:
                # 제목과 설명에서 태그 제거하고 비교
                text_to_search = (item['title'] + " " + item['description']).replace("<b>", "").replace("</b>", "").lower()
                
                # 모든 키워드가 포함되어 있는지 확인
                all_match = True
                for kw in keywords:
                    if kw.lower() not in text_to_search:
                        all_match = False
                        break
                
                if all_match:
                    filtered_list.append(item)
            final_list = filtered_list

        # 발행일 최신순 정렬
        final_list.sort(key=lambda x: x['postdate'], reverse=True)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(final_list).encode())
        return
