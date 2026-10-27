USE studyloop;

-- Users (Password for both: password123)
-- Hash generated via bcrypt.hash('password123', 10)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Aisha Patel', 'student@school.edu', '$2a$10$RbtpKreSCbetXypvMvdJ/.158CHzmSr1tbzDU9mZnCoV4jFRr5Tm6', 'student'),
(2, 'Ms. Elena Rivera', 'teacher@school.edu', '$2a$10$RbtpKreSCbetXypvMvdJ/.158CHzmSr1tbzDU9mZnCoV4jFRr5Tm6', 'teacher')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Approved Notes
INSERT INTO notes (id, title, subject, content, author_id, status) VALUES
(1, 'Principles of Cellular Respiration', 'Biology', 'Cellular respiration is the metabolic process through which biochemical energy from nutrients is transformed into ATP.\n\n1. Glycolysis: Cytoplasm, net 2 ATP, 2 NADH.\n2. Krebs Cycle: Mitochondrial matrix, produces NADH, FADH2, and ATP.\n3. Electron Transport Chain: Chemiosmosis drives ATP synthase for 28-32 ATP.', 2, 'approved'),
(2, 'Keynesian vs. Classical Macroeconomic Models', 'Economics', 'Classical School: Supply creates demand; flexible prices/wages self-correct to full employment.\nKeynesian School: Aggregate demand drives output; sticky wages require fiscal intervention.', 2, 'approved')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Pending Note (for teacher review queue testing)
INSERT INTO notes (id, title, subject, content, author_id, status) VALUES
(3, 'Synthesis of Acetylsalicylic Acid (Aspirin)', 'Chemistry', 'Salicylic acid reacts with acetic anhydride in the presence of concentrated phosphoric acid.\nPurification by recrystallization using warm ethanol and chilled water.', 1, 'pending')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Approved Flashcard Set
INSERT INTO sets (id, title, subject, author_id, status) VALUES
(1, 'Cell Biology Essentials', 'Biology', 2, 'approved')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO cards (id, set_id, front, back, position) VALUES
(101, 1, 'What is the role of the Golgi apparatus?', 'Modifies, sorts, and packages proteins and lipids for delivery.', 0),
(102, 1, 'What distinguishes active transport from facilitated diffusion?', 'Active transport moves solutes against gradient and requires ATP.', 1)
ON DUPLICATE KEY UPDATE front=VALUES(front);

-- Pending Set (for review queue testing)
INSERT INTO sets (id, title, subject, author_id, status) VALUES
(2, 'Organic Chemistry Mechanisms', 'Chemistry', 1, 'pending')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO cards (id, set_id, front, back, position) VALUES
(201, 2, 'What characterizes an SN1 reaction?', 'Two-step unimolecular mechanism involving a carbocation intermediate.', 0)
ON DUPLICATE KEY UPDATE front=VALUES(front);
