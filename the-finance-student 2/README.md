# The Finance Student — homepage concept

A static, no-build concept for the thefinancestudent.com homepage. Open `index.html` or serve the folder with GitHub Pages.

```
python3 -m http.server   # then visit http://localhost:8000
```

## What's in it
- **Intro**: only "Finance." shows at first, then the grey hero and the rest of the page open out of the "a".
- **Hero**: a concrete-grey canvas with "The / Finance. / Student" and an edge-to-edge strip of logos from the firms students most want to work for (it pauses on hover).
- **About statement**: the words darken as you scroll through them.
- **Career list**: the employer programs featured on the site. Each row fills with paprika on hover.
- **Cities**: Ottawa, Toronto and Hamilton panels slide in from the right and stack, each leaving a strip of the panel underneath. Each has a large photo and city name.
- **Palette**: the five site colours. Click one to copy its hex code.
- **Footer**: menus, email-alert signup (front end only), and a static "The Finance Student" with equal gaps on both sides.

Motion follows Emil Kowalski's animation guidelines (github.com/emilkowalski/skills).

## Structure
```
index.html
css/style.css
js/main.js           intro reveal, marquee, scroll effects, Lenis smooth scroll (CDN)
assets/fonts/        SK Modernist (free font by Sebastian Kosch, check the licence before production)
assets/img/          city photos, FS mark
assets/logos/        firm logos (official SVGs from Wikimedia Commons)
```

## Notes
- Links and buttons are placeholders.
- Logos belong to their owners. Confirm you're allowed to show them before launch.
- Palette: Floral White `#fffcf2`, Concrete `#cacaca`, Charcoal Brown `#403d39`, Carbon Black `#252422`, Spicy Paprika `#eb5e28`.
