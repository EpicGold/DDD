# Turn objects named "A|kind|delay|dur|label" into PowerPoint animations that start on their own
# right after the slide transition: entrance Fade (presetID 10) and Ken Burns push-in
# (Grow/Shrink emphasis, presetID 6). Writes a standard <p:timing> tree + <p:bldLst>.
import re, sys, zipfile
from xml.sax.saxutils import escape

SRC, DST = sys.argv[1], sys.argv[2]
KB_DUR, KB_SCALE = 24000, 106000          # 24 s, +6 %

NAME_RE = re.compile(r'<p:cNvPr id="(\d+)" name="A\|([^"|]*)\|(\d+)\|(\d+)\|([^"]*)"')

def fade(cid, spid, delay, dur):
    return (f'<p:par><p:cTn id="{cid}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="withEffect">'
            f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
            f'<p:set><p:cBhvr><p:cTn id="{cid+1}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="visible"/></p:to></p:set>'
            f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{cid+2}" dur="{dur}"/>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
            f'</p:childTnLst></p:cTn></p:par>'), cid + 3

def kenburns(cid, spid, delay, grp):
    return (f'<p:par><p:cTn id="{cid}" presetID="6" presetClass="emph" presetSubtype="0" fill="hold" grpId="{grp}" nodeType="withEffect">'
            f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
            f'<p:animScale><p:cBhvr><p:cTn id="{cid+1}" dur="{KB_DUR}" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr>'
            f'<p:by x="{KB_SCALE}" y="{KB_SCALE}"/></p:animScale>'
            f'</p:childTnLst></p:cTn></p:par>'), cid + 2

def build_timing(effects):
    """effects: list of (kind, spid, delay, dur, is_sp)."""
    cid, pars, bld = 5, [], []
    for kind, spid, delay, dur, is_sp in sorted(effects, key=lambda e: e[2]):
        if kind in ("fade", "fkb"):
            x, cid = fade(cid, spid, delay, dur); pars.append(x)
            if is_sp: bld.append(f'<p:bldP spid="{spid}" grpId="0" animBg="1"/>')
        if kind in ("kb", "fkb"):
            x, cid = kenburns(cid, spid, delay, 1 if kind == "fkb" else 0); pars.append(x)
    if not pars: return ""
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
            '<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
            '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            + "".join(pars) +
            '</p:childTnLst></p:cTn></p:par>'
            '</p:childTnLst></p:cTn></p:par>'
            '</p:childTnLst></p:cTn>'
            '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
            '</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>'
            + (f'<p:bldLst>{"".join(bld)}</p:bldLst>' if bld else "") + '</p:timing>')

zin = zipfile.ZipFile(SRC); zout = zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED)
stats = {}
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.fullmatch(r"ppt/slides/slide\d+\.xml", item.filename):
        xml = data.decode("utf-8"); effects = []
        for m in NAME_RE.finditer(xml):
            spid, kind, delay, dur, label = int(m.group(1)), m.group(2), int(m.group(3)), int(m.group(4)), m.group(5)
            before = xml[:m.start()]
            is_sp = before.rfind("<p:nvSpPr>") > before.rfind("<p:nvPicPr>")
            if kind != "none": effects.append((kind, spid, delay, dur, is_sp))
        xml = NAME_RE.sub(lambda m: f'<p:cNvPr id="{m.group(1)}" name="{m.group(5)}"', xml)
        timing = build_timing(effects)
        if timing:
            assert "<p:timing>" not in xml and xml.rstrip().endswith("</p:sld>"), item.filename
            xml = xml[: xml.rfind("</p:sld>")] + timing + "</p:sld>"
        stats[item.filename] = len(effects)
        data = xml.encode("utf-8")
    zout.writestr(item, data)
zout.close()
print("animated objects per slide:", {k.split("/")[-1]: v for k, v in sorted(stats.items(), key=lambda kv: int(re.findall(r"\d+", kv[0])[0]))})
