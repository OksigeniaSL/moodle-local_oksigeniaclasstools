#!/usr/bin/env python3
# The board's texts («app_» strings) live here, in JSON fragments with English and Spanish; this writes them into
# lang/en and lang/es, sorted, keeping the other strings of those files. Usage: python3 tools/i18n/merge.py
import json, glob, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
merged, origin, problems = {}, {}, []
for path in sorted(glob.glob(os.path.join(HERE, '*.json'))):
    name = os.path.basename(path)
    for key, val in json.load(open(path, encoding='utf-8')).items():
        if not re.fullmatch(r'[a-z][a-z0-9_]*', key):
            problems.append(f'{name}: bad key {key}')
        if set(re.findall(r'\{\$a(?:->\w+)?\}', val['en'])) != set(re.findall(r'\{\$a(?:->\w+)?\}', val['es'])):
            problems.append(f'{name}: placeholders differ in {key}')
        if key in merged and merged[key] != val:
            problems.append(f'{name}: {key} also in {origin[key]} with other text: {merged[key]} vs {val}')
        merged[key], origin[key] = val, name
def write(lang):
    p = os.path.join(REPO, 'lang', lang, 'local_oksigeniaclasstools.php')
    s = open(p, encoding='utf-8').read()
    pre = s[:s.index("$string['")]
    entries = dict((k, e) for e, k in re.findall(r"(\$string\['([^']+)'\] = .*?;\n)", s[s.index("$string['"):], re.S))
    entries = {k: e for k, e in entries.items() if not k.startswith('app_')}
    for key, val in merged.items():
        text = val[lang].replace('\\', '\\\\').replace("'", "\\'")
        entries['app_' + key] = f"$string['app_{key}'] = '{text}';\n"
    open(p, 'w', encoding='utf-8').write(pre + ''.join(entries[k] for k in sorted(entries)))
if problems:
    print('\n'.join(problems)); sys.exit(1)
write('en'); write('es')
print(f'{len(merged)} board strings merged from', ', '.join(sorted(set(origin.values()))))
