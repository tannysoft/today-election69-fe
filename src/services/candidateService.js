"use server";

import pb from '@/lib/pocketbase';

async function getAdminPb() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
    return pb;
}

export async function getCandidatesWithWebsitePhotos() {
    const pb = await getAdminPb();
    try {
        // Fetch candidates who have a photoUrlWebsite value.
        // We fetching everything for now as filter might be tricky with "doesn't equal empty string" in some PB versions directly, 
        // but 'photoUrlWebsite != ""' is standard PB filter.
        // Also sorting by updated to see newest first.
        const records = await pb.collection('candidates').getFullList({
            filter: 'photoUrlWebsite != "" && photoApprove != true',
            sort: '-updated',
        });

        // Return plain objects
        return records.map(record => ({
            id: record.id,
            firstName: record.firstName,
            lastName: record.lastName,
            party: record.party,
            photoUrl: record.photoUrl,
            photoUrlWebsite: record.photoUrlWebsite,
            photoApprove: record.photoApprove,
            province: record.province,
            district: record.district,
            no: record.no
        }));
    } catch (error) {
        console.error("Error fetching candidates with website photos:", error);
        return [];
    }
}

export async function getPhotoApprovalStats() {
    const pb = await getAdminPb();
    try {
        // Total with website photos
        const totalRecords = await pb.collection('candidates').getList(1, 1, {
            filter: 'photoUrlWebsite != ""',
        });
        const total = totalRecords.totalItems;

        // Approved with website photos
        const approvedRecords = await pb.collection('candidates').getList(1, 1, {
            filter: 'photoUrlWebsite != "" && photoApprove = true',
        });
        const approved = approvedRecords.totalItems;

        return { total, approved };
    } catch (error) {
        console.error("Error fetching approval stats:", error);
        return { total: 0, approved: 0 };
    }
}

export async function approveCandidatePhoto(id, isApproved) {
    const pb = await getAdminPb();
    try {
        await pb.collection('candidates').update(id, {
            photoApprove: isApproved
        });
        return { success: true };
    } catch (error) {
        console.error(`Error updating photo approval for ${id}:`, error);
        return { success: false, error: error.message };
    }
}
