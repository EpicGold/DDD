import sys, time
from rembg import new_session, remove
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
model=sys.argv[1]; files=sys.argv[2:]
s=new_session(model)
for f in files:
    t=time.time()
    im=Image.open(f'/root/si/img/small/{f}.jpg').convert('RGB')
    im.thumbnail((2400,2400))
    out=remove(im, session=s, post_process_mask=True)
    out.save(f'/root/cut/{f}__{model}.png')
    print(f, model, round(time.time()-t,1),'s', out.size, flush=True)
