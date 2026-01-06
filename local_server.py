import http.server
import socketserver
import os
from api.blog import handler

PORT = 8000

class LocalHandler(handler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            # API 요청 처리
            super().do_GET()
        else:
            # 정적 파일 서빙
            if self.path == '/':
                self.path = '/index.html'
            
            # 현재 디렉토리에서 파일 찾기
            file_path = "." + self.path
            if os.path.exists(file_path) and not os.path.isdir(file_path):
                # 파일 확장자에 따른 Content-type 설정
                ext = os.path.splitext(file_path)[1]
                content_type = "text/html"
                if ext == ".css": content_type = "text/css"
                elif ext == ".js": content_type = "text/javascript"
                
                self.send_response(200)
                self.send_header("Content-type", content_type)
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"File not found")

if __name__ == "__main__":
    # .env 파일 로드 (로컬 테스트용)
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    with socketserver.TCPServer(("", PORT), LocalHandler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        httpd.serve_forever()
