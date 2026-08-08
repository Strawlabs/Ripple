import { describe, it, expect } from 'vitest';
import { buildPrompt, BrandContext } from './prompt-builder';

const brand: BrandContext = {
  companyName: 'Aenexz Tech',
  industry: 'Technology & Software',
  tone: 'Professional',
  audience: 'Founders',
  hashtags: ['#AI', '#SaaS'],
  rules: 'Never use emojis.',
};

describe('buildPrompt — BR-AI-001 (unique formatting per platform)', () => {
  it('produces a different prompt for each platform', () => {
    const linkedin = buildPrompt('linkedin', 'Product launch', brand);
    const facebook = buildPrompt('facebook', 'Product launch', brand);
    const instagram = buildPrompt('instagram', 'Product launch', brand);

    expect(linkedin).not.toBe(facebook);
    expect(facebook).not.toBe(instagram);
    expect(linkedin).not.toBe(instagram);
  });

  it('includes platform-specific guidance', () => {
    expect(buildPrompt('linkedin', 'x', brand)).toContain('LinkedIn');
    expect(buildPrompt('facebook', 'x', brand)).toContain('Facebook');
    expect(buildPrompt('instagram', 'x', brand)).toContain('Instagram');
  });
});

describe('buildPrompt — BR-AI-002 (Brand Memory influences content)', () => {
  it('includes the company name, tone, audience, and rules', () => {
    const prompt = buildPrompt('linkedin', 'Product launch', brand);
    expect(prompt).toContain('Aenexz Tech');
    expect(prompt).toContain('Professional');
    expect(prompt).toContain('Founders');
    expect(prompt).toContain('Never use emojis.');
  });

  it('includes preferred hashtags when present', () => {
    const prompt = buildPrompt('linkedin', 'Product launch', brand);
    expect(prompt).toContain('#AI');
    expect(prompt).toContain('#SaaS');
  });

  it('still produces a valid prompt when optional brand fields are missing', () => {
    const minimalBrand: BrandContext = { companyName: 'Bare Co' };
    const prompt = buildPrompt('linkedin', 'Product launch', minimalBrand);
    expect(prompt).toContain('Bare Co');
    expect(prompt).toContain('Product launch');
  });

  it('always includes the topic', () => {
    const prompt = buildPrompt('linkedin', 'A very specific topic string', brand);
    expect(prompt).toContain('A very specific topic string');
  });
});
