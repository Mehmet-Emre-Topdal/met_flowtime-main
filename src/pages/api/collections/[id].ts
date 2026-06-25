import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { CollectionUpdateInput } from '@/types/collection';

async function handlePut(userId: string, collectionId: string, req: NextApiRequest, res: NextApiResponse) {
    const collectionRef = adminDb.collection('collections').doc(collectionId);
    const snap = await collectionRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'Collection not found' });
    }

    const body = req.body as CollectionUpdateInput;
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.color !== undefined) updates.color = body.color;

    await collectionRef.update(updates);
    return res.status(200).json({ success: true });
}

async function handleDelete(userId: string, collectionId: string, res: NextApiResponse) {
    const collectionRef = adminDb.collection('collections').doc(collectionId);
    const snap = await collectionRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: 'Collection not found' });
    }

    const linkedTasks = await adminDb
        .collection('tasks')
        .where('userId', '==', userId)
        .where('collectionId', '==', collectionId)
        .get();

    const batch = adminDb.batch();
    linkedTasks.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(collectionRef);
    await batch.commit();

    return res.status(200).json({ success: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = await verifyToken(req, res);
    if (!userId) return;

    const collectionId = req.query.id as string;

    try {
        if (req.method === 'PUT') return await handlePut(userId, collectionId, req, res);
        if (req.method === 'DELETE') return await handleDelete(userId, collectionId, res);
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[/api/collections/[id]]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
