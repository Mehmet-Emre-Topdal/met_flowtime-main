import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/api-auth';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { parseFirestoreTimestamp } from '@/lib/firestoreHelpers';
import type { GpsDto, GpsCreateInput, GpsMajorMove } from '@/types/gps';

const toISO = (val: Timestamp | string | undefined): string =>
    val ? parseFirestoreTimestamp(val).toISOString() : '';

async function handleGet(userId: string, res: NextApiResponse) {
    const snapshot = await adminDb
        .collection('gps')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    const items: GpsDto[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            userId: data.userId,
            title: data.title,
            status: data.status,
            goals: data.goals ?? [],
            antiGoals: data.antiGoals ?? [],
            majorMoves: data.majorMoves ?? [],
            crystalBall: data.crystalBall ?? [],
            system: data.system ?? { tracking: '', reminders: [], accountability: '' },
            createdAt: toISO(data.createdAt),
            updatedAt: toISO(data.updatedAt),
        };
    });

    return res.status(200).json({ gps: items });
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse) {
    const input = req.body as GpsCreateInput;

    if (!input?.title?.trim()) {
        return res.status(400).json({ error: 'title is required' });
    }
    if (!Array.isArray(input.majorMoves) || input.majorMoves.length < 1) {
        return res.status(400).json({ error: 'at least one major move is required' });
    }

    const tasksSnapshot = await adminDb
        .collection('tasks')
        .where('userId', '==', userId)
        .get();
    const baseOrder = tasksSnapshot.size;

    const gpsRef = adminDb.collection('gps').doc();
    const batch = adminDb.batch();

    const majorMoves: GpsMajorMove[] = input.majorMoves.map((move, index) => {
        const moveId = randomUUID();
        const taskRef = adminDb.collection('tasks').doc();
        const isNumeric = move.isNumeric ?? false;
        const targetCount = isNumeric ? (move.targetCount ?? null) : null;

        batch.set(taskRef, {
            userId,
            title: move.title,
            description: '',
            status: 'todo',
            totalFocusedTime: 0,
            order: baseOrder + index,
            isArchived: false,
            isDaily: false,
            lastResetDate: '',
            isNumeric,
            targetCount,
            remainingCount: isNumeric ? targetCount : null,
            gpsId: gpsRef.id,
            majorMoveId: moveId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { id: moveId, taskId: taskRef.id, title: move.title };
    });

    batch.set(gpsRef, {
        userId,
        title: input.title,
        status: 'active',
        goals: input.goals ?? [],
        antiGoals: input.antiGoals ?? [],
        majorMoves,
        crystalBall: input.crystalBall ?? [],
        system: input.system ?? { tracking: '', reminders: [], accountability: '' },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return res.status(201).json({ success: true, id: gpsRef.id });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = await verifyToken(req, res);
    if (!userId) return;

    try {
        if (req.method === 'GET') return await handleGet(userId, res);
        if (req.method === 'POST') return await handlePost(userId, req, res);
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[/api/gps]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
