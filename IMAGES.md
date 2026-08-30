# Image Library — Colorado Boom

All images live in `assets/img/`. **Filenames are case-sensitive on GitHub** — to swap an image,
upload a new file with the EXACT same name (lowercase) and it appears automatically.

| Filename | Used on | What it should show |
|---|---|---|
| `logo.png` | header + footer (all pages), favicon | Club logo (transparent background) |
| `hero.jpg` | Home hero `[HM-01]` | Wide action banner. *(currently a teal placeholder — replace)* |
| `girls.jpg` | Home band `[HMB.1]`, Girls Club hero | Girl player, focused |
| `boys.jpg` | Home band `[HMB.2]`, Boys Club hero | Boy player, focused |
| `club.jpg` | Home `[HM-02.1]` Club Volleyball card | Team / competitive play |
| `developmental.jpg` | Home `[HM-02.2]` + Tryouts hero | Skills / training drill |
| `camps.jpg` | Home `[HM-02.3]` Camps card | Camp / clinic |
| `why-boom.jpg` | Home `[HM-04]` Why Colorado Boom | Featured player |
| `coach-mel-erly.jpg` | Coaching Staff `[CO-03]` | Head-and-shoulders portrait |
| `coach-sidney-reese.jpg` | Coaching Staff `[CO-03]` | Head-and-shoulders portrait |
| `coach-damon-sichler.jpg` | Coaching Staff `[CO-02b]` leadership | Head-and-shoulders portrait |

**Recommended specs:** JPG, ~1200px wide max, under ~250KB each, web-optimized. Logo is PNG with transparency.
**To replace any photo:** keep the filename identical, just upload the new file over it.

## Coach photos

**One photo per coach, named after that coach's card.** Every card on `coaching-staff.html`
already carries an id like `id="coach-mel-erly"`; the photo file is that id plus `.jpg`. So
Will Ly's photo is `coach-will-ly.jpg`. Cards without a photo yet show a teal gradient block
and carry a `data-img` attribute naming the file they are waiting for — that attribute is
documentation only, nothing reads it, so adding a photo means two steps:

1. Upload `assets/img/coach-<first>-<last>.jpg`.
2. In `coaching-staff.html`, swap that card's placeholder for the image, copying the shape of
   a card that already has one.

Naming photos after the coach (rather than `coach-1`, `coach-2`) means the roster can be
reordered or a coach can leave without every remaining file needing to be renumbered.

**Photo spec — portrait, 4:5.** Crop to **4:5 portrait** (e.g. 1000 x 1250) with the coach
centred and filling roughly 80% of the frame height, cropped just below the chest. The card
frame is 4:5, so a photo already at that ratio is shown whole and uncropped; anything else
gets centre-cropped to fit. Keep files under ~250KB.
