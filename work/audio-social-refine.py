from pathlib import Path
import re

root=Path('C:/Users/maazm/Documents/Codex/2026-10-31/us/work/gabriel')
p=root/'dist/index.html'
html=p.read_text(encoding='utf-8')
start=html.index('<section id="audio"')
end=html.index('</section>',start)+len('</section>')
old=html[start:end]
listen=re.search(r'<a class="button secondary".*?</a>',old).group()
copy=re.search(r'<div>(<p class="eyebrow">.*?)</div>',old).group(1)
heights=[14,22,35,47,28,42,58,72,50,33,60,82,66,43,70,94,76,54,100,80,61,88,65,42,74,56,38,62,45,28,48,35,22,38,28,18,12]
bars=''.join(f'<i class="wave-bar" style="--bar-height:{height}%;--wave-duration:{1400+(i%6)*170}ms;--wave-delay:-{(i*173)%2200}ms"></i>' for i,height in enumerate(heights))
headphones='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="11" width="4" height="9" rx="2"/><rect x="17" y="11" width="4" height="9" rx="2"/></svg>'
audio=f'''<section id="audio" class="audio section" aria-labelledby="audio-heading"><div class="audio-copy">{copy.replace('<h2>','<h2 id="audio-heading">',1)}{listen.replace('Listen to the audiobook ↗','Listen on ElevenReader <span aria-hidden="true">↗</span>')}</div><div class="audio-visual"><div class="audio-visual-top"><span class="audio-format">{headphones} THE AUDIO EDITION</span><button class="wave-toggle" type="button" hidden><span class="wave-control-icon" aria-hidden="true">Ⅱ</span><span class="wave-control-label">Pause motion</span></button></div><div class="audio-artwork"><div class="audio-record" aria-hidden="true"><span></span></div><img class="audio-cover" src="assets/cover-360.webp" width="360" height="576" alt="Hidden In Broad Daylight audiobook artwork" loading="lazy" decoding="async"><span class="audio-handnote" aria-hidden="true">Let the words<br>come to you.</span></div><div class="audio-waveform" aria-hidden="true">{bars}</div><div class="audio-caption"><strong>Hidden In Broad Daylight</strong><span>Gabriel Pollard · Buried Treasures</span></div><p class="audio-platform-note">Your next chapter, wherever you are.</p></div></section>'''
html=html[:start]+audio+html[end:]

platforms=[('instagram','Instagram'),('goodreads','Goodreads'),('tiktok','TikTok'),('facebook','Facebook'),('youtube','YouTube')]
for slug,label in platforms:
    svg=(root/f'source-assets/social-icons/{slug}.svg').read_text(encoding='utf-8')
    svg=re.sub(r'<title>.*?</title>','',svg)
    svg=re.sub(r'\srole="img"','',svg)
    svg=svg.replace('<svg ','<svg class="social-logo" fill="currentColor" aria-hidden="true" focusable="false" ',1)
    pattern=rf'(<a\b[^>]*>)'+re.escape(label)+r' ↗</a>'
    html=re.sub(pattern,lambda m:m.group(1)+svg+f'<span>{label}</span><span class="social-external" aria-hidden="true">↗</span></a>',html)
p.write_text(html,encoding='utf-8')
print('Audiobook visual and five social logos updated.')
