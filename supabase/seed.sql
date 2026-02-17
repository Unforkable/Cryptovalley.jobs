-- Seed data for development
-- Run this after schema.sql to populate with sample data

insert into public.companies (name, slug, logo_url, website, description, location) values
  ('Ethereum Foundation', 'ethereum-foundation', null, 'https://ethereum.org', 'The Ethereum Foundation is a non-profit that supports the Ethereum ecosystem.', 'Zug, Switzerland'),
  ('Cardano Foundation', 'cardano-foundation', null, 'https://cardanofoundation.org', 'The Cardano Foundation is an independent Swiss-based entity that oversees the advancement of Cardano.', 'Zug, Switzerland'),
  ('Tezos Foundation', 'tezos-foundation', null, 'https://tezos.foundation', 'The Tezos Foundation supports the Tezos protocol through grants and ecosystem development.', 'Zug, Switzerland'),
  ('Sygnum', 'sygnum', null, 'https://sygnum.com', 'Sygnum is the world''s first digital asset bank, providing regulated banking services for digital assets.', 'Zurich, Switzerland'),
  ('Bitcoin Suisse', 'bitcoin-suisse', null, 'https://bitcoinsuisse.com', 'Bitcoin Suisse is a Swiss-based financial service provider specializing in crypto-assets.', 'Zug, Switzerland');

insert into public.jobs (company_id, title, slug, description, job_type, location_type, location, salary_min, salary_max, salary_currency, apply_url, tags, status, published_at, expires_at) values
  ((select id from public.companies where slug = 'ethereum-foundation'),
   'Senior Solidity Developer', 'senior-solidity-developer-ethereum',
   'We are looking for an experienced Solidity developer to help build the next generation of Ethereum smart contracts and tooling.',
   'full-time', 'hybrid', 'Zug, Switzerland', 120000, 180000, 'CHF',
   'https://ethereum.org/careers', array['solidity', 'ethereum', 'smart-contracts', 'defi'],
   'active', now(), now() + interval '30 days'),

  ((select id from public.companies where slug = 'cardano-foundation'),
   'Blockchain Research Engineer', 'blockchain-research-engineer-cardano',
   'Join our research team to work on formal verification and consensus protocol improvements for the Cardano blockchain.',
   'full-time', 'onsite', 'Zug, Switzerland', 130000, 170000, 'CHF',
   'https://cardanofoundation.org/careers', array['haskell', 'research', 'consensus', 'cardano'],
   'active', now(), now() + interval '30 days'),

  ((select id from public.companies where slug = 'sygnum'),
   'Full Stack Engineer (Web3)', 'full-stack-engineer-web3-sygnum',
   'Build the future of digital asset banking. Work with our engineering team on our tokenization platform and DeFi integrations.',
   'full-time', 'hybrid', 'Zurich, Switzerland', 110000, 160000, 'CHF',
   'https://sygnum.com/careers', array['typescript', 'react', 'web3', 'defi', 'tokenization'],
   'active', now(), now() + interval '30 days'),

  ((select id from public.companies where slug = 'bitcoin-suisse'),
   'DevOps Engineer', 'devops-engineer-bitcoin-suisse',
   'Manage and scale our cloud infrastructure supporting crypto trading and custody services.',
   'full-time', 'onsite', 'Zug, Switzerland', 100000, 150000, 'CHF',
   'https://bitcoinsuisse.com/careers', array['devops', 'kubernetes', 'aws', 'security'],
   'active', now(), now() + interval '30 days'),

  ((select id from public.companies where slug = 'tezos-foundation'),
   'Smart Contract Auditor', 'smart-contract-auditor-tezos',
   'Review and audit smart contracts on the Tezos blockchain. Identify vulnerabilities and help teams ship secure code.',
   'contract', 'remote', null, 140000, 200000, 'CHF',
   'https://tezos.foundation/careers', array['security', 'audit', 'smart-contracts', 'tezos'],
   'active', now(), now() + interval '30 days');
