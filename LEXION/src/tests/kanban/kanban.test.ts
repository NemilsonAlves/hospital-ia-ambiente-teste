import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../api/server';

type Stage = { key: string; title: string; cards: { id: string; title: string; owner_name?: string }[] };

describe('Kanban API', () => {
  it('returns board with stages and cards', async () => {
    const res = await request(app)
      .get('/api/kanban/board')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.board?.stages)).toBe(true);
    const stages: Stage[] = res.body.board.stages as Stage[];
    const anyCards = stages.some((s) => Array.isArray(s.cards) && s.cards.length > 0);
    expect(anyCards).toBe(true);
  });

  it('moves a card between stages', async () => {
    const board = await request(app)
      .get('/api/kanban/board')
      .set('Authorization', 'Bearer test-token');
    const entrada = (board.body.board.stages as Stage[]).find((s) => s.key === 'entrada') as Stage;
    const cardId = entrada.cards[0].id;

    const move = await request(app)
      .post('/api/kanban/move')
      .set('Authorization', 'Bearer test-token')
      .send({ process_id: cardId, from_stage: 'entrada', to_stage: 'cadastro' });
    expect(move.status).toBe(200);
    expect(move.body).toHaveProperty('success', true);

    const after = await request(app)
      .get('/api/kanban/board')
      .set('Authorization', 'Bearer test-token');
    const cadastro = (after.body.board.stages as Stage[]).find((s) => s.key === 'cadastro') as Stage;
    const found = cadastro.cards.find((c) => c.id === cardId);
    expect(Boolean(found)).toBe(true);
  });
});
