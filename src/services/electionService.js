"use server";

import pb from '@/lib/pocketbase';

export async function getElectionData() {
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
                .slice(0, 3) // Top 3 only
                .map((c, index) => ({
                    rank: index + 1,
                    name: c.name,
                    party: c.expand?.party?.name || c.party || "",
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
