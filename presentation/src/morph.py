import zipfile, re, sys
src, dst = sys.argv[1], sys.argv[2]
MORPH = ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
         '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
         '<p:transition xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="1600">'
         '<p159:morph option="byObject"/></p:transition></mc:Choice>'
         '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
FADE = '<p:transition spd="slow"><p:fade/></p:transition>'
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    m = re.fullmatch(r"ppt/slides/slide(\d+)\.xml", item.filename)
    if m:
        xml = data.decode("utf-8")
        assert "<p:transition" not in xml
        tr = FADE if m.group(1) == "1" else MORPH
        xml, n = re.subn(r"(</p:clrMapOvr>)", r"\1" + tr, xml, count=1)
        assert n == 1, item.filename
        data = xml.encode("utf-8")
    zout.writestr(item, data)
zout.close()
print("morph applied")
