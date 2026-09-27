import zipfile, re, sys
src, dst = sys.argv[1], sys.argv[2]
DUR = {3: 2000, 11: 2200, 10: 1800, 2: 1800}
def morph(ms):
    return ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
            '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
            f'<p:transition xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="{ms}">'
            '<p159:morph option="byObject"/></p:transition></mc:Choice>'
            '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
FADE = '<p:transition spd="slow"><p:fade/></p:transition>'
import hashlib
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
# de-duplicate identical media parts (pptxgenjs embeds one copy per use)
canon, seen = {}, {}
for item in zin.infolist():
    if item.filename.startswith("ppt/media/"):
        h = hashlib.sha1(zin.read(item.filename)).hexdigest()
        if h in seen: canon[item.filename] = seen[h]
        else: seen[h] = item.filename
def fix_rels(xml):
    for dup, keep in canon.items():
        xml = xml.replace("../media/" + dup.split("/")[-1] + '"', "../media/" + keep.split("/")[-1] + '"')
    return xml
for item in zin.infolist():
    if item.filename in canon: continue
    data = zin.read(item.filename)
    if item.filename.endswith(".rels"):
        data = fix_rels(data.decode("utf-8")).encode("utf-8")
    if item.filename == "[Content_Types].xml":
        xml = data.decode("utf-8")
        for dup in canon: xml = re.sub(r'<Override[^>]*PartName="/' + re.escape(dup) + r'"[^>]*/>', "", xml)
        data = xml.encode("utf-8")
    m = re.fullmatch(r"ppt/slides/slide(\d+)\.xml", item.filename)
    if m:
        n = int(m.group(1)); xml = data.decode("utf-8")
        assert "<p:transition" not in xml
        tr = FADE if n == 1 else morph(DUR.get(n, 1500))
        xml, k = re.subn(r"(</p:clrMapOvr>)", r"\1" + tr, xml, count=1)
        assert k == 1, item.filename
        data = xml.encode("utf-8")
    zout.writestr(item, data)
zout.close(); print("morph applied; deduped", len(canon), "media parts")
