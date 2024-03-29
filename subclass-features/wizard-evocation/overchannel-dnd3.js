try {
    if (args[0].workflow.overchannel) {
        let newDamageRolls = args[0].workflow.damageRolls;
        let newBonusDamageRolls = args[0].workflow.bonusDamageRolls;
        newDamageRolls.forEach(async r => {
            r.terms.forEach(t => { 
                if (!t.faces) return;
                t.results.forEach(d => {
                    if (d.result >= t.faces) return;
                    Object.assign(d, { rerolled: true, active: false });
                    t.results.push({ result: t.faces, active: true, hidden: true });
                    r._total = r._evaluateTotal();
                });
            });
        });
        newBonusDamageRolls.forEach(async r => {
            r.terms.forEach(t => { 
                if (!t.faces) return;
                t.results.forEach(d => {
                    if (d.result >= t.faces) return;
                    Object.assign(d, { rerolled: true, active: false });
                    t.results.push({ result: t.faces, active: true, hidden: true });
                    r._total = r._evaluateTotal();
                });
            });
        });
        if (newDamageRolls) await args[0].workflow.setDamageRolls(newDamageRolls);
        if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRolls(newBonusDamageRolls);
    }
    if (args[0].macroPass != "preDamageRollComplete" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || args[0].item.type != "spell" || !args[0].item.system.school || args[0].spellLevel == 0 || args[0].spellLevel > 5 || !["msak", "rsak", "save", "other"].includes(args[0].item.system.actionType) || args[0].damageRolls.find(r =>r.terms.find(t => ["healing", "temphp", "midi-none", ""].includes(t.flavor.toLowerCase()))) || !(((item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("wizard")) || (args[0].item.system.chatFlavor.toLowerCase().includes("wizard"))) || (!args[0].item.flags?.["tidy5e-sheet"]?.parentClass && !args[0].item.system.chatFlavor && ["prepared", "always"].includes(args[0].item.system?.preparation?.mode)))) return;
    const uses = args[0].actor.flags["midi-qol"]?.overchannel;
    const usesEffect = args[0].actor.effects.find(e => e.name.includes("Overchannel Fatigue"));
    let dialog = new Promise((resolve) => {
        new Dialog({
        title: "Overchannel",
        content: `
        <form id="use-form">
            <p>Use Overchannel to maximise damage?</p>
            ${uses ? "<p>(You have already used this ability " + uses + " time(s) since your last Long Rest. Using it again will inflict " + (+uses + 1) * args[0].spellLevel + "d12 Necrotic damage.)</p>" : ""}
        </form>
        `,
        buttons: {
            confirm: {
                icon: '<i class="fas fa-check"></i>',
                label: "Confirm",
                callback: () => {resolve(true)}
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: () => {resolve(false)}
            }
        },
        default: "cancel",
        close: () => {resolve(false)}
        }).render(true);
    });
    useFeat = await dialog;
    if (!useFeat) return;
    let newDamageRolls = args[0].workflow.damageRolls;
    let newBonusDamageRolls = args[0].workflow.bonusDamageRolls;
    if (newDamageRolls) newDamageRolls.forEach(async r => {
        r.terms.forEach(t => { 
            if (!t.faces) return;
            t.results.forEach(d => {
                if (d.result >= t.faces) return;
                Object.assign(d, { rerolled: true, active: false });
                t.results.push({ result: t.faces, active: true, hidden: true });
                r._total = r._evaluateTotal();
            });
        });
    });
    if (newBonusDamageRolls) newBonusDamageRolls.forEach(async r => {
        r.terms.forEach(t => { 
            if (!t.faces) return;
            t.results.forEach(d => {
                if (d.result >= t.faces) return;
                Object.assign(d, { rerolled: true, active: false });
                t.results.push({ result: t.faces, active: true, hidden: true });
                r._total = r._evaluateTotal();
            });
        });
    });
    if (newDamageRolls) await args[0].workflow.setDamageRolls(newDamageRolls);
    if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRolls(newBonusDamageRolls);
    if (uses && usesEffect) {
        const effectData = {
            changes: [{ key: "system.traits.dr.value", mode: 0, value: "-necrotic", priority: 20 }, { key: "system.traits.di.value", mode: 0, value: "-necrotic", priority: 20 }],
            name: "Overchannel Damage Override",
            origin: args[0].item.uuid,
            disabled: false,
            flags: { dae: { specialDuration: ["1Spell","isDamaged","endCombat"] } }
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        const itemData = {
            name: "Overchannel Fatigue",
            img: "icons/magic/water/projectile-ice-snowball.webp",
            type: "feat",
            system: {
                activation: { type: "special" },
                target: { type: "self" },
                actionType: "other",
                damage: { parts: [[`${(+uses + 1) * args[0].spellLevel}d12`, "necrotic"]] }
            },
            flags: { autoanimations: { isEnabled: true } }
        }
        const item = new CONFIG.Item.documentClass(itemData, { parent: args[0].actor });
        await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false });
        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].actor.uuid, updates: [{ _id: usesEffect.id, changes: [{ key: "flags.midi-qol.overchannel", mode: 0, value: +uses + 1, priority: 20 }] }] });
    } else {
        const effectData = {
            changes: [{ key: "flags.midi-qol.overchannel", mode: 0, value: 1, priority: 20 }],
            name: "Overchannel Fatigue",
            icon: "icons/magic/water/projectile-ice-snowball.webp",
            origin: args[0].item.uuid,
            disabled: false,
            flags: { dae: { specialDuration: ["longRest"] } }
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
    args[0].workflow.overchannel = false;
} catch (err) {console.error("Overchannel Macro - ", err)}