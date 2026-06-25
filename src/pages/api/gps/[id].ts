import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { GpsUpdateInput, GpsMajorMove } from '@/types/gps';

async function handlePut(userId: string, gpsId: string, req: NextApiRequest, res: NextApiResponse) {
    const gpsRef = adminDb.collection('gps').doc(gpsId);
    const snap = await gpsRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'GPS not found' });
    }

    const body = req.body as GpsUpdateInput;
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    if (body.title !== undefined) updates.title = body.title;
    if (body.status !== undefined) updates.status = body.status;
    if (body.goals !== undefined) updates.goals = body.goals;
    if (body.antiGoals !== undefined) updates.antiGoals = body.antiGoals;
    if (body.crystalBall !== undefined) updates.crystalBall = body.crystalBall;
    if (body.system !== undefined) updates.system = body.system;

    await gpsRef.update(updates);
    return res.status(200).json({ success: true });
}

async function handleDelete(userId: string, gpsId: string, res: NextApiResponse) {
    const gpsRef = adminDb.collection('gps').doc(gpsId);
    const snap = await gpsRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'GPS not found' });
    }

    const majorMoves = (snap.data()?.majorMoves ?? []) as GpsMajorMove[];
    const batch = adminDb.batch();

    majorMoves.forEach(move => {
        if (move.taskId) {
            batch.update(adminDb.collection('tasks').doc(move.taskId), {
                gpsId: null,
                majorMoveId: null,
                updatedAt: FieldValue.serverTimestamp(),
            });
        }
    });

    batch.delete(gpsRef);
    await batch.commit();

    return res.status(200).json({ success: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = await verifyToken(req, res);
    if (!userId) return;

    const gpsId = req.query.id as string;

    try {
        if (req.method === 'PUT') return await handlePut(userId, gpsId, req, res);
        if (req.method === 'DELETE') return await handleDelete(userId, gpsId, res);
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[/api/gps/[id]]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
