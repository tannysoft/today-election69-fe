"use server";

import pb from '@/lib/pocketbase';

export async function getElectionData(limit = 3) {
    try {
        // Authenticate as Admin
        await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

        // 1. Fetch all areas
        // Sort by province name and zone number
        const areas = await pb.collection('areas').getFullList({
            sort: 'province,number',
            expand: 'province',
        });

        // 2. Fetch all candidates
        const candidates = await pb.collection('candidates').getFullList({
            sort: '-totalVotes', // High score first
            expand: 'party',
        });

        // 3. Map candidates to areas
        const areasWithCandidates = areas.map(area => {
            // Filter candidates for this area
            const areaCandidates = candidates
                .filter(c => c.area === area.id)
                .slice(0, limit) // Top N only
                .map((c, index) => ({
                    id: c.id,
                    rank: index + 1,
                    name: c.name,
                    party: c.expand?.party?.name || c.party || "",
                    partyLogoUrl: c.expand?.party?.logoUrl || null,
                    score: c.totalVotes,
                    color: c.expand?.party?.color || c.color || 'orange', // Party color > Candidate color > Default
                    image: c.photoUrl || (c.image ? pb.files.getUrl(c, c.image) : null)
                }));

            return {
                id: area.id,
                name: `${area.expand?.province?.name || area.province} เขต ${area.number}`,
                _provinceName: area.expand?.province?.name || area.province,
                _zoneNumber: area.number,
                candidates: areaCandidates
            };
        });

        // Client-side Sort: Province Name (Thai) -> Zone Number
        areasWithCandidates.sort((a, b) => {
            const provinceCompare = a._provinceName.localeCompare(b._provinceName, 'th');
            if (provinceCompare !== 0) return provinceCompare;
            return a._zoneNumber - b._zoneNumber;
        });

        // Filter out areas with no candidates if needed, or keep them to show empty state
        // For now, return all
        return areasWithCandidates;

    } catch (error) {
        console.error("Error fetching election data:", error);
        return [];
    }
}

export async function getPartyListData() {
    try {
        await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

        // 1. Fetch from 'parties' directly
        const results = await pb.collection('parties').getFullList({
            sort: '-totalSeats',
        });

        console.log("DEBUG: Parties count:", results.length);

        // 2. Map to expected format
        const formattedResults = results.map((record, index) => {
            return {
                rank: index + 1,
                name: record.name || "Unknown",
                count: record.totalSeats || 0,
                color: record.color || 'orange',
                logoUrl: record.logoUrl || null,
                leader: record.leader ? pb.files.getUrl(record, record.leader) : null
            };
        });

        return formattedResults;

    } catch (error) {
        console.error("Error fetching party list data:", error);
        return [];
    }
}

export async function getReferendumData() {
    try {
        await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

        // Try to fetch from 'referendum' collection
        // Sort by -created to get the latest active one
        const list = await pb.collection('referendum').getList(1, 1, {
            sort: '-created'
        });
        if (list.items.length > 0) {
            return {
                approve: list.items[0].agreeTotalVotes || 0,
                disapprove: list.items[0].disagreeTotalVotes || 0,
                no_vote: list.items[0].noVotes || 0,
                title: list.items[0].title || "หัวข้อประชามติ"
            };
        } else {
            // Mock Data if collection exists but empty or logic above falls through
            return {
                approve: 0,
                disapprove: 0,
                no_vote: 0,
                title: "คุณเห็นชอบหรือไม่ที่จะมีการแก้ไขรัฐธรรมนูญ?"
            };
        }
    } catch (error) {
        // Fallback Mock Data if collection doesn't exist
        console.warn("Using mock data for referendum:", error.message);
        return {
            approve: 654321,
            disapprove: 123456,
            no_vote: 5432,
            title: "คุณเห็นชอบหรือไม่ที่จะมีการแก้ไขรัฐธรรมนูญ?"
        };
    }
}
