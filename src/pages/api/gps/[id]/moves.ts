import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { GpsMajorMove, GpsMajorMoveInput } from '@/types/gps';

async function handlePost(userId: string, gpsId: string, req: NextApiRequest, res: NextApiResponse) {
    const gpsRef = adminDb.collection('gps').doc(gpsId);
    const snap = await gpsRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'GPS not found' });
    }

    const move = req.body as GpsMajorMoveInput;
    if (!move?.title?.trim()) {
        return res.status(400).json({ error: 'title is required' });
    }

    const existingMoves = (snap.data()?.majorMoves ?? []) as GpsMajorMove[];
    if (existingMoves.length >= 5) {
        return res.status(400).json({ error: 'maximum of 5 major moves allowed' });
    }

    const tasksSnapshot = await adminDb
        .collection('tasks')
        .where('userId', '==', userId)
        .get();

    const moveId = randomUUID();
    const taskRef = adminDb.collection('tasks').doc();
    const isNumeric = move.isNumeric ?? false;
    const targetCount = isNumeric ? (move.targetCount ?? null) : null;

    const batch = adminDb.batch();

    batch.set(taskRef, {
        userId,
        title: move.title,
        description: '',
        status: 'todo',
        totalFocusedTime: 0,
        order: tasksSnapshot.size,
        isArchived: false,
        isDaily: false,
        lastResetDate: '',
        isNumeric,
        targetCount,
        remainingCount: isNumeric ? targetCount : null,
        gpsId,
        majorMoveId: moveId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    const newMove: GpsMajorMove = { id: moveId, taskId: taskRef.id, title: move.title };
    batch.update(gpsRef, {
        majorMoves: [...existingMoves, newMove],
        updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return res.status(201).json({ success: true, move: newMove });
}

async function handlePut(userId: string, gpsId: string, req: NextApiRequest, res: NextApiResponse) {
    const gpsRef = adminDb.collection('gps').doc(gpsId);
    const snap = await gpsRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'GPS not found' });
    }

    const { moveId, title, isNumeric, targetCount, remainingCount } = req.body as {
        moveId: string;
        title?: string;
        isNumeric?: boolean;
        targetCount?: number | null;
        remainingCount?: number | null;
    };
    if (!moveId) {
        return res.status(400).json({ error: 'moveId is required' });
    }

    const existingMoves = (snap.data()?.majorMoves ?? []) as GpsMajorMove[];
    const target = existingMoves.find(m => m.id === moveId);
    if (!target) {
        return res.status(404).json({ error: 'Major move not found' });
    }

    const trimmedTitle = typeof title === 'string' ? title.trim() : undefined;
    const taskUpdate: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    if (trimmedTitle) taskUpdate.title = trimmedTitle;
    if (isNumeric !== undefined) taskUpdate.isNumeric = isNumeric;
    if (targetCount !== undefined) taskUpdate.targetCount = targetCount;
    if (remainingCount !== undefined) taskUpdate.remainingCount = remainingCount;

    const batch = adminDb.batch();

    if (target.taskId) {
        batch.update(adminDb.collection('tasks').doc(target.taskId), taskUpdate);
    }

    if (trimmedTitle) {
        batch.update(gpsRef, {
            majorMoves: existingMoves.map(m => (m.id === moveId ? { ...m, title: trimmedTitle } : m)),
            updatedAt: FieldValue.serverTimestamp(),
        });
    }

    await batch.commit();

    return res.status(200).json({ success: true });
}

async function handleDelete(userId: string, gpsId: string, req: NextApiRequest, res: NextApiResponse) {
    const gpsRef = adminDb.collection('gps').doc(gpsId);
    const snap = await gpsRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'GPS not found' });
    }

    const moveId = req.query.moveId as string;
    const existingMoves = (snap.data()?.majorMoves ?? []) as GpsMajorMove[];
    const target = existingMoves.find(m => m.id === moveId);

    if (!target) {
        return res.status(404).json({ error: 'Major move not found' });
    }

    const batch = adminDb.batch();

    if (target.taskId) {
        batch.update(adminDb.collection('tasks').doc(target.taskId), {
            gpsId: null,
            majorMoveId: null,
            updatedAt: FieldValue.serverTimestamp(),
        });
    }

    batch.update(gpsRef, {
        majorMoves: existingMoves.filter(m => m.id !== moveId),
        updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return res.status(200).json({ success: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = await verifyToken(req, res);
    if (!userId) return;

    const gpsId = req.query.id as string;

    try {
        if (req.method === 'POST') return await handlePost(userId, gpsId, req, res);
        if (req.method === 'PUT') return await handlePut(userId, gpsId, req, res);
        if (req.method === 'DELETE') return await handleDelete(userId, gpsId, req, res);
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[/api/gps/[id]/moves]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
