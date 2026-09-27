import subprocess, json, re
pdf = '/root/doc/doklad.pdf'
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
keys = [("intro","ВВЕДЕНИЕ"),("s1","1. Авиация накануне войны"),("s2","2. Разведка"),("s3","3. Рождение воздушного боя"),("s4","4. Стрельба сквозь винт"),
        ("s5","5. Эволюция боевых самолётов"),("s6","6. Война приходит в города"),("s7","7. Российская авиация"),("s8","8. Асы Первой мировой войны"),
        ("s9","9. Битвы за господство в воздухе"),("s10","10. Крылья над морем"),("s11","11. Жизнь и быт лётчика"),("s12","12. Итоги войны в цифрах"),
        ("concl","ЗАКЛЮЧЕНИЕ"),("refs","СПИСОК ИСТОЧНИКОВ"),("app","ПРИЛОЖЕНИЕ")]
texts = [subprocess.run(['pdftotext','-f',str(i),'-l',str(i),'-layout',pdf,'-'],capture_output=True,text=True).stdout.replace(' ',' ') for i in range(1, n+1)]
pages = {}
for k, h in keys:
    for i in range(2, n):
        if h.lower() in texts[i].lower():
            pages[k] = i + 1; break
print('pages', n, pages)
json.dump(pages, open('/root/doc/pages.json', 'w'))
