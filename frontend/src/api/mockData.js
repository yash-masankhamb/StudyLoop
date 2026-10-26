// Seed data for standalone frontend testing (no backend or database required)

export const INITIAL_USERS = [
  {
    id: 1,
    name: 'Aisha Patel',
    email: 'student@school.edu',
    password: 'password123',
    role: 'student',
    created_at: '2026-10-20T09:00:00.000Z',
  },
  {
    id: 2,
    name: 'Ms. Elena Rivera',
    email: 'teacher@school.edu',
    password: 'password123',
    role: 'teacher',
    created_at: '2026-10-15T08:30:00.000Z',
  },
  {
    id: 3,
    name: 'Mr. David Chen',
    email: 'chen@school.edu',
    password: 'password123',
    role: 'teacher',
    created_at: '2026-10-18T11:00:00.000Z',
  },
];

export const INITIAL_NOTES = [
  {
    id: 1,
    title: 'Principles of Cellular Respiration',
    subject: 'Biology',
    content: `Cellular respiration is the metabolic process through which biochemical energy from nutrients is transformed into adenosine triphosphate (ATP), subsequently releasing waste products.

1. Glycolysis
Occurs in the cytoplasm without oxygen. One glucose molecule (6 carbons) splits into two pyruvate molecules (3 carbons each), producing a net yield of 2 ATP and 2 NADH.

2. The Krebs Cycle (Citric Acid Cycle)
Occurs in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. Through progressive oxidation, the cycle generates 2 ATP, 6 NADH, and 2 FADH2 per glucose molecule.

3. Oxidative Phosphorylation & Electron Transport Chain
Located on the inner mitochondrial membrane. High-energy electrons donated by NADH and FADH2 pass through transmembrane protein complexes. Chemiosmosis drives ATP synthase to produce approximately 28 to 32 ATP molecules.`,
    author_id: 2,
    author_name: 'Ms. Elena Rivera',
    status: 'approved',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-22T14:15:00.000Z',
    updated_at: '2026-10-22T14:15:00.000Z',
  },
  {
    id: 2,
    title: 'Keynesian vs. Classical Macroeconomic Models',
    subject: 'Economics',
    content: `A concise comparative breakdown of core macroeconomic paradigms.

Classical School (Say's Law & Price Flexibility):
- Supply creates its own demand.
- Wages and prices are completely flexible in the long run.
- Markets naturally self-correct toward full employment; government interventions distort allocation and create inflation.

Keynesian School (Aggregate Demand & Sticky Prices):
- Total spending in the economy determines output and employment levels.
- Wages and prices are "sticky downward" due to contracts and behavioral friction.
- Recessions require active counter-cyclical fiscal policy (government expenditure and taxation adjustments) to stimulate demand.`,
    author_id: 3,
    author_name: 'Mr. David Chen',
    status: 'approved',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-23T10:45:00.000Z',
    updated_at: '2026-10-23T10:45:00.000Z',
  },
  {
    id: 3,
    title: 'Linear Transformations & Rank-Nullity Theorem',
    subject: 'Mathematics',
    content: `Key definitions and fundamental theorem for finite-dimensional vector spaces.

Definition:
A transformation T: V -> W is linear if:
1. T(u + v) = T(u) + T(v) for all vectors u, v in V
2. T(c * v) = c * T(v) for all scalars c and vectors v in V

Rank-Nullity Theorem:
Let V be a finite-dimensional vector space. For any linear map T: V -> W:
dim(V) = rank(T) + nullity(T)

Where:
- rank(T) = dim(image(T))
- nullity(T) = dim(kernel(T))

Application to Matrix Invertibility:
A square n x n matrix A is invertible if and only if rank(A) = n, implying nullity(A) = 0.`,
    author_id: 2,
    author_name: 'Ms. Elena Rivera',
    status: 'approved',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-24T16:20:00.000Z',
    updated_at: '2026-10-24T16:20:00.000Z',
  },
  {
    id: 4,
    title: 'Laboratory Synthesis of Acetylsalicylic Acid (Aspirin)',
    subject: 'Chemistry',
    content: `Experimental protocol summary:
Salicylic acid reacts with acetic anhydride in the presence of concentrated sulfuric or phosphoric acid as a catalyst.
Reaction:
C7H6O3 + C4H6O3 -> C9H8O4 + C2H4O2

Purification by recrystallization using warm ethanol and chilled deionized water. Melting point determination confirms purity between 135°C and 136°C.`,
    author_id: 1,
    author_name: 'Aisha Patel',
    status: 'pending',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-25T11:00:00.000Z',
    updated_at: '2026-10-25T11:00:00.000Z',
  },
  {
    id: 5,
    title: 'Green\'s Theorem & Planar Line Integrals',
    subject: 'Mathematics',
    content: `Notes on evaluating counter-clockwise line integrals over positively oriented, simple closed curves C bounding region D.
Formula:
oint_C (L dx + M dy) = double_int_D ((partial M / partial x) - (partial L / partial y)) dA`,
    author_id: 1,
    author_name: 'Aisha Patel',
    status: 'rejected',
    rejection_reason: 'Please provide at least two worked example problems and verify orientation conditions.',
    reviewed_by: 2,
    created_at: '2026-10-21T09:30:00.000Z',
    updated_at: '2026-10-22T08:10:00.000Z',
  },
];

export const INITIAL_SETS = [
  {
    id: 1,
    title: 'Cell Biology Essentials',
    subject: 'Biology',
    author_id: 2,
    author_name: 'Ms. Elena Rivera',
    status: 'approved',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-21T12:00:00.000Z',
    updated_at: '2026-10-21T12:00:00.000Z',
    cards: [
      {
        id: 101,
        set_id: 1,
        front: 'What is the role of the Golgi apparatus?',
        back: 'Modifies, sorts, and packages proteins and lipids for secretion or delivery to other organelles.',
        position: 0,
      },
      {
        id: 102,
        set_id: 1,
        front: 'What distinguishes active transport from passive facilitated diffusion?',
        back: 'Active transport moves solutes against their electrochemical gradient and requires cellular energy (usually ATP hydrolysis).',
        position: 1,
      },
      {
        id: 103,
        set_id: 1,
        front: 'What takes place during Anaphase of Mitosis?',
        back: 'Sister chromatids separate at the centromere and are pulled toward opposite spindle poles by shortening kinetochore microtubules.',
        position: 2,
      },
      {
        id: 104,
        set_id: 1,
        front: 'What is the primary function of ribosomes?',
        back: 'Translation of messenger RNA (mRNA) sequences into polypeptide chains during protein synthesis.',
        position: 3,
      },
    ],
  },
  {
    id: 2,
    title: 'Key Milestones of the Interwar Period (1918-1939)',
    subject: 'History',
    author_id: 3,
    author_name: 'Mr. David Chen',
    status: 'approved',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-23T15:30:00.000Z',
    updated_at: '2026-10-23T15:30:00.000Z',
    cards: [
      {
        id: 201,
        set_id: 2,
        front: 'What was the primary economic trigger of the 1929 Great Depression?',
        back: 'The Wall Street stock market crash in October 1929 following agricultural deflation, bank failures, and credit overextension.',
        position: 0,
      },
      {
        id: 202,
        set_id: 2,
        front: 'What was the stated policy goal of the 1938 Munich Agreement?',
        back: 'Appeasement: permitting German annexation of the Sudetenland in exchange for a pledge of peace.',
        position: 1,
      },
      {
        id: 203,
        set_id: 2,
        front: 'Why did the League of Nations fail to curb expansionism in Manchuria and Abyssinia?',
        back: 'Lack of an independent military force, requirement for unanimous consent, and absence of major powers like the United States.',
        position: 2,
      },
    ],
  },
  {
    id: 3,
    title: 'Organic Chemistry Reaction Mechanisms',
    subject: 'Chemistry',
    author_id: 1,
    author_name: 'Aisha Patel',
    status: 'pending',
    rejection_reason: null,
    reviewed_by: null,
    created_at: '2026-10-25T14:00:00.000Z',
    updated_at: '2026-10-25T14:00:00.000Z',
    cards: [
      {
        id: 301,
        set_id: 3,
        front: 'What characterizes an SN1 substitution reaction?',
        back: 'Two-step unimolecular mechanism involving a rate-determining carbocation intermediate, leading to racemization of chiral centers.',
        position: 0,
      },
      {
        id: 302,
        set_id: 3,
        front: 'What is Zaitsev\'s Rule for elimination reactions?',
        back: 'The major alkene product is the more substituted, thermodynamically more stable alkene.',
        position: 1,
      },
    ],
  },
];
