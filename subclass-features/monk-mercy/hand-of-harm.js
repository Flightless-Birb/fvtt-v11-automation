try {
    if (args[0].workflow.handOfHarm) {
        const faces = args[0].actor.system.scale?.monk?.die?.faces ?? 4;
        return { damageRoll: `${diceMult}d${faces}[necrotic] + ${args[0].actor.system.abilities.wis.mod}[necrotic]`, type: "necrotic", flavor: "Hand of Harm" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].item.name.includes("Unarmed Strike") || args[0].item.system.actionType != "mwak" || !(!game.combat || !args[0].actor.effects.find(e => e.name == "Used Hand of Harm" && !e.disabled))) {
        const usesItem = args[0].actor.items.find(i => i.name == "Ki" && i.system.uses.value);
        const level = actor?.classes?.monk?.system?.levels ?? 3;
        const faces = args[0].actor.system.scale?.monk?.die?.faces ?? 4;
        const noConsume = level > 10 && args[0].item.name.includes("Flurry of Blows");
        if (!usesItem && !noConsume) return;
        let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Hand of Harm",
            content: `
            <p>Use Hand of Harm to deal additional necrotic damage?</p>
            ${noConsume ? `<p>(${usesItem.system.uses.value} Ki Remaining)</p>` : ""}
            `,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => resolve(true)
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
        let useFeat = await dialog;
        if (!useFeat) return;
        if (game.combat) {
            const effectData = {
                disabled: false,
                flags: { dae: { specialDuration: ["turnStart", "combatEnd"] } },
                icon: "icons/equipment/hand/gauntlet-armored-blue.webp",
                name: "Used Hand of Harm",
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
        await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
        let diceMult = args[0].isCritical ? 2: 1;
        args[0].workflow.handOfHarm = true;
        return { damageRoll: `${diceMult}d${faces}[necrotic] + ${args[0].actor.system.abilities.wis.mod}[necrotic]`, type: "necrotic", flavor: "Hand of Harm" }
    }
} catch (err) {console.error("Hand of Harm Macro - ", err)}