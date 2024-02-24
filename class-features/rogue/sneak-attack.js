try {
    if (args[0].workflow.sneakAttack) {
        const dice = args[0].actor.system.scale?.rogue?.["sneak-attack"];
        const diceMult = args[0].isCritical ? 2 : 1;
        return { damageRoll: `${dice * diceMult}d6`, flavor: "Sneak Attack" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].damageRoll || !["mwak", "rwak"].includes(args[0].item.system.actionType) || args[0].disadvantage || (args[0].item.system.actionType == "mwak" && !args[0].item.system.properties?.fin) || (game.combat && args[0].actor.effects.find(e => e.name == "Used Sneak Attack" && !e.disabled)) || !(args[0].advantage || canvas.tokens.placeables.find(t => t.actor && MidiQOL.typeOrRace(t.actor) && t !== args[0].workflow.token && t !== args[0].targets[0] && t?.document?.disposition == args[0].workflow.token?.document?.disposition && !MidiQOL.checkIncapacitated(t.actor) && MidiQOL.computeDistance(t, args[0].targets[0], false) < 10))) return;
    let useFeat = true;
    if (game.combat) {
        let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Sneak Attack",
            content: `<p>Use Sneak Attack?</p>`,
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
        useFeat = await dialog;
    }
    if (!useFeat) return;
    if (game.combat) {
        const effectData = {
            disabled: false,
            duration: { turns: 1, seconds: 1 },
            name: "Used Sneak Attack",
            icon: "icons/weapons/daggers/dagger-simple-pink.webp",
            flags: { dae: { specialDuration: ["combatEnd"] } }
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
    const dice = args[0].actor.system.scale?.rogue?.["sneak-attack"] ?? 1;
    const diceMult = args[0].isCritical ? 2 : 1;
    args[0].workflow.sneakAttack = true;
    return { damageRoll: `${dice * diceMult}d6`, flavor: "Sneak Attack" }
} catch (err) {console.error("Sneak Attack Macro - ", err)}