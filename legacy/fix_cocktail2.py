import re
with open('C:/Users/Nicolas/projects/alchemy/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace cc-bg-2 background-image url (the data URI) with relative path
html = re.sub(
    r'(class="cocktail-card-bg cc-bg-2"[^>]*style="background-image:[^;]+url\()["\']data:image/jpeg;base64,[^"\']+["\'](\))',
    r"\1'imgs/cocktail2.jpg'\2",
    html
)
with open('C:/Users/Nicolas/projects/alchemy/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('done')
