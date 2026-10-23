import base64,os,re
d=os.path.dirname(os.path.abspath(__file__))
t=open(os.path.join(d,'template.html'),encoding='utf-8').read()
def rep(m):
    b=base64.b64encode(open(os.path.join(d,m.group(1)+'.webp'),'rb').read()).decode()
    return 'data:image/webp;base64,'+b
out=re.sub(r'\{\{IMG_(\w+)\}\}',rep,t)
p=os.path.join(d,'..','kommagene-demo.html'); open(p,'w',encoding='utf-8').write(out)
print(os.path.getsize(p)//1024,'KB')
