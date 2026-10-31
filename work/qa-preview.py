from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import re

root=Path('C:/Users/maazm/Documents/Codex/2026-10-31/us/work/gabriel/dist')
class Preview(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
    def do_GET(self):
        if self.path.split('?')[0] in ['/__qa/no-script.html','/__qa/reduced-motion.html']:
            html=(root/'index.html').read_text(encoding='utf-8')
            html=html.replace('href="site.css"','href="/site.css"').replace('src="site.js"','src="/site.js"')
            html=html.replace('src="assets/','src="/assets/').replace('srcset="assets/','srcset="/assets/').replace(', assets/',', /assets/')
            if 'no-script' in self.path:
                html=re.sub(r'<script[^>]*>.*?</script>','',html,flags=re.S)
            else:
                # Test fixture only: exercise the reduced-motion JS branch and static CSS.
                override='''<style>html{scroll-behavior:auto!important}*,*:before,*:after{transition:none!important;animation:none!important}.book-object{transform:rotate(-7deg) rotateY(-10deg)!important}</style><script>const originalMatchMedia=window.matchMedia.bind(window);window.matchMedia=(query)=>query==='(prefers-reduced-motion: reduce)'?{matches:true,media:query,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:originalMatchMedia(query);</script>'''
                html=html.replace('</head>',override+'</head>')
                html=html.replace('</body>','<script>window.addEventListener("load",()=>{requestAnimationFrame(()=>{document.documentElement.dataset.qaReduced=String(window.matchMedia("(prefers-reduced-motion: reduce)").matches);document.documentElement.dataset.qaAnimations=String(document.getAnimations().length)})});</script></body>')
            data=html.encode('utf-8');self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
        else:super().do_GET()
ThreadingHTTPServer(('127.0.0.1',5181),Preview).serve_forever()
