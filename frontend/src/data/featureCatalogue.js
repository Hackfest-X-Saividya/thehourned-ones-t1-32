// Central Feature Catalogue Mapping for Chitragupta
// Dynamically binds all 85 reference images from chitragupta-assets/

const assetModules = import.meta.glob('../../../chitragupta-assets/**/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default'
});

function getAssetUrl(category, filename) {
  const key = `../../../chitragupta-assets/${category}/${filename}`;
  return assetModules[key] || '';
}

export const CATEGORIES = [
  { id: 'all', label: 'All Features' },
  { id: 'face-shapes', label: 'Face Shapes' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'eyebrows', label: 'Eyebrows' },
  { id: 'nose', label: 'Nose' },
  { id: 'lips-mouth', label: 'Lips & Mouth' },
  { id: 'facial-hair', label: 'Facial Hair' },
  { id: 'forehead-hairline', label: 'Hairline & Forehead' },
  { id: 'chin-jawline', label: 'Chin & Jawline' },
  { id: 'distinguishing-marks', label: 'Distinguishing Marks' }
];

export const RAW_CATALOGUE_ITEMS = [
  // 1. Face Shapes (8 items)
  {
    id: 'face-oval',
    category: 'face-shapes',
    filename: 'face-oval.jpg',
    label: 'Oval Face',
    descriptor: 'oval face shape',
    description: 'Proportional face outline where the forehead is slightly wider than the curved jaw'
  },
  {
    id: 'face-round',
    category: 'face-shapes',
    filename: 'face-round.jpg',
    label: 'Round Face',
    descriptor: 'round face shape',
    description: 'Soft curved cheek contours with roughly equal face width and length'
  },
  {
    id: 'face-square',
    category: 'face-shapes',
    filename: 'face-square.jpg',
    label: 'Square Face',
    descriptor: 'square angular face shape',
    description: 'Broad forehead with strong, angular 90-degree mandibular jaw corners'
  },
  {
    id: 'face-rectangle',
    category: 'face-shapes',
    filename: 'face-rectangle.jpg',
    label: 'Rectangular Face',
    descriptor: 'rectangular elongated face shape',
    description: 'Elongated facial profile with straight sides and squared chin'
  },
  {
    id: 'face-diamond',
    category: 'face-shapes',
    filename: 'face-diamond.jpg',
    label: 'Diamond Face',
    descriptor: 'diamond face shape with prominent cheekbones',
    description: 'High, wide cheekbones tapering to a narrow forehead and pointed chin'
  },
  {
    id: 'face-inverted-triangle',
    category: 'face-shapes',
    filename: 'face-inverted-triangle.jpg',
    label: 'Heart / Inverted Triangle',
    descriptor: 'heart-shaped face tapering to chin',
    description: 'Wide forehead and cheek area tapering down to a narrow pointed chin'
  },
  {
    id: 'face-oblong',
    category: 'face-shapes',
    filename: 'face-oblong-.jpg',
    label: 'Oblong Face',
    descriptor: 'oblong face shape',
    description: 'Longer vertical proportions with rounded chin and straight cheeklines'
  },
  {
    id: 'face-triangle',
    category: 'face-shapes',
    filename: 'face-triangle.jpg',
    label: 'Triangular Face',
    descriptor: 'triangular face shape with wide jaw',
    description: 'Narrow temples and forehead widening down into a broad, prominent jawline'
  },

  // 2. Eyes (10 items)
  {
    id: 'eye-almond',
    category: 'eyes',
    filename: 'eye-almond.jpg',
    label: 'Almond Eyes',
    descriptor: 'almond-shaped eyes',
    description: 'Classic pointed outer and inner canthi with balanced eyelid curvature'
  },
  {
    id: 'eye-round',
    category: 'eyes',
    filename: 'eye-round.jpg',
    label: 'Round Eyes',
    descriptor: 'prominent round eyes',
    description: 'Large, circular eye opening with visible sclera above or below the iris'
  },
  {
    id: 'eye-hooded',
    category: 'eyes',
    filename: 'eye-hooded.jpg',
    label: 'Hooded Eyelids',
    descriptor: 'hooded eyelids',
    description: 'Upper eyelid fold that droops over the natural crease'
  },
  {
    id: 'eye-monolid',
    category: 'eyes',
    filename: 'eye-monolid.jpg',
    label: 'Monolid Eyes',
    descriptor: 'monolid eyes with epicanthic fold',
    description: 'Smooth upper eyelid without a distinct supraorbital crease'
  },
  {
    id: 'eye-deep-set',
    category: 'eyes',
    filename: 'eye-deep-set.jpg',
    label: 'Deep-Set Eyes',
    descriptor: 'deep-set eyes',
    description: 'Eyes set back deeper into the skull socket beneath a prominent brow bone'
  },
  {
    id: 'eye-protruding',
    category: 'eyes',
    filename: 'eye-protruding.jpg',
    label: 'Protruding Eyes',
    descriptor: 'prominent protruding eyes',
    description: 'Eyes that sit forward in the eye socket with exposed globe contour'
  },
  {
    id: 'eye-upturned',
    category: 'eyes',
    filename: 'eye-upturned.jpg',
    label: 'Upturned Eyes',
    descriptor: 'upturned outer eye corners',
    description: 'Outer corners of the eyes tilt visibly higher than inner corners'
  },
  {
    id: 'eye-downturned',
    category: 'eyes',
    filename: 'eye-downturned.jpg',
    label: 'Downturned Eyes',
    descriptor: 'downturned outer eye corners',
    description: 'Outer corners of the eyes slope downwards toward the cheek'
  },
  {
    id: 'eye-close-set',
    category: 'eyes',
    filename: 'eye-close-set.jpg',
    label: 'Close-Set Eyes',
    descriptor: 'close-set eyes',
    description: 'Distance between inner corners is noticeably less than one eye-width'
  },
  {
    id: 'eye-wide-set',
    category: 'eyes',
    filename: 'eye-wide-set.jpg',
    label: 'Wide-Set Eyes',
    descriptor: 'wide-set eyes',
    description: 'Distance between eyes is greater than the horizontal width of one eye'
  },

  // 3. Eyebrows (8 items)
  {
    id: 'brow-straight',
    category: 'eyebrows',
    filename: 'brow-straight.jpg',
    label: 'Straight Brows',
    descriptor: 'straight horizontal eyebrows',
    description: 'Linear brow line with minimal natural arch curvature'
  },
  {
    id: 'brow-rounded',
    category: 'eyebrows',
    filename: 'brow-rounded.jpg',
    label: 'Rounded Brows',
    descriptor: 'soft rounded curved eyebrows',
    description: 'Continuous smooth curve following the supraorbital ridge'
  },
  {
    id: 'brow-soft-angled',
    category: 'eyebrows',
    filename: 'brow-soft-angled.jpg',
    label: 'Soft Angled Brows',
    descriptor: 'softly angled arched eyebrows',
    description: 'Gentle peak at the high point of the arch with soft tail descent'
  },
  {
    id: 'brow-sharp-angled',
    category: 'eyebrows',
    filename: 'brow-sharp-angled.jpg',
    label: 'Sharp Angled Brows',
    descriptor: 'sharp high-arched angled eyebrows',
    description: 'Defined upward slant with a distinct sharp angular peak'
  },
  {
    id: 'brow-s-shaped',
    category: 'eyebrows',
    filename: 'brow-s-shaped.jpg',
    label: 'S-Shaped Brows',
    descriptor: 's-shaped curved eyebrows',
    description: 'Dip near the inner brow followed by an outward rising arch'
  },
  {
    id: 'brow-thick',
    category: 'eyebrows',
    filename: 'brow-thick.jpg',
    label: 'Thick / Full Brows',
    descriptor: 'thick bushy eyebrows',
    description: 'Dense, prominent eyebrow hair volume with wide vertical width'
  },
  {
    id: 'brow-feathery',
    category: 'eyebrows',
    filename: 'brow-feathery.jpg',
    label: 'Feathery Brows',
    descriptor: 'feathery natural texture eyebrows',
    description: 'Soft, scattered natural hair direction with visible individual hairs'
  },
  {
    id: 'brow-upward',
    category: 'eyebrows',
    filename: 'brow-upward.jpg',
    label: 'Upward Slanted Brows',
    descriptor: 'upward slanted eyebrows',
    description: 'Brows rising upward from inner to outer corners without downward tail'
  },

  // 4. Nose (12 items)
  {
    id: 'nose-button',
    category: 'nose',
    filename: 'nose-button.jpg',
    label: 'Button Nose',
    descriptor: 'small button nose with rounded tip',
    description: 'Short nasal bridge with a small, rounded, slightly elevated tip'
  },
  {
    id: 'nose-flat',
    category: 'nose',
    filename: 'nose-flat.jpg',
    label: 'Flat Bridge Nose',
    descriptor: 'low flat nasal bridge',
    description: 'Low dorsal elevation between the eyes with flatter lateral contours'
  },
  {
    id: 'nose-hooked',
    category: 'nose',
    filename: 'nose-hooked.jpg',
    label: 'Hooked Nose',
    descriptor: 'hooked aquiline curved nose',
    description: 'Convex dorsal curve with the nasal tip turning distinctly downward'
  },
  {
    id: 'nose-narrow',
    category: 'nose',
    filename: 'nose-narrow.jpg',
    label: 'Narrow Nose',
    descriptor: 'narrow slender nose bridge',
    description: 'Slender bridge width and compact alar base'
  },
  {
    id: 'nose-pointed-01',
    category: 'nose',
    filename: 'nose-pointed-01.jpg',
    label: 'Pointed Nose (Type A)',
    descriptor: 'sharp pointed nasal tip',
    description: 'Defined sharp nasal tip cartilage with crisp projection'
  },
  {
    id: 'nose-pointed-02',
    category: 'nose',
    filename: 'nose-pointed-02.jpg',
    label: 'Pointed Nose (Type B)',
    descriptor: 'pointed nose tip',
    description: 'Refined angular nasal tip with clean lateral definition'
  },
  {
    id: 'nose-roman',
    category: 'nose',
    filename: 'nose-roman.jpg',
    label: 'Roman / Aquiline Nose',
    descriptor: 'roman nose with convex bridge hump',
    description: 'Prominent dorsal bone hump on the bridge with strong profile presence'
  },
  {
    id: 'nose-round-01',
    category: 'nose',
    filename: 'nose-round-01.jpg',
    label: 'Rounded Bulbous Nose (Type A)',
    descriptor: 'rounded bulbous nose tip',
    description: 'Full, bulbous lower lateral cartilages creating a rounded tip'
  },
  {
    id: 'nose-round-02',
    category: 'nose',
    filename: 'nose-round-02.jpg',
    label: 'Rounded Nose (Type B)',
    descriptor: 'softly rounded nose tip',
    description: 'Soft rounded nasal tip contour without sharp focal projection'
  },
  {
    id: 'nose-small',
    category: 'nose',
    filename: 'nose-small.jpg',
    label: 'Small Compact Nose',
    descriptor: 'small compact nose',
    description: 'Reduced vertical and horizontal proportions relative to facial height'
  },
  {
    id: 'nose-wide-01',
    category: 'nose',
    filename: 'nose-wide-01.jpg',
    label: 'Wide Base Nose (Type A)',
    descriptor: 'broad wide-set nostrils',
    description: 'Substantial horizontal distance between the outer alar flares'
  },
  {
    id: 'nose-wide-02',
    category: 'nose',
    filename: 'nose-wide-02.jpg',
    label: 'Wide Base Nose (Type B)',
    descriptor: 'wide nasal base',
    description: 'Broad nostril base with fuller alar wing spread'
  },

  // 5. Lips & Mouth (6 items)
  {
    id: 'lip-full',
    category: 'lips-mouth',
    filename: 'lip-full.jpg',
    label: 'Full Lips',
    descriptor: 'full plump lips',
    description: 'Substantial vermilion volume across both upper and lower borders'
  },
  {
    id: 'lip-thin',
    category: 'lips-mouth',
    filename: 'lip-thin.jpg',
    label: 'Thin Lips',
    descriptor: 'thin narrow lips',
    description: 'Slender vermilion band with minimal outward fullness'
  },
  {
    id: 'lip-heavy-upper',
    category: 'lips-mouth',
    filename: 'lip-heavy-upper.jpg',
    label: 'Heavy Upper Lip',
    descriptor: 'prominent fuller upper lip',
    description: 'Upper lip vermilion is visibly thicker and fuller than the lower lip'
  },
  {
    id: 'lip-heavy-lower',
    category: 'lips-mouth',
    filename: 'lip-heavy-lower.jpg',
    label: 'Heavy Lower Lip',
    descriptor: 'fuller heavy lower lip',
    description: 'Lower lip vermilion possesses greater projection and vertical fullness'
  },
  {
    id: 'lip-sharp-cupids-bow',
    category: 'lips-mouth',
    filename: 'lip-sharp-cupids-bow.jpg',
    label: "Sharp Cupid's Bow",
    descriptor: "defined sharp cupid's bow",
    description: "Crisp, angular V-shaped philtral depression on the upper vermilion border"
  },
  {
    id: 'lip-soft-cupids-bow',
    category: 'lips-mouth',
    filename: 'lip-soft-cupids-bow.jpg',
    label: "Soft Cupid's Bow",
    descriptor: "softly rounded cupid's bow",
    description: "Gentle curved undulating upper lip border without sharp peak angles"
  },

  // 6. Facial Hair (20 items)
  {
    id: 'beard-shaven',
    category: 'facial-hair',
    filename: 'beard-shaven.png',
    label: 'Clean Shaven',
    descriptor: 'clean-shaven smooth face',
    description: 'Completely hairless cheeks and jawline revealing unobstructed bone structure'
  },
  {
    id: 'beard-stubble-short',
    category: 'facial-hair',
    filename: 'beard-stubble-short.png',
    label: 'Light Stubble (5 O\'Clock)',
    descriptor: 'light 5 o\'clock stubble',
    description: 'Fine 1-day shadow across the lower cheeks and chin'
  },
  {
    id: 'beard-stubble-medium',
    category: 'facial-hair',
    filename: 'beard-stubble-medium.png',
    label: 'Medium Stubble',
    descriptor: 'medium 2-3 day stubble',
    description: 'Short defined stubble coverage across upper lip and jaw perimeter'
  },
  {
    id: 'beard-stubble-long',
    category: 'facial-hair',
    filename: 'beard-stubble-long.png',
    label: 'Heavy Stubble',
    descriptor: 'heavy 3-day stubble',
    description: 'Dense dark stubble with complete mandibular coverage'
  },
  {
    id: 'beard-full-beard',
    category: 'facial-hair',
    filename: 'beard-full-beard.png',
    label: 'Full Beard',
    descriptor: 'full dense beard and mustache',
    description: 'Continuous dense growth covering chin, jawline, cheeks and upper lip'
  },
  {
    id: 'beard-goatee',
    category: 'facial-hair',
    filename: 'beard-goatee.png',
    label: 'Classic Goatee',
    descriptor: 'classic goatee on chin',
    description: 'Isolated patch of hair concentrated on the chin below the lower lip'
  },
  {
    id: 'beard-circle-beard',
    category: 'facial-hair',
    filename: 'beard-circle-beard.png',
    label: 'Circle Beard',
    descriptor: 'neat circle beard around mouth',
    description: 'Neatly groomed circular goatee connecting around the mouth to a mustache'
  },
  {
    id: 'beard-extended-goatee',
    category: 'facial-hair',
    filename: 'beard-extended-goatee.png',
    label: 'Extended Goatee',
    descriptor: 'extended goatee along jawline',
    description: 'Goatee and mustache with lateral hair growth running along the jawline'
  },
  {
    id: 'beard-anchor',
    category: 'facial-hair',
    filename: 'beard-anchor.png',
    label: 'Anchor Beard',
    descriptor: 'anchor-shaped pointed beard',
    description: 'Pointed chin beard resembling an anchor paired with a thin mustache'
  },
  {
    id: 'beard-balbo',
    category: 'facial-hair',
    filename: 'beard-balbo.png',
    label: 'Balbo Beard',
    descriptor: 'balbo style beard and trimmed mustache',
    description: 'Three-section style featuring chin hair, soul patch, and separated mustache'
  },
  {
    id: 'beard-van-dyke',
    category: 'facial-hair',
    filename: 'beard-van-dyke.png',
    label: 'Van Dyke Beard',
    descriptor: 'van dyke pointed beard and separated mustache',
    description: 'Distinct pointed chin beard paired with an unconnected mustache'
  },
  {
    id: 'beard-ducktail',
    category: 'facial-hair',
    filename: 'beard-ducktail.png',
    label: 'Ducktail Beard',
    descriptor: 'tapered ducktail beard',
    description: 'Full beard trimmed to a downward-pointing wedge shape at the chin'
  },
  {
    id: 'beard-french-fork',
    category: 'facial-hair',
    filename: 'beard-french-fork.png',
    label: 'French Fork Beard',
    descriptor: 'split french fork beard',
    description: 'Distinctive double-pronged chin beard parted down the center'
  },
  {
    id: 'beard-garibaldi',
    category: 'facial-hair',
    filename: 'beard-garibaldi.png',
    label: 'Garibaldi Beard',
    descriptor: 'wide rounded garibaldi beard',
    description: 'Wide, robust, broad beard with a wide rounded bottom boundary'
  },
  {
    id: 'beard-bandholz',
    category: 'facial-hair',
    filename: 'beard-bandholz.png',
    label: 'Bandholz Beard',
    descriptor: 'long voluminous bandholz beard',
    description: 'Unchecked natural length full beard with full integrated mustache'
  },
  {
    id: 'beard-dutch',
    category: 'facial-hair',
    filename: 'beard-dutch.png',
    label: 'Old Dutch Beard',
    descriptor: 'dutch style beard without mustache',
    description: 'Wide full jaw and chin beard completely shaven above the upper lip'
  },
  {
    id: 'beard-imperial',
    category: 'facial-hair',
    filename: 'beard-imperial.png',
    label: 'Imperial Mustache & Beard',
    descriptor: 'imperial mustache and chin hair',
    description: 'Prominent upward-growing mustache styled into cheek hair'
  },
  {
    id: 'beard-mutton-chops',
    category: 'facial-hair',
    filename: 'beard-mutton-chops.png',
    label: 'Mutton Chops',
    descriptor: 'prominent mutton chops sideburns',
    description: 'Heavy, wide sideburns extending down to the corners of the mouth'
  },
  {
    id: 'beard-friendly-mutton-chops',
    category: 'facial-hair',
    filename: 'beard-friendly-mutton-chops.png',
    label: 'Friendly Mutton Chops',
    descriptor: 'mutton chops connected to mustache',
    description: 'Heavy sideburns connected across the upper lip by a full mustache'
  },
  {
    id: 'beard-verdi',
    category: 'facial-hair',
    filename: 'beard-verdi.png',
    label: 'Verdi Beard',
    descriptor: 'verdi rounded beard with styled mustache',
    description: 'Short rounded full beard complemented by an upward-curled mustache'
  },

  // 7. Hairline & Forehead (7 items)
  {
    id: 'hairline-straight',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-straight.jpg',
    label: 'Straight Hairline',
    descriptor: 'straight horizontal hairline',
    description: 'Linear horizontal frontal boundary across the top of the forehead'
  },
  {
    id: 'hairline-curved',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-curved.jpg',
    label: 'Curved / Bell Hairline',
    descriptor: 'gently curved rounded hairline',
    description: 'Smooth arch curving downward toward the temples in a rounded contour'
  },
  {
    id: 'hairline-broad',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-broad.jpg',
    label: 'Broad High Forehead',
    descriptor: 'broad tall high forehead',
    description: 'Substantial vertical height from brow line to hairline with broad width'
  },
  {
    id: 'hairline-narrow',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-narrow.jpg',
    label: 'Narrow Low Forehead',
    descriptor: 'narrow short forehead',
    description: 'Short vertical span between the eyebrows and lower hairline edge'
  },
  {
    id: 'hairline-m-shaped',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-m-shaped.jpg',
    label: 'M-Shaped / Receding Hairline',
    descriptor: 'm-shaped receding hairline at temples',
    description: 'Bilateral recession at the temporal corners forming an M configuration'
  },
  {
    id: 'hairline-fuzi-mount',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-fuzi-mount.jpg',
    label: "Widow's Peak Hairline",
    descriptor: "widow's peak v-shaped pointed hairline",
    description: "Distinct V-shaped focal hair point descending in the center of forehead"
  },
  {
    id: 'hairline-sharp',
    category: 'forehead-hairline',
    filename: 'forehead-hairline-sharp.jpg',
    label: 'Sharp Rectangular Hairline',
    descriptor: 'sharp geometric boxed hairline',
    description: 'Clean right-angle corners at the temple junctures'
  },

  // 8. Chin & Jawline (6 items)
  {
    id: 'chin-square',
    category: 'chin-jawline',
    filename: 'chin-square.jpg',
    label: 'Square Jawline',
    descriptor: 'sharp square angular jawline',
    description: 'Wide flat anterior mental protuberance with sharp mandibular angles'
  },
  {
    id: 'chin-round',
    category: 'chin-jawline',
    filename: 'chin-round.jpg',
    label: 'Round Chin',
    descriptor: 'softly rounded curved chin',
    description: 'Gentle convex lower curve without sharp bony projections'
  },
  {
    id: 'chin-long',
    category: 'chin-jawline',
    filename: 'chin-long.jpg',
    label: 'Long Extended Chin',
    descriptor: 'elongated prominent chin',
    description: 'Increased vertical distance between lower lip and base of chin'
  },
  {
    id: 'chin-short-narrow',
    category: 'chin-jawline',
    filename: 'chin-short-narrow.jpg',
    label: 'Short Narrow Chin',
    descriptor: 'short compact narrow chin',
    description: 'Compact vertical height with tapered lateral chin width'
  },
  {
    id: 'chin-protruding',
    category: 'chin-jawline',
    filename: 'chin-protruding.jpg',
    label: 'Protruding Chin',
    descriptor: 'forward-projecting protruding chin',
    description: 'Forward anterior projection of the lower jaw in profile view'
  },
  {
    id: 'chin-receding',
    category: 'chin-jawline',
    filename: 'chin-receding.jpg',
    label: 'Receding Chin',
    descriptor: 'receding sloping chin',
    description: 'Posterior slope of the chin bone beneath the lower lip profile'
  },

  // 9. Distinguishing Marks (8 items)
  {
    id: 'mark-scar',
    category: 'distinguishing-marks',
    filename: 'scar.png',
    label: 'Facial Scar',
    descriptor: 'noticeable linear facial scar',
    description: 'Fibrous pale or raised line resulting from previous laceration or injury'
  },
  {
    id: 'mark-freckles',
    category: 'distinguishing-marks',
    filename: 'freckles.png',
    label: 'Freckles',
    descriptor: 'scattered freckles across cheeks and nose',
    description: 'Small, flat pigmented ephelides distributed over the nasal bridge and cheeks'
  },
  {
    id: 'mark-birthmark',
    category: 'distinguishing-marks',
    filename: 'birthmark.png',
    label: 'Birthmark',
    descriptor: 'pigmented birthmark patch',
    description: 'Congenital irregular pigmented dermal patch on facial surface'
  },
  {
    id: 'mark-dark-circles',
    category: 'distinguishing-marks',
    filename: 'dark-circles.png',
    label: 'Dark Under-Eye Circles',
    descriptor: 'dark pronounced under-eye circles',
    description: 'Hyperpigmentation or shadowing in the infraorbital periorbital hollows'
  },
  {
    id: 'mark-wrinkles',
    category: 'distinguishing-marks',
    filename: 'wrinkles.png',
    label: 'Prominent Wrinkles',
    descriptor: 'prominent facial expression wrinkles',
    description: 'Deep horizontal forehead furrows, nasolabial folds, and crow\'s feet'
  },
  {
    id: 'mark-skin-tag',
    category: 'distinguishing-marks',
    filename: 'skin-tag.png',
    label: 'Skin Tag / Raised Mole',
    descriptor: 'raised skin tag or mole',
    description: 'Small raised benign cutaneous outgrowth or melanocytic papule'
  },
  {
    id: 'mark-sunburn',
    category: 'distinguishing-marks',
    filename: 'sunburn.png',
    label: 'Erythema / Reddened Skin',
    descriptor: 'reddened flushed skin tone',
    description: 'Noticeable red flushed skin tone across forehead and cheeks'
  },
  {
    id: 'mark-conditions-sheet',
    category: 'distinguishing-marks',
    filename: 'skin-conditions-sheet.png',
    label: 'Skin Conditions Reference Sheet',
    descriptor: 'visible skin condition markings',
    description: 'Multi-feature dermatological reference sheet for complex skin observations'
  }
];

// Enrich catalogue items with live image URLs
export const FEATURE_CATALOGUE = RAW_CATALOGUE_ITEMS.map((item) => ({
  ...item,
  imageUrl: getAssetUrl(item.category, item.filename)
}));

