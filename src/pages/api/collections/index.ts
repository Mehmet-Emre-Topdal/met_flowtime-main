import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/api-auth';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { parseFirestoreTimestamp } from '@/lib/firestoreHelpers';
import type { CollectionDto, CollectionCreateInput } from '@/types/collection';
import { COLLECTION_PALETTE } from '@/types/collection';

const toISO = (val: Timestamp | string | undefined): string =>
    val ? parseFirestoreTimestamp(val).toISOString() : '';

async function handleGet(userId: string, res: NextApiResponse) {
    const snapshot = await adminDb
        .collection('collections')
        .where('userId', '==', userId)
        .orderBy('order', 'asc')
        .get();

    const collections: CollectionDto[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            userId: data.userId,
            name: data.name,
            color: data.color,
            order: data.order,
            createdAt: toISO(data.createdAt),
            updatedAt: toISO(data.updatedAt),
        };
    });

    return res.status(200).json({ collections });
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse) {
    const { name } = req.body as CollectionCreateInput;

    if (!name?.trim()) {
        return res.status(400).json({ error: 'name is required' });
    }

    const existing = await adminDb
        .collection('collections')
        .where('userId', '==', userId)
        .get();
    const order = existing.size;
    const color = COLLECTION_PALETTE[order % COLLECTION_PALETTE.length];

    const docRef = await adminDb.collection('collections').add({
        userId,
        name: name.trim(),
        color,
        order,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ success: true, id: docRef.id });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = await verifyToken(req, res);
    if (!userId) return;

    try {
        if (req.method === 'GET') return await handleGet(userId, res);
        if (req.method === 'POST') return await handlePost(userId, req, res);
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[/api/collections]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
