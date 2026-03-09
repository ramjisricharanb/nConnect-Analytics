import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix space between < and !--
content = content.replace('< !--', '<!--')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
