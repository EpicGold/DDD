import sys
from PIL import Image, ImageDraw
import numpy as np
S=2048; names=sys.argv[2].split(','); out=sys.argv[1]; tile=int(sys.argv[3]) if len(sys.argv)>3 else 640
y,x=np.mgrid[0:S,0:S]/S
photo=Image.fromarray(np.dstack([200+40*x,170+50*y,190+30*(1-x)]).clip(0,255).astype('uint8')).convert('RGBA')
d=ImageDraw.Draw(photo); d.ellipse((S/2-260,S/2-430,S/2+260,S/2+130),fill=(120,95,110,255)); d.ellipse((S/2-560,S/2+150,S/2+560,S/2+1100),fill=(120,95,110,255))
mask=Image.new('L',(S,S),0); ImageDraw.Draw(mask).ellipse((S/2-740,S/2-740,S/2+740,S/2+740),fill=255)
cols=4 if len(names)>4 else 2; rows=(len(names)+cols-1)//cols
sheet=Image.new('RGB',(tile*cols,tile*rows),(236,232,228))
for i,k in enumerate(names):
    bg=Image.new('RGBA',(S,S),(236,232,228,255)); bg.paste(photo,(0,0),mask); bg.alpha_composite(Image.open(f'/root/frame/out2/frame_{k}.png'))
    sheet.paste(bg.convert('RGB').resize((tile,tile),Image.LANCZOS),((i%cols)*tile,(i//cols)*tile))
sheet.save(out)
