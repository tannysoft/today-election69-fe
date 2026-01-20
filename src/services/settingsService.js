"use server";

import PocketBase from 'pocketbase';

// Create a fresh instance for server-side operations to avoid state pollution
// but getting the URL from the existing lib or env would be better.
// For now, I'll match the URL found in src/lib/pocketbase.js
const PB_URL = 'https://election69.livetubex.com';

async function getAdminPb() {
    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
    return pb;
}

export async function getSettings() {
    const pb = await getAdminPb();

    try {
        const list = await pb.collection('settings').getList(1, 1);
        if (list.items.length > 0) {
            // Found settings. Async ensure public rules.
            ensureCollectionsPublic().catch(err => console.error("Auto-fix permissions failed:", err));

            return {
                id: list.items[0].id,
                filter_province: list.items[0].filter_province || "",
                filter_district: list.items[0].filter_district || "",
                hide_zero_score: list.items[0].hide_zero_score || false,
                remove_background: list.items[0].remove_background || false
            };
        } else {
            // Collection exists but empty -> create default
            const newRecord = await pb.collection('settings').create({
                filter_province: "",
                filter_district: "",
                hide_zero_score: false,
                remove_background: false
            });
            return {
                id: newRecord.id,
                filter_province: "",
                filter_district: "",
                hide_zero_score: false,
                remove_background: false
            };
        }
    } catch (error) {
        // If 404, Collection might not exist.
        if (error.status === 404) {
            console.log("Settings collection missing. Attempting to create...");
            try {
                // Create Collection
                await pb.collections.create({
                    name: 'settings',
                    type: 'base',
                    schema: [
                        { name: 'filter_province', type: 'text' },
                        { name: 'filter_district', type: 'text' },
                        { name: 'hide_zero_score', type: 'bool' }
                    ],
                    listRule: '',   // Public Read (needed for client subscription)
                    viewRule: '',   // Public Read
                    createRule: null, // Admin only
                    updateRule: null, // Admin only
                    deleteRule: null  // Admin only
                });

                // Create Initial Record
                const newRecord = await pb.collection('settings').create({
                    filter_province: "",
                    filter_district: "",
                    hide_zero_score: false
                });

                return {
                    id: newRecord.id,
                    filter_province: "",
                    filter_district: "",
                    hide_zero_score: false
                };

            } catch (createError) {
                console.error("Failed to create settings collection:", createError);
                throw createError;
            }
        }

        // Success case: Collection exists. 
        // OPTIONAL: Enforce public rules here just in case they were changed or created manually strict.
        // We'll run it asynchronously so it doesn't block the read.
        ensureCollectionsPublic().catch(err => console.error("Auto-fix permissions failed:", err));
        ensureCollectionsPublic().catch(err => console.error("Auto-fix permissions failed:", err));

        console.error("Error fetching settings:", error);
        return null; // Should not reach here because of the try/catch logic flow, checking logic again.
    }
}

// Ensure collections are public read so clients can subscribe
export async function ensureCollectionsPublic() {
    const pb = await getAdminPb();
    const collectionsToCheck = ['settings', 'candidates', 'areas'];

    for (const colName of collectionsToCheck) {
        try {
            const collection = await pb.collections.getOne(colName);
            let needsUpdate = false;
            let updateData = {};

            // 1. Specific Schema Checks
            if (colName === 'settings') {
                const schema = collection.schema || [];
                let schemaChanged = false;

                // Check hide_zero_score
                if (!schema.some(f => f.name === 'hide_zero_score')) {
                    schema.push({ name: 'hide_zero_score', type: 'bool' });
                    schemaChanged = true;
                }

                // Check remove_background
                if (!schema.some(f => f.name === 'remove_background')) {
                    schema.push({ name: 'remove_background', type: 'bool' });
                    schemaChanged = true;
                }

                if (schemaChanged) {
                    updateData.schema = schema;
                    needsUpdate = true;
                }
            }

            // 2. Ensure Public Rules
            if (collection.listRule !== "" || collection.viewRule !== "") {
                updateData.listRule = ""; // Public
                updateData.viewRule = ""; // Public
                needsUpdate = true;
            }

            // Apply Update
            if (needsUpdate) {
                await pb.collections.update(colName, updateData);
                console.log(`Updated ${colName} collection: Public Read / Schema Fix.`);
            }

        } catch (error) {
            console.error(`Error ensuring ${colName} public/schema:`, error);
        }
    }
}

export async function updateSettings(id, data) {
    const pb = await getAdminPb();
    try {
        await pb.collection('settings').update(id, data);
        return true;
    } catch (error) {
        console.error("Error updating settings:", error);
        return false;
    }
}
