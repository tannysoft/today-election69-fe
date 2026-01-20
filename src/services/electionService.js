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

        // 1. Fetch from 'partylistResults'
        const results = await pb.collection('partylistResults').getFullList({
            sort: '-totalSeats',
            expand: 'party',
        });

        console.log("DEBUG: Partylist results count:", results.length);
        if (results.length > 0) {
            console.log("DEBUG: First record expand:", JSON.stringify(results[0].expand, null, 2));
            console.log("DEBUG: First record party field:", results[0].party);
        }

        // 2. Map to expected format
        const formattedResults = results.map((record, index) => {
            const partyObj = record.expand?.party;
            return {
                rank: index + 1,
                name: partyObj?.name || "Unknown",
                count: record.totalSeats || 0, // Using totalSeats as the score
                color: partyObj?.color || 'orange',
                logoUrl: partyObj?.logoUrl || null,
                leader: partyObj?.leader ? pb.files.getUrl(partyObj, partyObj.leader) : null
            };
        });

        return formattedResults;

    } catch (error) {
        console.error("Error fetching party list data:", error);
        return [];
    }
}
